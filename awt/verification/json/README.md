# JSON verification harness

The `json` package replaces Gson. It is checked against Gson itself.

```bash
javac -d out $(find ../../src/main/java/json -name '*.java')
javac -cp out:gson.jar -d out JsonCheck.java
java -cp out:gson.jar JsonCheck
```

Expected:

```
442 comparisons, 0 mismatches
```

Every document is parsed by both implementations, **re-serialised by both**,
and the results compared. Checking only "does it parse" would let a parser
that silently drops a field pass; comparing the re-serialised form does not.

Covers 400 randomly generated documents, the shapes the game's own protocol
produces, escapes, literal and escaped unicode, deep nesting, numbers either
side of the int boundary, and malformed input that must throw rather than
return something plausible.

It caught one real difference: Gson preserves a number's **source text**, so
`1.2e3` serialises back as `1.2e3`. Parsing to a double and reformatting gives
`1200.0` — the same value, a different document. The parser now keeps the
literal.
