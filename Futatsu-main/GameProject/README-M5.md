# Milestone 5

## Project Purpose
_This project aims to simulate the game of Bazaar as defined by our class guidelines._

**Aims of Milestone 5:**
- Rule book creation
    - what ref uses to validate player turn
- implement player API for the logical player/referee interactions
- Testing task for strategy
- Design referee/game state interaction

---

## Table of Contents
**[Files](#file-descriptions)**
- [AStrategy](#astrategy)
- [Inventory](#inventory)
- [IRuleBook](#irulebook)
- [PebbleOrExchanges](#pebbleorexchanges)
- [Player](#player)
- [PlayerAPI](#playerapi)
- [PlayerMoveState](#playermovestate)
- [PlayerScore](#playerscore)
- [Referee](#referee)
- [RuleBook](#rulebook)
- [SequenceOfCards](#sequenceofcards)
- [StrategyMain](#strategymain)
- [TieBreaker](#tiebreaker)

**[Testing](#testing)**
- [RuleBookTest](#rulebooktest)
- [StrategyTest](#strategytest)
- [StrategyTestConsoleLauncher](#StrategyTestConsoleLaunchr)

**[Design](#design)**
- [referee.md](#refereemd)

**[Running the Code](#running-the-code)**
- [Jar](#jar)

---

## File Descriptions

### AStrategy
**File:** `AStrategy.java` **Package:** `player.strategy`

**Edited**: Split maximizeRecursive() into 2 modular functions and added `PlayerMoveState` object to create new inventory copies at each level. Also added a ruleBook field for filtering equations/cards

**Methods**:
- `abstract int updateMetric(ArrayList<Card> currentCards,PlayerScore newPoints)`: method to return either the new score or new cards bought number to be implemented by the 2 specific strategy classes.
- `Optional<Candidate> getBestCandidate(Boolean pickedPebble)`: implemented here to trigger the recursive search and use tiebreakers on output if needed.
- `void updateStrategy(Inventory playerInventory, ArrayList<Card> currentVisibleCards, Inventory bankInventory)`: each turn a player updates its strategy with current information.
- `PlayerMoveState exchangePurchaseRecursion(PlayerMoveState playerMoveState)`: performs recursion on available equations and calls card recursion.
- `PlayerMoveState buyCardRecursive(PlayerMoveState playerMoveState)`: performs recursion on available cards.
--- 
### Inventory
**File:** `Inventory.java` **Package:** `common`

**Edited**: Methods added for rule book functions.

**Methods**:
- `boolean equals(Inventory other)`: checks if another inventory has the same pebble composition as this one.
- `boolean equals(ArrayList<Pebble> pebbles)`: Checks if this inventory has the same pebble composition as a list of pebbles.
- `boolean hasValidPebbleCounts()`: checks if all pebble counts in the inventory are non-negative.
---
### IRuleBook
**File:** `IRuleBook.java` **Package:** `common`

**Purpose**: Interface for player, ref, strategy to interact with rule book.

**Methods**:
- `boolean isValidTurn(Candidate playerTurn, Turn_State turnState,boolean pickedPebble)`: checks if a player's turn is valid.
- `boolean canUseEquation(Equation equation, Inventory playerInventory, Inventory bankInventory)`: checks if a player can use an equation.
- `boolean canBuyCard(Card card, Inventory playerInventory)`: checks if a player can buy a card.
- `boolean validNumberOfPlayers(int numberOfPlayers)`: checks if the number of players is valid.
- `ArrayList<Equation> filterEqSet(ArrayList<Pebble> playerWallet, ArrayList<Pebble> bank, ArrayList<Equation> equations)`: filters set of equations so it returns set that player can use.
- `ArrayList<Card> filterCardList(ArrayList<Card> cardList, Inventory playerInventory)`: returns a filtered set of available cards that the player can use.
---
### PebbleOrExchanges
**File:** `PebbleOrExchanges.java` **Package:** `common`

**Purpose**: The format of return when the ref asks player for requestPebbleOrTrades.

**Constructor**: 
- `PebbleOrExchanges(boolean receivePebble, ArrayList<Equation> exchanges)`
---
### Player
**File:** `Player.java` **Package:** `player`

**Edited**: Updated to use player API and utilize strategy. Also given a rule book so it cn filter equations and decide if it needs a pebble.

**Methods**:
- `void updateStrategyForTurn(Turn_State turnState)`: gives strategy updated turn state.
- PlayerAPI methods implemented
---
### PlayerAPI
**File:** `PlayerAPI.java` **Package:** `player`

**Purpose**: Interface that describes necessary `Player` methods

**Methods**:
- `void setup(ArrayList<Equation> e)`: set player up with the game equations.
- `PebbleOrExchanges requestPebbleOrTrades(Turn_State s)`: communicate to the ref if pebble is needed or exchanges are taking place.
- `SequenceOfCards requestCards(Turn_State s)`: return cards to be bought, points associated with those cards, and inventory that should remain after buying.
---
### PlayerMoveState
**File:** `PlayerAPI.java` **Package:** `player.strategy`

**Purpose**: To handle different states of recursion layers by creating objects with their own copies of inventories and important variables.

**Constructor**:
- `PlayerMoveState(Inventory currentPlayerInventory, Inventory currentBankInventory, ArrayList<Equation> availableEquations,ArrayList<Card> availableCards, ArrayList<Equation> equationsUsed, ArrayList<Card> cardsBought, PlayerScore currentPoints,ArrayList<Candidate> bestCandidates)`

**Methods**:
- `PlayerMoveState executeFunctionalCardPurchase(Card card)`: creates copies of necessary variables and returns new PlayerMoveState object for a card purchase. 
- `PlayerMoveState executeFunctionalEquationPurchase(Equation equation)`: creates copies of necessary variables and returns new PlayerMoveState object for an equation purchase.
---
### PlayerScore
**File:** `PlayerScore.java` **Package:** `player`

**Edited**: Updated to have an equals method.

**Methods**:
- `boolean equals(int other)`
- `boolean equals(PlayerScore other)`
---
### Referee
**File:** `Referee.java` **Package:** `referee`

**Edited**: Updated interaction with `Player` to acquire move and using `RuleBook` to validate.

**Methods**:
- `void getPlayerMove()`: uses `requestPebbleOrTrades()` and `requestCards()` to form candidate.
  - `boolean evaluateMove()`: uses `isValidTurn` in `RuleBook` to perform evaluation.
---
### RuleBook
**File:** `RuleBook.java` **Package:** `common`

**Purpose**: Acts as a central location in game to perform game rule checks.

**Method**:
- Implements IRuleBook methods
---
### SequenceOfCards
**File:** `SequenceOfCards.java` **Package:** `common`

**Purpose**: Object to return for requestCards() method so referee can get a full Candidate of information from the player.

**Constructor**: 
- `SequenceOfCards(ArrayList<Card> cardsBought, int pointsFromBuyingCards, ArrayList<Pebble> remainingInventoryAfterBuyingCards)`
---
### StrategyMain
**File:** `StrategyMain.java` **Package:** `xstrategy`

**Purpose**: Parse turn state std in and strategy type to find the best candidate. Print best candidate to std out.

**Methods**:
- `static void main(String[] args)`
---
### TieBreaker
**File:** `TieBreaker.java` **Package:** `player.strategy`

**Edited**: Updated methods to abide by D.R.Y.

---
## Testing

### StrategyTest
**File:** `StrategyTest.java`  **Directory**: `test/java/xstrategy`
**Resource Location** `test/java/jTests/Five`

**Purpose**: Runs testing requirements for this milestone that finds the best candidate from a given turn state and strategy method.
**Tests**:
- runs 4 tests on input files 0-3.
---
### StrategyTestConsoleLauncher
**File:** `StrategyTestConsoleLauncher.java`  **Directory**: `test/java/xstrategy`

**Purpose**: Runs the tests in the `StrategyTest` file and outputs the results to the console.

---
### RuleBookTest
**File:** `RuleBookTest.java`  **Directory**: `test/java/common`

**Purpose**: Tests our rule book

**Tests**:
- `testValidNumberOfPlayers()`
- `testCanBuyCard()`
- `testCanUseEquation()`
- `testIsValidTurn()`
---
## Design

### referee.md
**File**: `referee.md` **Directory**: `Planning`

**Purpose**: Referee protocol for interacting with Game State.

---
## Running the Code
**Required Milestone Testing**
- to run the specific milestone testing that was asked of us locate the `StrategyTest` file in `test/java/xstrategy`.
-
### Jar
- In the GameProject directory the testing task is packaged into the `XStrategy.jar`
- Terminal command from GameProject Directory: `java -jar XStrategy.jar`
