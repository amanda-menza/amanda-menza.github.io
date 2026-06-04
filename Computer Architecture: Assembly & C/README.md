# Computer Architecture Exercises

This folder contains small computer-architecture exercises in C, assembly, and Java.

## Files

| File | Purpose |
| --- | --- |
| `by5or6.c` / `by5or6.s` | C implementation and assembly output for divisibility-style logic. |
| `recurse.c` / `recurse.s` | C implementation and assembly output for recursion practice. |
| `HoopsRank.c` / `HoopsRank.s` | C implementation and assembly output for ranking/array-style practice. |
| `cachesim.java` | Java cache-simulation exercise. |

## Running the C files

```bash
clang by5or6.c -o by5or6
./by5or6

clang recurse.c -o recurse
./recurse

clang HoopsRank.c -o HoopsRank
./HoopsRank
```

## Running the Java file

```bash
javac cachesim.java
java cachesim
```

## Maintenance notes

- Keep source files and assignment notes in git.
- Do not commit generated executables, `.class` files, or `.DS_Store`.
- The `.s` files appear intentional because they are part of the assembly comparison work; keep them if the assignment required them.
