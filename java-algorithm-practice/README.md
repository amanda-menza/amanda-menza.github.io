# Java APT Exercises

This folder contains standalone Java solutions for algorithmic programming exercises.

## Files

| File | Problem area |
| --- | --- |
| `FriendScore.java` | Graph/social-neighbor scoring logic. |
| `HuffmanDecoding.java` | String/tree-style decoding logic. |
| `OlympicCandles.java` | Greedy simulation/counting logic. |
| `TreeTighten.java` | Tree/string transformation logic. |

## Running a solution locally

Each file is standalone. Compile and run the file you are working on:

```bash
javac FriendScore.java
java FriendScore
```

Some APT platforms call methods directly rather than using a `main` method, so local execution may require adding a small temporary harness or using the platform's test runner.

## Maintenance notes

- Keep `.java` source files in git.
- Do not commit generated `.class` files.
- The folder uses a descriptive, hyphenated name for easier shell navigation and cleaner links.
