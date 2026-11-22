#!/usr/bin/env perl
#
# Checks, before anything is compiled, what the program hands to its JSON library.
#
#   perl json-check.pl <java source root> [<file naming what is deliberately not read>]
#
# On a desktop Gson looks inside any class by itself (reflection): a class it was never told
# about, a field added last week, all of it is read by name. Here nothing looks inside a class;
# a type is read by the reader registered for it (JsonReaders.register) and written by its
# writer (JsonWriters.register). What nobody wrote does not fail at the build. It fails in the
# tab, the day a player reaches it -- or worse, says nothing: a field the reader does not name
# simply stays empty (a room with stairs drawn flat, because nobody read "heightmap").
#
# So three things are looked for in the sources, and each stops the build:
#
#   1. a type the program READS with no reader   -- a call that ends with a class literal:
#                                                   fromJson(text, Room.class), getList(path, Room[].class)
#   2. a type the program WRITES with no writer  -- toJson(new Something(...))
#   3. a field its reader does not read          -- every field Gson would fill (not static, not
#                                                   transient) must be named, in quotes, by the reader
#
# The file given second lists what is left out on purpose, one name a line, "#" for the reason:
# a type read only by code nothing calls ("FriendRequest"), a field ("Room.someField").
#
# Exit status 0 when all is in order, 1 otherwise.
use strict;
use warnings;
use File::Find;
use File::Spec;

my ($root, $allow_file) = @ARGV;
die "usage: json-check.pl <java source root> [<not-read file>]\n" unless defined $root && -d $root;

my %allowed;
if (defined $allow_file && open(my $fh, '<', $allow_file)) {
    while (my $line = <$fh>) {
        $line =~ s/#.*//;
        $line =~ s/\s+//g;
        $allowed{$line} = 1 if length $line;
    }
    close $fh;
}

# What a reader or a writer never has to be written for: the library's own trees, and what
# describes itself.
my %READ_ALONE  = map { $_ => 1 } qw(JsonElement JsonObject JsonArray JsonPrimitive String Object);
my %WRITE_ALONE = map { $_ => 1 } qw(JsonObject JsonArray HashMap LinkedHashMap TreeMap ArrayList LinkedList HashSet);

