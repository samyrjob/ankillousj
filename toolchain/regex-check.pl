#!/usr/bin/env perl
#
# Regular expressions the browser matches by recursion, found before anything is compiled.
#
#   perl regex-check.pl <java root>[,<java root>...] [<exemptions file>]
#   perl regex-check.pl --list <java root>[,<java root>...] [<exemptions file>]
#   perl regex-check.pl --self-test
#
# java.util.regex in a browser is TeaVM's (0.15, a port of Apache Harmony's). It repeats most
# things in a loop, as the JDK does. But a quantifier (*, +, {n,}, or {n,m} with m above 64)
# put on a term that is not a "leaf" is matched by recursion: one level of the browser's stack
# for each repetition. A long input then overflows the stack, and the call throws
# "RangeError: Maximum call stack size exceeded" where the desktop answers at once. Futura's
# plafonds were missing in the browser for one room: its answer held a "tiles" text of 2,498
# characters, read with "tiles":"([^"]*)".
#
# Not a leaf, in TeaVM:
#
#   * any group: ( ), (?: ), (?<name> ), the lookarounds, and a back reference (\1, \k<name>);
#   * a character class that may hold a character beyond the BMP: any negated class [^...],
#     or one holding \p{..} \P{..} \D \W \S \H \V, or such a character itself;
#   * the predefined classes \D \W \S \H \V \p{..} \P{..} on their own.
#
# A leaf, repeated in a loop: a literal, a positive class of BMP characters ([a-z0-9"]),
# \d \w \s, and the dot. "?" repeats at most once and is safe whatever it is put on.
#
# Where regexes are looked for: the first argument of Pattern.compile and Pattern.matches, and
# the regex of String's matches, replaceAll, replaceFirst and split. That argument may be a
# string, strings and other things joined with "+" (what is not a string stands for some plain
# text), or a final String named in the same file. A Pattern.compile whose regex is only known
# when the program runs cannot be read: it is listed, so that nobody takes it for checked.
#
# A regex that is recursive but only ever reads a short text is named in the exemptions file,
# one a line, with the reason:
#
#   <File.java> | <the string as written in the source, without its quotes> | <why its input is short>
#
# The file is its path under the source root (view/friend/FriendJoin.java), or its name alone.
# For a regex made of several strings, the string is the one holding the repeated part, or all
# of them written one after the other. The reason is what follows the last "|". Lines starting
# with "#" and blank lines are skipped. An exemption that matches no recursive regex any more is
# reported, and does not stop anything.
#
# Exit status 0 when every recursive regex is exempted (and always for --list), 1 otherwise.
use strict;
use warnings;
use File::Find;
use File::Spec;

binmode STDOUT, ':encoding(UTF-8)';

# Up to this many repetitions, a recursive repetition stays well inside any browser's stack.
my $BOUNDED = 64;

# A part of a regex that is not a string (a name, a call) stands for some plain text: a private
# use character, one per part, so that it can be shown again by what it was written as.
my $GAP = 0xE000;

# ── A file as tokens: what is a string, what is a comment, what is code (as format-port.pl) ──

