# Milestone 6

## Project Purpose
_This project aims to simulate the game of Bazaar as defined by our class guidelines._

**Aims of Milestone 6:**
- Player mechanism creation
- Testing task for xrules
- Game Test

---

## Table of Contents
**[Files](#file-descriptions)**
- [GameTestMain](#gametestmain)
- [IPlayer](#iplayer)
- [IRuleBook](#irulebook)
- [Mechanism](#mechanism)
- [Player](#player)
- [Referee](#referee)
- [RuleBook](#rulebook)
- [RuleValidationMain](#rulevalidationmain)

**[Testing](#testing)**
- [RuleValidationTest](#rulevalidationtest)
- [RuleValidationTestConsoleLauncher](#rulevalidationtestconsolelauncher)
- [GameTest](#gametest)
- [GameTestConsoleLauncher](#gametest)

**[Sequence Diagram](#sequence-diagram)**

**[Running the Code](#running-the-code)**
- [Jars](#jars)

---

## File Descriptions

### GameTestMain
**File:** `GameTestMain.java` **Package:** `xgametest`

**Purpose**: Main method to process test input for Game Test in milestone 6.

--- 
### IPlayer
**File:** `IPlayer.java` **Package:** `player`

**Purpose**: An interface for the referee to interact with the player.

**Methods**:
- `void setup(ArrayList<Equation> e);`: set player up with the game equations.
- `PebbleOrExchanges requestPebbleOrTrades(Turn_State s)`: communicate to the ref if pebble is needed or exchanges are taking place.
- `SequenceOfCards requestCards(Turn_State s)`: Return cards to be bought, points associated with those cards, and inventory that should remain after buying.
- `void win(boolean w)`: True if player wins game.
- `void setEndGameReport(ArrayList<IPlayer> rank)`: Send the end gme report to each player.
- `PlayerScore getPlayerScore()`
- `String getName()`
- `void updateScore(int points)`
- `int getScore()`
- `Inventory getInventory()`
- `ArrayList<Card> getMyCards()`
--- 
### IRuleBook
**File:** `IRuleBook.java` **Package:** `common`

**Edited**:Added method to get pebble from bank by using a predetermined order.

**Methods**:
- `Optional<Pebble> getDeterministicPebble(Turn_State s)`: gets pebble from bank to give to player in the order red, white, blue, green, yellow
---
### Mechanism
**File:** `Mechanism.java` **Package:** `common`

**Purpose**: Class through which ref can interact with IPlayer.

**Constructor**:
- `Mechanism(IPlayer p)`

**Methods**:
- `void setup(ArrayList<Equation> e)`: set player up with the game equations by calling the setup in IPlayer
- `PebbleOrExchanges requestPebbleOrTrades(Turn_State s)`: Communicate to the ref if pebble is needed or exchanges are taking place.
- `SequenceOfCards requestCards(Turn_State s)`: Return cards to be bought, points associated with those cards, and inventory that should remain after buying.
- `void win(boolean w)`: Let IPlayer know if they won or lost.
---
### Player
**File:** `Player.java` **Package:** `player`

**Edited**: implements IPlayer

---
### Referee
**File:** `Referee.java` **Package:** `referee`

**Edited**: Updated to interact with IPlayer through mechanism

---
### RuleBook
**File:** `RuleBook.java` **Package:** `common`

**Purpose**: Implements method to get deterministic pebble.

**Method**:
- `Optional<Pebble> getDeterministicPebble(Turn_State s)`: gets pebble from bank to give to player in the order red, white, blue, green, yellow
---

### RuleValidationMain
**File:** `RuleValidationMain.java` **Package:** `xrules`

**Purpose**: Main method to process test input for xrules in milestone 6.

---
## Testing

### RuleValidationTest
**File:** `RuleValidationTest.java`  **Directory**: `test/java/xrules`

**Resource Location** `test/java/jTests/Six`

**Purpose**: Runs testing requirements for this milestone that determines if a given set of exchanges is valid and if so, prints the remaining player and bank inventories.

**Tests**:
- runs 3 tests on input files 0-2.
---
### RuleValidationTestConsoleLauncher
**File:** `RuleValidationTestConsoleLauncher.java`  **Directory**: `test/java/xrules`

**Purpose**: Runs the tests in the `RuleValidationTest` file and outputs the results to the console.
---
### GameTest
**File:** `GameTest.java`  **Directory**: `test/java/xgametest`

**Resource Location** `test/java/jTests/Seven`

**Purpose**: Runs the tests that run a game to completion given current game state.

**Tests**:
- runs 10 tests on input files 0-9.
---
### GameTestConsoleLauncher
**File:** `GameTestConsoleLauncher.java`  **Directory**: `test/java/xgametest`

**Purpose**: Runs the tests in the `GameTest` file and outputs the results to the console.

---

## Sequence Diagram
- `GameSequenceDiagrams.pdf` found in the main GameProject directory outlines the sequence of communication between `Game_State`, `Referee`, and `Player` through each State of the game.

---
## Running the Code
**Required Milestone Testing**
- to run the specific milestone 6 testing that was asked of us locate the `RuleValidationTest` file in `test/java/xrules`.
- to run the Game Test locate `GameTest` file in `test/java/xgametest`.

### Jars
- In the `GameProject` directory the testing task 6 is packaged into the `XRules.jar`
  - Terminal command from GameProject Directory: `java -jar XRules.jar`
  - Runs `RuleValidationTestConsoleLauncher` to visually see test success/failure in terminal
- In the `GameProject` directory the testing task 7 is packaged into the `XGameTest.jar`
    - Terminal command from GameProject Directory: `java -jar XGameTest.jar`
    - Runs `GameTestConsoleLauncher` to visually see test success/failure in terminal

