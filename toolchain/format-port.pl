#!/usr/bin/env perl
#
# Format strings, made fit for TeaVM's formatter.
#
#   perl format-port.pl <java source root>            rewrite, then check
#   perl format-port.pl <java source root> --check    check only, write nothing
#   perl format-port.pl <java source root> --list     check only, and name every format read
#
# String.format, printf and formatted run on TeaVM's own java.util.Formatter,
# which knows fewer conversions than the JDK's:
#
#     %b %c %d %f %h %o %s %x  (and their capitals), and %%,
#     with an argument index (%2$s), the flags  - # + space 0 , ( <,
#     a width and a precision
#
# and nothing else. A conversion it does not know is an exception when the line
# RUNS, not when it is compiled. Futura's sea printed its timing every ten
# seconds, from inside its drawing, with a line ending in %n: from the tenth
# second on, every frame of a room by the sea stopped there. The room was black.
#
# So, in the working copy, before anything is compiled:
#
#   * %n, the line separator, is written as the newline it is in a browser;
#   * any other conversion TeaVM does not know stops the build, with the file
#     and the line. It is to be written another way in the program, or taught
#     to this script.
#
# Which strings are looked at: the format of every call of String.format,
# printf and formatted, and of any other format(...) whose format is written
# in the call. The format is found where the JDK takes it: the first argument,
# the second after a Locale, the string formatted() is called on. When it is a
# name, the script reads what the name is given in the same file. A format that
# is only known when the program runs cannot be read here: such calls are
# listed, so that nobody takes them for checked.
#
# A "%" anywhere else is nobody's conversion, and is left alone: the "100%" of
# a label, the "%n" of an argument.
#
# Exit status 0 when every format read is fit, 1 otherwise.
use strict;
use warnings;
use File::Find;
use File::Spec;

my ($root, $mode) = @ARGV;
die "usage: format-port.pl <java source root> [--check]\n" unless defined $root && -d $root;
my $list = defined $mode && $mode eq '--list';
my $check_only = $list || (defined $mode && $mode eq '--check');

# What TeaVM's formatter converts (TFormatter.FormatWriter.formatValue, 0.15.0).
my %KNOWN = map { $_ => 1 } split //, 'bBcCdDfhHoOsSxX%';

