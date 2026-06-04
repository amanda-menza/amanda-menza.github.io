# Bazaar Game Project

This project implements parts of the Bazaar game assignment. It contains milestone README files, sequence diagrams, planning notes, executable/test jars, and the main Gradle source project under `Bazaar/`.

## Important paths

| Path | Purpose |
| --- | --- |
| `Bazaar/src/main/java/common/` | Core value objects and rules: cards, equations, pebbles, inventory, turn state, rule book, and render helpers. |
| `Bazaar/src/main/java/referee/` | Game state, bank, board, referee actions, and referee orchestration. |
| `Bazaar/src/main/java/player/` | Player interfaces, player state, scoring, exceptions, and mechanism behavior. |
| `Bazaar/src/main/java/player/strategy/` | Strategy abstractions and concrete strategies for move selection. |
| `Bazaar/src/main/java/renderables/` | JavaFX view components for game/referee displays. |
| `Bazaar/src/main/java/utils/` | Comparators, random helpers, string helpers, and state/card/equation utilities. |
| `Bazaar/src/main/java/xeq/` | Equation-exchange console entry points. |
| `Bazaar/src/main/java/xrules/` | Rule-validation entry points. |
| `Bazaar/src/main/java/xstrategy/` | Strategy entry points. |
| `Bazaar/src/main/java/xturn/` | Turn-state entry points. |
| `Bazaar/src/test/java/` | JUnit tests and console launchers. |
| `Bazaar/Planning/` | Notes about game state, referee behavior, player protocol, observer behavior, and sprint planning. |
| `README-M2.md` through `README-M6.md` | Milestone-specific assignment documentation. |

## Build and test

```bash
cd Bazaar
gradle test
gradle run
```

The Gradle build declares OpenJFX dependencies and JUnit/Mockito test dependencies. If JavaFX module errors occur, check the `run` task in `Bazaar/build.gradle`; it currently references a local JavaFX SDK path that may not exist after cleanup.

## Entry points

The build file currently sets the application main class to `xeq.EquationExchangeTest` and the jar manifest to `xeq.EquationExchangeMain`. Other console entry points exist for rules, strategy, turn state, and game tests. Align `application.mainClassName` with the executable you want before producing a final jar.

## Cleanup notes

- `Bazaar/bin/` and `Bazaar/out/` are compiled outputs and should stay out of git.
- `Bazaar/javafx-sdk-21.0.5/` was removed because it is a large vendored SDK.
- Top-level `*.jar` files are generated deliverables or test launchers and should stay out of git unless a specific archive is intentional.
- `.DS_Store`, `.idea/`, and `.vscode/` are machine/editor-local and should stay out of git.

Keep source files, tests, planning notes, milestone READMEs, Gradle files, and intentional Gradle wrapper artifacts.
