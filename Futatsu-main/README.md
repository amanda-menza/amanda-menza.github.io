# Futatsu Java Projects

This folder contains Java coursework projects. The two main projects are a descendant-tree warmup and a larger Bazaar game implementation with shared game-state, rule, rendering, referee, player, and strategy packages.

## Project map

| Path | Purpose |
| --- | --- |
| `DescendantTree/` | Warmup CLI project for building a descendant tree and finding paths from the root to named descendants. |
| `GameProject/` | Bazaar game project with milestone notes, executable/test jars, diagrams, planning docs, and the Gradle source project in `Bazaar/`. |
| `out/` | Generated compiled output from an IDE; candidate for deletion. |
| `.idea/` | IntelliJ project metadata; keep only if shared IDE settings are intentional. |

## Build and test

DescendantTree:

```bash
cd DescendantTree
gradle test
gradle run
```

Bazaar:

```bash
cd GameProject/Bazaar
gradle test
gradle run
```

Both projects use Gradle and JUnit. The Gradle wrapper jars are committed, but the wrapper scripts are not currently tracked; generate and commit `gradlew` and `gradlew.bat` if you want wrapper-based commands on fresh clones.

## Cleanup candidates

These generated or machine-local artifacts have been removed from version control and should stay ignored:

- `out/`
- `DescendantTree/out/`
- `GameProject/Bazaar/bin/`
- `GameProject/Bazaar/out/`
- `.DS_Store` files.
- `.idea/` folders.
- Large generated jars in `GameProject/*.jar`.
- `GameProject/Bazaar/javafx-sdk-21.0.5/`; Gradle already declares OpenJFX dependencies, so a checked-in SDK is usually unnecessary.

If assignment jars ever need to be archived, store them outside the source tree or document why a specific jar is intentionally committed.