# One conversion, as the JDK writes it: %[index$][flags][width][.precision]kind, a date's kind being two letters.
my $CONVERSION = qr/%(?:\d+\$)?[-#+ 0,(<]*\d*(?:\.\d+)?(?:[tT].|.)/s;

my (@unknown, @unread);
my ($rewritten, $files, $calls, $read) = (0, 0, 0, 0);

# ── A file as tokens: what is a string, what is a comment, what is code ──

sub tokens {
    my ($text) = @_;
    my @t;                                  # [kind, start, text]; kinds: s string, c char, i name, p punctuation
    pos($text) = 0;
    while (pos($text) < length $text) {
        if ($text =~ /\G\s+/gc) { next }
        if ($text =~ m{\G//[^\n]*}gc) { next }
        if ($text =~ m{\G/\*.*?\*/}gcs) { next }
        if ($text =~ /\G"""(?:[^\\]|\\.)*?"""/gcs)   { push @t, ['s', $-[0], $&]; next }
        if ($text =~ /\G"(?:[^"\\\n]|\\.)*"/gc)      { push @t, ['s', $-[0], $&]; next }
        if ($text =~ /\G'(?:[^'\\\n]|\\.)*'/gc)      { push @t, ['c', $-[0], $&]; next }
        if ($text =~ /\G[A-Za-z_\$][A-Za-z0-9_\$]*/gc) { push @t, ['i', $-[0], $&]; next }
        if ($text =~ /\G[0-9][0-9A-Za-z_.]*/gc)      { push @t, ['n', $-[0], $&]; next }
        $text =~ /\G./gcs;
        push @t, ['p', $-[0], $&];
    }
    return \@t;
}

sub is_p { my ($tok, $p) = @_; return defined $tok && $tok->[0] eq 'p' && $tok->[2] eq $p }

# The index of the bracket closing the one at $open, or -1.
sub closing {
    my ($t, $open) = @_;
    my $depth = 0;
    for my $i ($open .. $#$t) {
        next unless $t->[$i][0] eq 'p';
        my $p = $t->[$i][2];
        if ($p eq '(' || $p eq '[' || $p eq '{') { $depth++ }
        elsif ($p eq ')' || $p eq ']' || $p eq '}') { $depth--; return $i if $depth == 0 }
    }
    return -1;
}

# The index of the bracket opening the one that closes at $close, or -1.
sub opening {
    my ($t, $close) = @_;
    my $depth = 0;
    for (my $i = $close; $i >= 0; $i--) {
        next unless $t->[$i][0] eq 'p';
        my $p = $t->[$i][2];
        if ($p eq ')' || $p eq ']' || $p eq '}') { $depth++ }
        elsif ($p eq '(' || $p eq '[' || $p eq '{') { $depth--; return $i if $depth == 0 }
    }
    return -1;
}

# The arguments between $open and $close, each as [first token, last token].
sub arguments {
    my ($t, $open, $close) = @_;
    my @args;
    my ($depth, $from) = (0, $open + 1);
    for my $i ($open + 1 .. $close - 1) {
        next unless $t->[$i][0] eq 'p';
        my $p = $t->[$i][2];
        if ($p eq '(' || $p eq '[' || $p eq '{') { $depth++ }
        elsif ($p eq ')' || $p eq ']' || $p eq '}') { $depth-- }
        elsif ($p eq ',' && $depth == 0) { push @args, [$from, $i - 1]; $from = $i + 1 }
    }
    push @args, [$from, $close - 1] if $from <= $close - 1;
    return @args;
}

# The strings an expression is made of: "a" + NAME + ("b" + "c"), a ? "x" : "y". Not the strings handed to a
# call inside it (text("key")), which are that call's business, nor those of an array or a lambda's body.
sub strings_in {
    my ($t, $from, $to) = @_;
    my @found;
    my $i = $from;
    while ($i <= $to) {
        my $tok = $t->[$i];
        if ($tok->[0] eq 's') { push @found, $i }
        elsif ($tok->[0] eq 'p' && ($tok->[2] eq '[' || $tok->[2] eq '{'
                || ($tok->[2] eq '(' && $i > $from && ($t->[$i - 1][0] eq 'i' || is_p($t->[$i - 1], ')')
                                                       || is_p($t->[$i - 1], ']'))))) {
            my $close = closing($t, $i);
            last if $close < 0 || $close > $to;
            $i = $close;
        }
        $i++;
    }
    return @found;
}

sub written { my ($t, $from, $to) = @_; return join('', map { $t->[$_][2] } $from .. $to) }

# A plain name, alone or after its class (FORMAT, Texts.FORMAT): the name, else undef.
sub name_of {
    my ($t, $from, $to) = @_;
    return undef if $to < $from || $t->[$to][0] ne 'i';
    for my $i ($from .. $to) {
        my $want_name = (($i - $from) % 2) == 0;
        return undef if $want_name ? $t->[$i][0] ne 'i' : !is_p($t->[$i], '.');
    }
    return $t->[$to][2];
}

# The strings a name is given in this file:  String NAME = "..." + "...";
sub strings_named {
    my ($t, $name) = @_;
    my @found;
    for my $i (1 .. $#$t - 1) {
        next unless $t->[$i][0] eq 'i' && $t->[$i][2] eq $name && is_p($t->[$i + 1], '=');
        next if is_p($t->[$i + 2], '=');                         # a comparison
        next unless $t->[$i - 1][0] eq 'i' && $t->[$i - 1][2] eq 'String';
        my $j = $i + 2;
        my $depth = 0;
        while ($j <= $#$t) {
            if ($t->[$j][0] eq 'p') {
                my $p = $t->[$j][2];
                if ($p eq '(' || $p eq '[' || $p eq '{') { $depth++ }
                elsif ($p eq ')' || $p eq ']' || $p eq '}') { $depth-- }
                last if $p eq ';' && $depth <= 0;
            }
            push @found, $j if $t->[$j][0] eq 's';
            $j++;
        }
    }
    return @found;
}

# ── One file ──

sub port_file {
    my ($path, $rel) = @_;
    open(my $in, '<:raw', $path) or return;
    local $/;
    my $text = <$in>;
    close $in;
    return unless $text =~ /\b(?:printf|format|formatted)\b/;

    my $t = tokens($text);
    my %format;                             # token index of a string that is (part of) a format
    my $line_of = sub { my ($at) = @_; return 1 + (substr($text, 0, $at) =~ tr/\n//) };

    for my $i (0 .. $#$t - 1) {
        my $tok = $t->[$i];
        next unless $tok->[0] eq 'i' && is_p($t->[$i + 1], '(');
        my $call = $tok->[2];
        next unless $call eq 'printf' || $call eq 'format' || $call eq 'formatted';
        next unless $i >= 1 && is_p($t->[$i - 1], '.');           # a call on something, not a method written here
        my $close = closing($t, $i + 1);
        next if $close < 0;
        my $on = $i >= 2 ? $t->[$i - 2] : undef;                  # what it is called on (its last token)
        next if $call eq 'format' && defined $on && $on->[0] eq 'i' && $on->[2] eq 'MessageFormat';

        my (@strings, $given);              # $given: the format as written, when it is not a string
        if ($call eq 'formatted') {
            if (defined $on && $on->[0] eq 's') { @strings = ($i - 2) }
            elsif (is_p($on, ')')) {
                my $open = opening($t, $i - 2);
                # ("a" + "b").formatted(..): the strings between the brackets. text().formatted(..): unknown.
                if ($open >= 1 && $t->[$open - 1][0] eq 'i') { $given = written($t, $open - 1, $i - 2) }
                elsif ($open >= 0) { @strings = strings_in($t, $open + 1, $i - 3) }
            }
            elsif (defined $on && $on->[0] eq 'i') {
                $given = $on->[2];
                @strings = strings_named($t, $given);
            }
        } else {
            my @args = arguments($t, $i + 1, $close);
            next unless @args;
            @strings = strings_in($t, @{$args[0]});
            if (!@strings) {
                my $first = written($t, @{$args[0]});
                my $which = ($first =~ /locale/i && @args > 1) ? 1 : 0;     # format(Locale, format, ...)
                @strings = strings_in($t, @{$args[$which]}) if $which;
                if (!@strings) {
                    $given = written($t, @{$args[$which]});
                    my $name = name_of($t, @{$args[$which]});
                    @strings = strings_named($t, $name) if defined $name;
                }
                # A Locale under a name that does not say so: format(where, "...", ...).
                if (!@strings && !$which && @args > 1) {
                    @strings = strings_in($t, @{$args[1]});
                }
            }
        }

        # String.format and printf are the formatter's for sure; so is formatted. Another format(...) is, when
        # its format is written in the call with a conversion in it; else it is a DecimalFormat's, a date's.
        my $sure = $call ne 'format' || (defined $on && $on->[0] eq 'i' && $on->[2] =~ /^(?:String|out|err)$/);
        if (!@strings) {
            if ($sure) {
                $given = '' unless defined $given;
                $given = substr($given, 0, 57) . '...' if length $given > 60;
                push @unread, sprintf("%s, line %d: %s(%s)", $rel, $line_of->($tok->[1]), $call, $given);
            }
            next;
        }
        if (!$sure) {
            next unless grep { $t->[$_][2] =~ /$CONVERSION/ } @strings;
        }
        $calls++;
        $format{$_} = 1 for @strings;
        printf("     %s, line %d: %s %s
", $rel, $line_of->($tok->[1]), $call,
               join(' + ', map { $t->[$_][2] } @strings)) if $list;
    }
    return unless %format;

    # The formats of this file: each conversion known, %n rewritten. From the end, so that offsets hold.
    my $changed = 0;
    for my $s (sort { $b <=> $a } keys %format) {
        my ($start, $literal) = ($t->[$s][1], $t->[$s][2]);
        $read++;
        my $fit = $literal;
        # %n is a conversion when an even number of "%" stand before it: "%%n" is a percent sign and an n.
        my $n = ($fit =~ s/(?<!%)((?:%%)*)%n/$1\\n/g);
        while ($fit =~ /(?<!%)(?:%%)*($CONVERSION)/g) {
            my $conversion = $1;
            next if $conversion eq '%%';
            my $kind = substr($conversion, -1);
            next if $kind eq '"';                                 # a "%" ending the string: no conversion at all
            # A date (%tY, %TH: a "t" and its letter) is none of the formatter's kinds, whatever the letter.
            if ($conversion =~ /[tT].\z/s || !$KNOWN{$kind}) {
                push @unknown, sprintf("%-8s %s, line %d", $conversion, $rel, $line_of->($start));
            }
        }
        if ($n && !$check_only) {
            substr($text, $start, length $literal) = $fit;
            $changed += $n;
        } elsif ($n) {
            push @unknown, sprintf("%-8s %s, line %d", '%n', $rel, $line_of->($start));
        }
    }
    if ($changed) {
        open(my $out, '>:raw', $path) or die "cannot write $path: $!\n";
        print $out $text;
        close $out;
        $rewritten += $changed;
        $files++;
    }
}

find({ no_chdir => 1, wanted => sub {
    return unless /\.java$/;
    my $rel = File::Spec->abs2rel($File::Find::name, $root);
    $rel =~ s{\\}{/}g;
    port_file($File::Find::name, $rel);
}}, $root);

if (@unknown) {
    print "\n";
    print "   A FORMAT CONVERSION THE BROWSER BUILD DOES NOT KNOW:\n";
    print "     $_\n" for sort @unknown;
    print "   TeaVM's formatter converts b c d f h o s x (and their capitals) and %%. Anything else\n";
    print "   compiles, and fails when the line runs. Write it another way in the program, or teach\n";
    print "   format-port.pl to rewrite it, as it does %n.\n";
    exit 1;
}
printf "   format strings: %d read in %d calls, each conversion one the build knows; %d newline conversion(s) rewritten in %d file(s)\n",
       $read, $calls, $rewritten, $files;
if (@unread) {
    printf "   %d format(s) known only when the program runs, not read:\n", scalar @unread;
    print "     $_\n" for sort @unread;
}
exit 0;