sub tokens {
    my ($text) = @_;
    my @t;                                  # [kind, start, text]; kinds: s string, c char, i name, n number, p punctuation
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

# The tokens from $from to $to as they read: a space only where two words would run together.
sub written {
    my ($t, $from, $to) = @_;
    my $s = '';
    for my $i ($from .. $to) {
        $s .= ' ' if $i > $from && $t->[$i][0] =~ /^[in]$/ && $t->[$i - 1][0] =~ /^[in]$/;
        $s .= $t->[$i][2];
    }
    return $s;
}

# A plain name, alone or after its class (VALUE, Texts.VALUE): the name, else undef.
sub name_of {
    my ($t, $from, $to) = @_;
    return undef if $to < $from || $t->[$to][0] ne 'i';
    for my $i ($from .. $to) {
        my $want_name = (($i - $from) % 2) == 0;
        return undef if $want_name ? $t->[$i][0] ne 'i' : !is_p($t->[$i], '.');
    }
    return $t->[$to][2];
}

# What a final String of this file is given:  final String NAME = <expression>;  as
# [first token, last token]. Undef when the name is not such a String, or is declared more than
# once (which one a call means is then a question of scope, not read here).
sub definition {
    my ($t, $name) = @_;
    my @found;
    for my $i (2 .. $#$t - 2) {
        next unless $t->[$i][0] eq 'i' && $t->[$i][2] eq $name && is_p($t->[$i + 1], '=');
        next if is_p($t->[$i + 2], '=');                          # a comparison
        next unless $t->[$i - 1][0] eq 'i' && $t->[$i - 1][2] eq 'String';
        my $final = 0;                                            # among the modifiers before the type
        for (my $k = $i - 2; $k >= 0 && $t->[$k][0] eq 'i'; $k--) { $final = 1 if $t->[$k][2] eq 'final' }
        next unless $final;
        my ($j, $depth) = ($i + 2, 0);
        while ($j <= $#$t) {
            if ($t->[$j][0] eq 'p') {
                my $p = $t->[$j][2];
                if ($p eq '(' || $p eq '[' || $p eq '{') { $depth++ }
                elsif ($p eq ')' || $p eq ']' || $p eq '}') { $depth-- }
                last if ($p eq ';' || $p eq ',') && $depth <= 0;
            }
            $j++;
        }
        push @found, [$i + 2, $j - 1];
    }
    return @found == 1 ? $found[0] : undef;
}

# The parts a regex argument is made of, in order: ['lit', string as written] or ['expr', what it
# is written as]. Undef when it cannot be read as one text: a choice (a ? "x" : "y").
sub pieces {
    my ($t, $from, $to, $depth) = @_;
    return undef if $to < $from || $depth > 8;
    my (@parts, $level);
    my $start = $from;
    $level = 0;
    for my $k ($from .. $to) {
        next unless $t->[$k][0] eq 'p';
        my $p = $t->[$k][2];
        if ($p eq '(' || $p eq '[' || $p eq '{') { $level++ }
        elsif ($p eq ')' || $p eq ']' || $p eq '}') { $level-- }
        elsif ($level == 0 && ($p eq '?' || $p eq ':')) { return undef }
        elsif ($level == 0 && $p eq '+') { push @parts, [$start, $k - 1]; $start = $k + 1 }
    }
    push @parts, [$start, $to];
    my @out;
    for my $part (@parts) {
        my ($a, $b) = @$part;
        return undef if $b < $a;
        if ($a == $b && ($t->[$a][0] eq 's' || $t->[$a][0] eq 'c')) { push @out, ['lit', $t->[$a][2]]; next }
        if (is_p($t->[$a], '(') && closing($t, $a) == $b) {
            my $inner = pieces($t, $a + 1, $b - 1, $depth + 1);
            if ($inner) { push @out, @$inner; next }
        }
        my $name = name_of($t, $a, $b);
        if (defined $name) {
            my $def = definition($t, $name);
            my $inner = $def ? pieces($t, @$def, $depth + 1) : undef;
            if ($inner) { push @out, @$inner; next }
        }
        push @out, ['expr', written($t, $a, $b)];
    }
    return \@out;
}

# ── Java's escapes: a string literal as the program has it ──

sub java_unescape {
    my ($e) = @_;
    return chr(hex(substr($e, -4))) if $e =~ /^u+[0-9A-Fa-f]{4}$/;
    if ($e =~ /^[0-7]+$/) {
        # \0 to \377: a third digit only after a first one of 0 to 3.
        return chr(oct(substr($e, 0, 2))) . substr($e, 2) if length $e == 3 && substr($e, 0, 1) gt '3';
        return chr(oct($e));
    }
    my %plain = (b => "\x08", t => "\t", n => "\n", f => "\f", r => "\r", s => ' ', "\n" => '');
    return exists $plain{$e} ? $plain{$e} : $e;
}

# The string a literal ("...", '.', or a text block) stands for.
sub java_string {
    my ($raw) = @_;
    my $s = inner($raw);
    $s =~ s/^[ \t]*\r?\n// if $raw =~ /^"""/;
    $s =~ s/\\(u+[0-9A-Fa-f]{4}|[0-7]{1,3}|.)/java_unescape($1)/ges;
    return $s;
}

# A literal as written, without its quotes.
sub inner {
    my ($raw) = @_;
    my $q = $raw =~ /^"""/ ? 3 : 1;
    return substr($raw, $q, length($raw) - 2 * $q);
}

# ── A regex, read the way TeaVM builds it ──

# The end of the escape at $i (the index after it), why it is not a leaf (undef when it is), and
# whether it is a character beyond the BMP (or half of one).
sub escape {
    my ($c, $i) = @_;
    my $e = $c->[$i + 1];
    return ($i + 1, undef, 0) unless defined $e;
    if ($e eq 'Q') {                                              # \Q...\E: plain text
        my $k = $i + 2;
        $k++ while $k < @$c && !($c->[$k] eq '\\' && defined $c->[$k + 1] && $c->[$k + 1] eq 'E');
        return ($k < @$c ? $k + 2 : $k, undef, 0);
    }
    if ($e eq 'p' || $e eq 'P') {
        my $k = $i + 2;
        if (defined $c->[$k] && $c->[$k] eq '{') { $k++ while $k < @$c && $c->[$k] ne '}'; $k++ }
        else { $k++ }
        return ($k, "\\$e\{..\}", 0);
    }
    return ($i + 2, "\\$e", 0) if $e =~ /^[DWSHVRX]$/;
    if ($e =~ /^[1-9]$/) {
        my $k = $i + 2;
        $k++ while $k < @$c && $c->[$k] =~ /^[0-9]$/;
        return ($k, 'a back reference', 0);
    }
    if ($e eq 'k') {
        my $k = $i + 2;
        $k++ while $k < @$c && $c->[$k] ne '>';
        return ($k + 1, 'a back reference', 0);
    }
    if ($e eq 'x') {
        my $k = $i + 2;
        if (defined $c->[$k] && $c->[$k] eq '{') {
            my $hex = '';
            $k++;
            while ($k < @$c && $c->[$k] ne '}') { $hex .= $c->[$k]; $k++ }
            return ($k + 1, undef, ($hex =~ /^[0-9A-Fa-f]+$/ && hex($hex) > 0xFFFF) ? 1 : 0);
        }
        return ($i + 4, undef, 0);
    }
    if ($e eq 'u') {
        my $hex = join('', grep { defined } @$c[$i + 2 .. $i + 5]);
        my $v = $hex =~ /^[0-9A-Fa-f]{4}$/ ? hex($hex) : 0;
        return ($i + 6, undef, ($v >= 0xD800 && $v <= 0xDFFF) ? 1 : 0);
    }
    if ($e eq '0') {
        my $k = $i + 2;
        $k++ while $k < @$c && $k < $i + 5 && $c->[$k] =~ /^[0-7]$/;
        return ($k, undef, 0);
    }
    return ($i + 3, undef, 0) if $e eq 'c';
    return ($i + 2, undef, 0);
}

sub beyond_bmp { my ($ch) = @_; my $o = ord $ch; return $o > 0xFFFF || ($o >= 0xD800 && $o <= 0xDFFF) }

# The class opening at $i: the index after it, and why it is not a leaf (undef when it is).
sub class_at {
    my ($c, $i) = @_;
    my $k = $i + 1;
    my $why;
    if (defined $c->[$k] && $c->[$k] eq '^') { $why = 'a negated class'; $k++ }
    my $first = 1;
    while ($k < @$c) {
        my $ch = $c->[$k];
        if ($ch eq ']' && !$first) { return ($k + 1, $why) }
        if ($ch eq '[') {
            my ($end, $nested) = class_at($c, $k);
            $why //= $nested;
            $k = $end;
        } elsif ($ch eq '\\') {
            my ($end, $not_leaf, $wide) = escape($c, $k);
            $why //= "a class holding $not_leaf" if defined $not_leaf;
            $why //= 'a class holding a character beyond the BMP' if $wide;
            # \Q...\E inside a class: its characters count as any other.
            if ($c->[$k + 1] && $c->[$k + 1] eq 'Q') {
                $why //= 'a class holding a character beyond the BMP' if grep { beyond_bmp($_) } @$c[$k + 2 .. $end - 1];
            }
            $k = $end;
        } else {
            $why //= 'a class holding a character beyond the BMP' if beyond_bmp($ch);
            $k++;
        }
        $first = 0;
    }
    return ($k, $why);
}

# The group opening at $i: the index of its ")" (the end of the regex when it has none).
sub group_end {
    my ($c, $i) = @_;
    my $depth = 0;
    my $k = $i;
    while ($k < @$c) {
        my $ch = $c->[$k];
        if ($ch eq '\\') { ($k) = escape($c, $k); next }
        if ($ch eq '[' && $k > $i) { ($k) = class_at($c, $k); next }
        if ($ch eq '(') { $depth++ }
        elsif ($ch eq ')') { return $k if --$depth == 0 }
        $k++;
    }
    return scalar @$c;
}

# The quantifier at $i: the index after it (with its ? or + suffix), and whether it may repeat
# more than $BOUNDED times. ($i, 0) when there is none.
sub quantifier {
    my ($c, $i) = @_;
    return ($i, 0) if $i >= @$c;
    my ($end, $repeats);
    my $q = $c->[$i];
    if ($q eq '*' || $q eq '+') { ($end, $repeats) = ($i + 1, 1) }
    elsif ($q eq '?') { ($end, $repeats) = ($i + 1, 0) }
    elsif ($q eq '{') {
        my $last = $i + 40 < $#$c ? $i + 40 : $#$c;
        my $rest = join('', @$c[$i .. $last]);
        return ($i, 0) unless $rest =~ /^\{([0-9]+)(?:(,)([0-9]*))?\}/;
        my ($low, $comma, $high, $length) = ($1, $2, $3, length $&);
        my $max = !defined $comma ? $low : ($high eq '' ? undef : $high);
        ($end, $repeats) = ($i + $length, (!defined $max || $max > $BOUNDED) ? 1 : 0);
    }
    else { return ($i, 0) }
    $end++ if $end < @$c && ($c->[$end] eq '?' || $c->[$end] eq '+');      # reluctant, possessive
    return ($end, $repeats);
}

# The term at $i: the index after it, and why it is not a leaf (undef when it is). What a group
# holds is read too, its findings added to $bad.
sub term {
    my ($c, $i, $bad) = @_;
    my $ch = $c->[$i];
    if ($ch eq '(') {
        my $close = group_end($c, $i);
        my $rest = join('', @$c[$i .. ($close < @$c ? $close : $#$c)]);
        return ($close + 1, undef) if $rest =~ /^\(\?[a-zA-Z-]*\)/;              # (?i): flags, no group
        my $prefix = 1;
        if ($rest =~ /^\(\?(?:[:=!>]|<[=!]|<[A-Za-z][A-Za-z0-9]*>|[a-zA-Z-]*:)/) { $prefix = length $& }
        my $inside = join('', @$c[$i + $prefix .. $close - 1]);
        push @$bad, scan($inside);
        return ($close + 1, 'a group');
    }
    return class_at($c, $i) if $ch eq '[';
    if ($ch eq '\\') {
        my ($end, $why) = escape($c, $i);
        return ($end, $why);
    }
    return ($i + 1, undef);                                       # a literal, the dot
}

# What, in a regex, the browser repeats by recursion: a list of [the part, why it is not a leaf].
sub scan {
    my ($re) = @_;
    my @c = split //, $re;
    my @bad;
    my $i = 0;
    while ($i < @c) {
        my $ch = $c[$i];
        if ($ch eq '|' || $ch eq '^' || $ch eq '$' || $ch eq ')') { $i++; next }
        my ($end, $why) = term(\@c, $i, \@bad);
        $end = $i + 1 if $end <= $i;
        my ($after, $repeats) = quantifier(\@c, $end);
        push @bad, [join('', @c[$i .. $after - 1]), $why] if $repeats && defined $why;
        $i = $after;
    }
    return @bad;
}

# ── The regexes of a file ──

# A regex as it can be printed on one line: a newline or a tab in it written as Java writes them.
sub visible {
    my ($s) = @_;
    my %name = ("\n" => '\n', "\r" => '\r', "\t" => '\t');
    $s =~ s/([\x00-\x1F\x7F])/exists $name{$1} ? $name{$1} : sprintf('\x%02X', ord $1)/ge;
    return $s;
}

# Every regex the file hands to java.util.regex, each a hash: line, call, regex (as matched, a gap
# character for each part that is not a string), shown (the same, gaps written out), raw (each
# string as written), bad (what is repeated by recursion). And the calls not read.
sub regexes_in {
    my ($text, $rel) = @_;
    my (@found, @unread);
    return (\@found, \@unread) unless $text =~ /\b(?:compile|matches|replaceAll|replaceFirst|split)\s*\(/;
    my $t = tokens($text);
    my @newline;
    while ($text =~ /\n/g) { push @newline, pos($text) - 1 }
    my $line_of = sub {
        my ($at) = @_;
        my ($lo, $hi) = (0, scalar @newline);
        while ($lo < $hi) {
            my $mid = int(($lo + $hi) / 2);
            if ($newline[$mid] < $at) { $lo = $mid + 1 } else { $hi = $mid }
        }
        return $lo + 1;
    };
    for my $i (2 .. $#$t - 1) {
        my $tok = $t->[$i];
        next unless $tok->[0] eq 'i' && is_p($t->[$i + 1], '(') && is_p($t->[$i - 1], '.');
        my $call = $tok->[2];
        next unless $call =~ /^(?:compile|matches|replaceAll|replaceFirst|split)$/;
        my $on_pattern = $t->[$i - 2][0] eq 'i' && $t->[$i - 2][2] eq 'Pattern';
        my $close = closing($t, $i + 1);
        next if $close < 0;
        my @args = arguments($t, $i + 1, $close);
        # Pattern's are regexes for sure. String's matches(regex), replaceAll(regex, with),
        # replaceFirst(regex, with) and split(regex[, limit]) are told by their arguments; another
        # method of the same name (a Matcher's replaceAll(with)) only when its regex is a string.
        my ($sure, $fits);
        if ($call eq 'compile') { next unless $on_pattern; ($sure, $fits) = (1, @args >= 1) }
        elsif ($call eq 'matches' && $on_pattern) { ($sure, $fits) = (1, @args == 2) }
        elsif ($call eq 'matches') { $fits = @args == 1 }
        elsif ($call eq 'split') { $fits = @args == 1 || @args == 2 }
        else { $fits = @args == 2 }
        next unless $fits;
        my $line = $line_of->($tok->[1]);
        my $shown_call = ($on_pattern ? 'Pattern.' : '.') . $call;
        my $pieces = pieces($t, @{$args[0]}, 0);
        if (!$pieces || !grep { $_->[0] eq 'lit' } @$pieces) {
            push @unread, sprintf("%s, line %d: %s(%s)", $rel, $line, $shown_call, written($t, @{$args[0]})) if $sure;
            next;
        }
        my ($regex, $shown) = ('', '');
        my (@raw, @values, @gaps);
        for my $p (@$pieces) {
            if ($p->[0] eq 'lit') {
                my $value = java_string($p->[1]);
                $regex .= $value;
                $shown .= visible($value);
                push @raw, inner($p->[1]);
                push @values, $value;
            } else {
                $regex .= chr($GAP + @gaps);
                $shown .= "<$p->[1]>";
                push @gaps, $p->[1];
            }
        }
        my $show_gaps = sub {
            my ($s) = @_;
            $s =~ s/([\x{E000}-\x{F8FF}])/defined $gaps[ord($1) - $GAP] ? "<$gaps[ord($1) - $GAP]>" : $1/ge;
            return $s;
        };
        my @parts = scan($regex);
        my @bad = map { [visible($show_gaps->($_->[0])), $_->[1]] } @parts;
        # What an exemption would name: the string holding the first repeated part, else them all.
        my $name = join('', @raw);
        if (@parts) {
            for my $k (0 .. $#values) {
                if (index($values[$k], $parts[0][0]) >= 0) { $name = $raw[$k]; last }
            }
        }
        push @found, { file => $rel, line => $line, call => $shown_call, regex => $regex,
                       shown => $shown, raw => \@raw, bad => \@bad, name => $name };
    }
    return (\@found, \@unread);
}

# ── Exemptions ──

# [file, string as written, reason, line in the exemptions file], and the lines that are none.
sub read_exemptions {
    my ($path) = @_;
    my (@ok, @wrong);
    return (\@ok, \@wrong) unless defined $path && -f $path;
    open(my $fh, '<:encoding(UTF-8)', $path) or return (\@ok, \@wrong);
    my $n = 0;
    while (my $line = <$fh>) {
        $n++;
        $line =~ s/\r?\n\z//;
        next if $line =~ /^\s*(?:#|$)/;
        my $ok = exemption($line);
        if ($ok) { push @ok, [@$ok, $n] } else { push @wrong, "line $n: $line" }
    }
    close $fh;
    return (\@ok, \@wrong);
}

# One line of the exemptions file as [file, string, reason], or undef when it is not one.
sub exemption {
    my ($line) = @_;
    # The string may hold "|" itself: the file is before the first, the reason after the last.
    my ($file, $literal, $why) = $line =~ /^\s*([^|]*?)\s*\|\s*(.*?)\s*\|([^|]*)$/;
    return undef unless defined $why && length $file && length $literal && $why =~ /\S/;
    $why =~ s/^\s+|\s+$//g;
    return [$file, $literal, $why];
}

# Whether an exemption names this regex: its file, and one of its strings or all of them together.
sub exempts {
    my ($ok, $found) = @_;
    my ($file, $literal) = @$ok;
    my $same_file = $file =~ m{/} ? $found->{file} eq $file : ($found->{file} =~ m{(?:^|/)\Q$file\E$});
    return 0 unless $same_file;
    return 1 if join('', @{$found->{raw}}) eq $literal;
    return scalar grep { $_ eq $literal } @{$found->{raw}};
}

# ── --self-test: the rules, on a table ──

sub self_test {
    my $failed = 0;
    # Each row: what the browser does, then the regex as a Java string literal holds it.
    my $rows = <<'ROWS';
iterative  [a-z]*
recursive  [^\"]*
iterative  \"heightPx\":([0-9]+)
recursive  \"heightPx\":([0-9]+),\"tiles\":\"([^\"]*)\"
recursive  (ab)*
recursive  (?:ab)+
recursive  (?<name>ab)*
recursive  (?i:ab)*
iterative  (ab)?
iterative  (ab){2}
iterative  (ab){0,64}
recursive  (ab){0,65}
recursive  (ab){3,}
recursive  (ab){65}
recursive  [^\"]*?
recursive  [^\"]*+
recursive  [^\"]+
recursive  \\S+
iterative  \\s+
iterative  \\d*
recursive  \\D*
recursive  \\W+
recursive  \\H*
recursive  \\V*
recursive  \\p{L}+
recursive  \\P{L}+
recursive  [\\p{L}]+
recursive  [a-z\\S]+
iterative  [\\w\\-]+
iterative  [\\s\\d]*
recursive  [a-z&&[^aeiou]]+
recursive  [\\uD83D\\uDE00]+
recursive  [\\x{1F600}]+
iterative  .*
iterative  .*?
iterative  (.*?)
iterative  \"(\\d+)\"\\s*:\\s*\\[(.*?)\\]
recursive  \\{[^{}]*\\}
recursive  <[^>]*>
iterative  [^\"]
iterative  [^\"]?
iterative  [^a]{0,10}
recursive  [^a]{100}
iterative  \\Q(a)*\\E
iterative  [(]*
iterative  [{}]*
iterative  \\(a\\)*
iterative  [\\]]*
iterative  (a|b)
iterative  a{5}
recursive  x*|(y)+
recursive  (a)\\1+
iterative  (?i)abc*
iterative  \\.
iterative  [\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]
iterative  ^[a-z]{2}-[0-9]{1,4}-[0-9a-f]{6}$
iterative  ^:[a-z][A-Za-z0-9_-]+(\\s.*)?$
recursive  ((?:[^\"\\\\]|\\\\.)*)
iterative  \\},\\s*\\{
iterative  [\\r\\n]+
iterative  [_ ]+
ROWS
    for my $row (split /\n/, $rows) {
        next unless $row =~ /^(recursive|iterative)\s+(.*)$/;
        my ($want, $literal) = ($1, $2);
        my @bad = scan(java_string("\"$literal\""));
        my $got = @bad ? 'recursive' : 'iterative';
        my $ok = $got eq $want;
        $failed++ unless $ok;
        printf "   %s  %-9s %s%s\n", $ok ? 'PASS' : 'FAIL', $want, $literal,
               $ok ? '' : "   (read as $got" . (@bad ? ': ' . join(', ', map { $_->[0] } @bad) : '') . ')';
    }

    # Where regexes are found, on a file written for it: one verdict per call found, in order.
    my $java = <<'JAVA';
class Fixture {
    private static final String VALUE = "\"([^\"]*)\"";
    private static final Pattern A = Pattern.compile("\\{[^{}]*\\}");
    private static final Pattern B = Pattern.compile("\"x\"\\s*:\\s*(\\d+)", Pattern.DOTALL);
    static void f(String key, String s, Matcher m, boolean flag) {
        Pattern.compile("\"" + key + "\"\\s*:\\s*" + VALUE);
        s.split(",");
        s.split("\\s+", 2);
        s.replaceAll("<[^>]*>", "");
        m.replaceAll("$1");
        s.matches("(ab)+");
        Pattern.matches("[0-9]+", s);
        Pattern.compile(s);
        String js = "x.split('&')";
        // s.split("(a)*") in a comment
        Pattern.compile(flag ? "a" : "(b)*");
    }
}
JAVA
    my ($found, $unread) = regexes_in($java, 'view/Fixture.java');
    my $got = join(' ', map { @{$_->{bad}} ? 'R' : 'I' } @$found);
    my $want = 'R I R I I R R I';
    my $nth = sub { return $found->[$_[0]] // { file => '', raw => [] } };
    # The strings as the fixture writes them (Perl's single quotes keep a backslash before anything
    # but a backslash or a quote).
    my $object = '\\\\{[^{}]*\\\\}';                 # \\{[^{}]*\\}
    my $value  = '\"([^\"]*)\"';                     # \"([^\"]*)\"
    my @checks = (
        ['calls found, each recursive (R) or not (I)', $got, $want],
        ['Pattern.compile calls known only at run time', scalar @$unread, 2],
        ['line of the first regex', $nth->(0)->{line} // 0, 3],
        ['exempted by its string', exempts(['view/Fixture.java', $object], $nth->(0)) ? 1 : 0, 1],
        ['exempted by its file name alone', exempts(['Fixture.java', $object], $nth->(0)) ? 1 : 0, 1],
        ['exempted by one of its strings', exempts(['Fixture.java', $value], $nth->(2)) ? 1 : 0, 1],
        ['not exempted from another file', exempts(['Other.java', $object], $nth->(0)) ? 1 : 0, 0],
        ['not exempted by another string', exempts(['Fixture.java', '<[^>]*>'], $nth->(0)) ? 1 : 0, 0],
        ['an exemption whose string holds "|"', join(' / ', @{exemption('A.java | (a|b)* | short, one word') || []}),
         'A.java / (a|b)* / short, one word'],
        ['an exemption with no reason is none', exemption('A.java | (a)* |  ') ? 1 : 0, 0],
        ['what the build says to exempt', $nth->(2)->{name} // '', $value],
    );
    for my $check (@checks) {
        my ($what, $have, $expected) = @$check;
        my $ok = defined $have && $have eq $expected;
        $failed++ unless $ok;
        printf "   %s  %s: %s%s\n", $ok ? 'PASS' : 'FAIL', $what, $expected, $ok ? '' : "   (got $have)";
    }
    print $failed ? "   $failed row(s) FAILED\n" : "   all rows pass\n";
    return $failed ? 1 : 0;
}

# ── Main ──

my $USAGE = "usage: regex-check.pl [--list] <java root>[,<java root>...] [<exemptions file>]\n"
          . "       regex-check.pl --self-test\n";

if (@ARGV && $ARGV[0] eq '--self-test') { exit self_test() }
my $list = @ARGV && $ARGV[0] eq '--list';
shift @ARGV if $list;
my ($roots, $ok_file) = @ARGV;
die $USAGE unless defined $roots && length $roots;
my @roots = grep { length } split /,/, $roots;
for my $r (@roots) { die "no such directory: $r\n$USAGE" unless -d $r }

# The files as the build will have them: a later root's file takes the place of an earlier one's
# with the same path (the overlay replaces a program file; that file never reaches the build).
my %path;
for my $root (@roots) {
    find({ no_chdir => 1, wanted => sub {
        return unless /\.java$/;
        my $rel = File::Spec->abs2rel($File::Find::name, $root);
        $rel =~ s{\\}{/}g;
        $path{$rel} = $File::Find::name;
    }}, $root);
}

my ($exemptions, $wrong) = read_exemptions($ok_file);
my (%used, @problems, @all, @unread_all);
my ($read, $files_with, $exempted) = (0, 0, 0);
for my $rel (sort keys %path) {
    open(my $in, '<:encoding(UTF-8)', $path{$rel}) or next;
    local $/;
    my $text = <$in>;
    close $in;
    my ($found, $unread) = regexes_in($text, $rel);
    push @unread_all, @$unread;
    next unless @$found;
    $files_with++;
    for my $f (@$found) {
        $read++;
        my $by;
        if (@{$f->{bad}}) {
            ($by) = grep { exempts($_, $f) } @$exemptions;
            if ($by) { $used{$by->[3]} = 1; $exempted++ }
            else { push @problems, $f }
        }
        push @all, [$f, $by];
    }
}

if ($list) {
    for my $entry (@all) {
        my ($f, $by) = @$entry;
        my $verdict = @{$f->{bad}} ? 'recursive' : 'iterative';
        printf "   %-9s %s, line %d: %s\n", $verdict, $f->{file}, $f->{line}, $f->{shown};
        printf "             repeated by recursion: %s (%s)\n", $_->[0], $_->[1] for @{$f->{bad}};
        printf "             exempted: %s\n", $by->[2] if $by;
    }
}

if (@$wrong) {
    print "\n   AN EXEMPTION IS NOT WRITTEN  <File.java> | <the string as written> | <why its input is short>:\n";
    print "     $_\n" for @$wrong;
    exit 1 unless $list;
}
for my $ok (@$exemptions) {
    next if $used{$ok->[3]};
    printf "   (an exemption matches no recursive regex any more, line %d of %s: %s | %s)\n",
           $ok->[3], $ok_file, $ok->[0], $ok->[1];
}

if (@problems && !$list) {
    print "\n";
    print "   REGEX THE BROWSER MATCHES RECURSIVELY:\n";
    for my $f (@problems) {
        printf "     %s, line %d: %s(%s)\n", $f->{file}, $f->{line}, $f->{call}, $f->{shown};
        printf "       repeated by recursion: %s   (%s, repeated)\n", $_->[0], $_->[1] for @{$f->{bad}};
        printf "       to exempt it:  %s | %s | <why its input is always short>\n", $f->{file}, $f->{name};
    }
    print "   In the browser, a group or a class such as [^\"] repeated by * or + is matched by recursion,\n";
    print "   one level of the stack per repetition: a long text overflows it (\"Maximum call stack size\n";
    print "   exceeded\") where the desktop answers at once. Read the text without a regex (a JSON answer:\n";
    print "   its tree, JsonParser.parseString), or repeat a leaf instead ([^\"]* is a negated class; a\n";
    print "   positive one is a leaf). When what it reads is always short, name it in the project's\n";
    print "   regex-ok.txt with the reason.\n";
    exit 1;
}
if ($list) {
    printf "   regular expressions: %d read in %d file(s); %d repeated by recursion, %d of them exempted\n",
           $read, $files_with, scalar(@problems) + $exempted, $exempted;
} else {
    printf "   regular expressions: %d read in %d file(s), none the browser repeats by recursion%s\n",
           $read, $files_with, $exempted ? " but the $exempted exempted" : '';
}
if (@unread_all) {
    printf "   %d regex(es) known only when the program runs, not read:\n", scalar @unread_all;
    print "     $_\n" for @unread_all;
}
exit 0;