# ── the sources, comments taken out (the JSON library's own files are not the program) ──
my %text;
find({ no_chdir => 1, wanted => sub {
    return unless /\.java$/;
    my $rel = File::Spec->abs2rel($File::Find::name, $root);
    $rel =~ s{\\}{/}g;
    return if $rel =~ m{^json/};
    open(my $fh, '<:encoding(UTF-8)', $File::Find::name) or return;
    local $/;
    my $t = <$fh>;
    close $fh;
    $t =~ s{/\*.*?\*/}{}gs;
    $t =~ s{(^|[\s;{}])//[^\n]*}{$1}gm;
    $text{$rel} = $t;
}}, $root);

sub simple { my ($name) = @_; $name =~ s/.*\.//; return $name; }

# The text from an opening brace to the one that closes it, both left out. $from: the offset
# of the opening brace. Empty when the braces do not balance.
sub braced {
    my ($t, $from) = @_;
    my $depth = 0;
    for (my $i = $from; $i < length $t; $i++) {
        my $c = substr($t, $i, 1);
        if ($c eq '{') { $depth++; }
        elsif ($c eq '}') { return substr($t, $from + 1, $i - $from - 1) if --$depth == 0; }
    }
    return '';
}

# A list cut at its commas, those inside <...> or (...) left alone.
sub at_commas {
    my ($s) = @_;
    my @parts;
    my ($depth, $current) = (0, '');
    for my $c (split //, $s) {
        if ($c eq '<' || $c eq '(') { $depth++; }
        elsif ($c eq '>' || $c eq ')') { $depth--; }
        if ($c eq ',' && $depth == 0) { push @parts, $current; $current = ''; next; }
        $current .= $c;
    }
    push @parts, $current if $current =~ /\S/;
    return @parts;
}

# The file a type named in $file lives in: through that file's imports, else beside it.
sub file_of {
    my ($outer, $file) = @_;
    if ($text{$file} =~ /^\s*import\s+([\w.]+)\.\Q$outer\E\s*;/m) {
        (my $path = $1) =~ s{\.}{/}g;
        return "$path/$outer.java";
    }
    (my $dir = $file) =~ s{[^/]+$}{};
    return "$dir$outer.java";
}

# The names Gson would fill in a type: its fields that are neither static nor transient, a
# record's components, and what the class it extends brings. Undefined when the type's source
# is not among the program's (java.util.Map).
sub fields_of {
    my ($qualified, $file, $seen) = @_;
    $seen ||= {};
    my @path = split /\./, $qualified;
    my $source = file_of($path[0], $file);
    return undef unless exists $text{$source};
    return [] if $seen->{"$source#$qualified"}++;
    my $t = $text{$source};
    my $name = $path[-1];

    if ($t =~ /\brecord\s+\Q$name\E\s*(?:<[^>]*>)?\s*\(([^)]*)\)/) {
        my @names;
        for my $component (at_commas($1)) {
            push @names, $1 if $component =~ /(\w+)\s*$/;
        }
        return \@names;
    }
    return undef unless $t =~ /\bclass\s+\Q$name\E\b([^{]*)\{/g;
    my ($heading, $open) = ($1, pos($t) - 1);
    my $body = braced($t, $open);

    # Only what is declared in the class itself: the bodies inside it (methods, classes,
    # initialisers) are closed off, each leaving a ";" so that what follows starts clean.
    my $flat = '';
    my $depth = 0;
    for my $c (split //, $body) {
        if ($c eq '{') { $depth++; next; }
        if ($c eq '}') { $depth--; $flat .= ';' if $depth == 0; next; }
        $flat .= $c if $depth == 0;
    }

    my @names;
    for my $statement (split /;/, $flat) {
        my $json_name;
        $json_name = $1 if $statement =~ /\@SerializedName\(\s*(?:value\s*=\s*)?"([^"]+)"/;
        $statement =~ s/\@\w+(?:\([^)]*\))?//g;
        (my $declared = $statement) =~ s/=.*//s;
        next if $declared =~ /\(/;                                      # a method, a constructor
        next if $declared =~ /\b(?:static|transient|class|interface|enum|record|import|package)\b/;
        $declared =~ s/\b(?:private|protected|public|final|volatile)\b//g;
        next unless $declared =~ /\S\s+\S/;                             # a type and a name
        my @declarators = at_commas($declared);
        for my $i (0 .. $#declarators) {
            next unless $declarators[$i] =~ /(\w+)\s*(?:\[\s*\]\s*)*$/;
            push @names, ($i == 0 && defined $json_name) ? $json_name : $1;
        }
    }
    if ($heading =~ /\bextends\s+([\w.]+)/) {
        my $inherited = fields_of($1, $source, $seen);
        push @names, @$inherited if $inherited;
    }
    return \@names;
}

# ── what the program asks for, and what is registered ──
my (%read_in, %written_in, %has_writer, @readers);
for my $file (sort keys %text) {
    my $t = $text{$file};
    while ($t =~ /\b(?:fromJson|get|getList|post|put|patch)\s*\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*?,\s*([A-Za-z_][\w.]*)(?:\[\])?\.class\s*\)/g) {
        $read_in{simple($1)} //= $file;
    }
    while ($t =~ /\btoJson\s*\(\s*new\s+([A-Za-z_][\w.]*)\s*[(<]/g) {
        $written_in{simple($1)} //= $file;
    }
    while ($t =~ /JsonReaders\.register\(\s*([A-Za-z_][\w.]*)\.class\s*,\s*([^;]*?)\)\s*;/gs) {
        push @readers, { type => $1, how => $2, file => $file };
    }
    while ($t =~ /JsonWriters\.register\(\s*([A-Za-z_][\w.]*)\.class/g) {
        $has_writer{simple($1)} = 1;
    }
}
my %has_reader = map { simple($_->{type}) => 1 } @readers;

my @problems;

my @no_reader = grep { !$has_reader{$_} && !$READ_ALONE{$_} && !$allowed{$_} } sort keys %read_in;
if (@no_reader) {
    push @problems, "NO JSON READER for a type the program reads:";
    push @problems, "  $_   ($read_in{$_})" for @no_reader;
}
my @no_writer = grep { !$has_writer{$_} && !$WRITE_ALONE{$_} && !$allowed{$_} } sort keys %written_in;
if (@no_writer) {
    push @problems, "NO JSON WRITER for a type the program writes:";
    push @problems, "  $_   ($written_in{$_})" for @no_writer;
}

# ── every reader, field by field ──
my (@unread, $checked);
for my $reader (@readers) {
    my $fields = fields_of($reader->{type}, $reader->{file});
    next unless $fields;                       # not a type of the program's
    $checked++;
    # The reader's own text: the method it names, or the file it is registered in.
    my $where = $text{$reader->{file}};
    if ($reader->{how} =~ /(?:::|^\s*)(\w+)\s*$/) {
        my $method = $1;
        if ($where =~ /\b\Q$method\E\s*\(\s*JsonElement\b[^)]*\)\s*\{/g) {
            $where = braced($where, pos($where) - 1);
        }
    }
    my $type = simple($reader->{type});
    my @missing = grep { $where !~ /"\Q$_\E"/ && !$allowed{"$type.$_"} } @$fields;
    push @unread, "  $type: " . join(', ', @missing) if @missing;
}
if (@unread) {
    push @problems, "A JSON READER does not read every field of its type:";
    push @problems, @unread;
    push @problems, "On the desktop the JSON library fills every field by its name. Here only what the";
    push @problems, "reader names is read: the rest stays empty and nothing says so.";
}

if (@problems) {
    print "\n";
    print "   $_\n" for @problems;
    print "   Say how it is read or written in config/GameJsonReaders.java. What is left out on\n";
    print "   purpose (a type read by code nothing calls, a field) is named in config/json-not-read.txt.\n";
    exit 1;
}
printf "   JSON: %d types read, each with its reader; %d readers checked field by field\n",
       scalar(keys %read_in), $checked // 0;
exit 0;
