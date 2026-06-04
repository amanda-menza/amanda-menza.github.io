# DescendantTree

DescendantTree is a Java warmup project for modeling a descendant tree and finding a role-based path from the root to a named person.

## Assignment goal

The program reads commands from standard input. Commands either create a person or ask the tree to find a path from the current root to another person. Output paths use family roles rather than names.

Assumptions from the implementation:

- A person is either a mother or a father.
- A person may have zero or more descendants.
- Children are listed before the parent that references them.
- Input lines follow the expected command syntax.
- All people belong to the same tree.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/main/java/edu/duke/futatsu/warmup2/APerson.java` | Abstract base class for people in the tree. |
| `src/main/java/edu/duke/futatsu/warmup2/Father.java` | Concrete person type whose path token is `"father"`. |
| `src/main/java/edu/duke/futatsu/warmup2/Mother.java` | Concrete person type whose path token is `"mother"`. |
| `src/main/java/edu/duke/futatsu/warmup2/Tree.java` | Stores descendants, tracks the root, and finds root-to-target paths. |
| `src/main/java/edu/duke/futatsu/warmup2/Command.java` | Parses input commands and applies them to the tree. |
| `src/main/java/edu/duke/futatsu/warmup2/Main.java` | CLI entry point. |
| `src/test/resources/` | Input/output fixture files. |
| `build.gradle` | Gradle application and test configuration. |

## Input format

Each line is either:

```text
mother <name> [childName ...]
father <name> [childName ...]
find <name>
```

Example:

```text
mother Jade
father Jean
mother Judith
mother Juliette Judith Jean Jade
find Jaen
find Juliette
find Jean
```

Expected output:

```text
path from "Juliette" to "Jaen" is #f
path from "Juliette" to "Juliette" is ()
path from "Juliette" to "Jean" is ("mother")
```

## Build, run, and test

```bash
gradle test
gradle run
```

To run manually with a fixture:

```bash
gradle run < src/test/resources/1-in.txt
```

## Maintenance notes

- `out/` is generated IDE/build output and can be deleted from version control.
- The Gradle wrapper jar is kept in `gradle/wrapper/`, but wrapper scripts are not currently tracked.
- If diagrams such as `img_1.png` or `img_2.png` are re-added, keep them near this README and reference them with relative paths.
