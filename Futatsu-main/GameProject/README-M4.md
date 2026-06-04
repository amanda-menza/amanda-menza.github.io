# Milestone 4

## Project Purpose
_This project aims to simulate the game of Bazaar as defined by our class guidelines._

**Aims of Milestone 4:**
- Strategy for an AI player to follow
  - exchange-and-purchase request greedy strategy
  - card-purchase request greedy strategy
- Testing task for Game State and Turn State representations
- Design player protocol

---

## Table of Contents
**[Files](#file-descriptions)**
- [AStrategy](#astrategy)
- [AwardPoints](#awardpoints)
- [Bank](#bank)
- [BankUtils](#bankutils)
- [Candidate](#candidate)
- [CandidateCardListComparator](#candidatecardlistcomparator)
- [CandidateEquationListComparator](#candidateequationlistcomparator)
- [CandidateInventoryComparator](#candidateinventorycomparator)
- [Card](#card)
- [CardComparator](#cardcomparator)
- [CardListComparator](#cardlistcomparator)
- [CardTransaction](#cardtransaction)
- [CardUtils](#cardutils)
- [Equation](#equation)
- [EquationComparator](#equationcomparator)
- [EquationListComparator](#equationlistcomparator)
- [EquationTransaction](#equationtransaction)
- [GameBoard](#gameboard)
- [Game_State](#game_state)
- [Inventory](#inventory)
- [IStrategy](#istrategy)
- [ITransaction](#istrategy)
- [MaxNumCardsStrategy](#maxnumcardsstrategy)
- [MaxScoreStrategy](#maxscorestrategy)
- [PebbleListComparator](#pebblelistcomparator)
- [PebbleUtils](#pebbleutils)
- [Player](#player)
- [PlayerScore](#playerscore)
- [PlayerUtils](#playerutils)
- [RefFromPlayerActions](#reffromplayeractions)
- [StringUtils](#stringutils)
- [TieBreaker](#tiebreaker)
- [Turn_State](#turn_state)

**[Testing](#testing)**
- [Turn_StateTest](#turn-stateTest)
- [Turn_StateTestConsoleLauncher](#turn_statetestconsolelauncher)
- [CardComparatorTest](#cardcomparatortest)
- [CardListComparatorTest](#cardlistcomparatortest)
- [CardTransactionTest](#cardtransactiontest)
- [EquationComparatorTest](#equationcomparatortest)
- [EquationListComparatorTest](#equationlistcomparator)
- [EquationTransactionTest](#equationtransactiontest)
- [MaxNumCardsStrategyTest](#maxnumcardsstrategytest)
- [MaxScoreStrategyTest](#maxscorestrategytest)
- [PebbleListComparatorTest](#pebblelistcomparatortest)
- [TieBreakerTest](#tiebreakertest)


**[Design](#design)**
- [player-protocol.md](#player-protocol)

**[Running the Code](#running-the-code)**
- [Jar](#jar)

---

## File Descriptions

### AStrategy
**File:** `AStrategy.java` **Package:** `player.strategy`

**Purpose**: Abstract class to hold some common methods between the two maximizing strategies. Implements IStrategy.

**Constructor**:
- `AStrategy(Inventory inventory, ArrayList<Equation> equations, ArrayList<Card> cards, Inventory bankInventory)`
  **Methods**:
- `abstract int updateMetric(ArrayList<Card> currentCards,PlayerScore newPoints)`: method to return either the new score or new cards bought number to be implemented by the 2 specific strategy classes.
- `Optional<Candidate> getBestCandidate(Boolean pickedPebble)`: implemented here to trigger the recursive search and use tiebreakers on output if needed.
- `void maximizeRecursive(Inventory currentPlayerInventory, Inventory currentBankInventory,ArrayList<Equation> availableEquations, ArrayList<Card> availableCards,ArrayList<Equation> currentEquations, ArrayList<Card> currentCards,PlayerScore currentPoints, int tradesUsed)`: recursive method to search combinations of 0-4 exchanges and 0-4 cards bought, finding the maximizing candidate.
- `void applyEquation(Equation equation,Inventory currentPlayerInventory, Inventory bankInventory)`: applies equation by calling equation transaction which exchanges pebbles between bank and player.
- `void applyCardPurchase(Card card, ArrayList<Card> currentCards,PlayerScore currentPoints,Inventory currentPlayerInventory, Inventory bankInventory)`: applies card purchase by calling a card transaction execution which transfers pebbles from player to bank, adds current card to player's cards, and awards player points.
- `void undoCardPurchase(Card card, ArrayList<Card> currentCards,PlayerScore currentPoints,Inventory currentPlayerInventory, Inventory bankInventory)`: calls undo execute on the card transaction.
- `void undoEquation(Equation equation, Inventory currentPlayerInventory, Inventory bankInventory)`: calls equation transaction with the reverse order of inventories.
--- 
### AwardPoints
**File:** `AwardPoints.java` **Package:** `player.strategy`

**Purpose**: Class to return int associates with remaining player inventory and star presence when they are buying a card.

**Methods**: 
- `int calculatePoints(Inventory inventory, Card card)`: method to return points associated with player inventory and specific card.

--- 

### Bank
**File:** `Bank.java` **Package:** `referee`

**Edited**: New constructor and method for reading from STDIN and creating a bank with a given pebble list.

**Added Constructor**
- `Bank(ArrayList<Pebble> bank)`

**Added Method**:
- `Bank initializeBankWithPebbleList(ArrayList<Pebble> bank)`: method to call new constructor with clear purpose.

---
### BankUtils
**File:** `BankUtils.java` **Package:** `utils`

**Purpose**: Deal with Bank objects read in from STDIN as strings.

**Methods**:
- `Bank convertToBank(String str)`: method to create new Bank object from string.
---
### Candidate
**File:** `Candidate.java` **Package:** `player.strategy`

**Purpose**: Define the specifications of a player move.

**Constructor**: 
- `Candidate(ArrayList<Equation> equations, ArrayList<Card> cardsBought, int totalPoints, ArrayList<Pebble> remainingInventory, int numberOfTrades, int numberOfCards)`

**Methods**:
- includes get methods for its fields
---
### CandidateCardListComparator
**File:** `CandidateCardListComparator.java` **Package:** `utils`

**Purpose**: compare Candidates by their bought card list.

**Methods**:
- `int compare(Candidate c1, Candidate c2)`
---
### CandidateEquationListComparator
**File:** `CandidateEquationListComparator.java` **Package:** `utils`

**Purpose**: compare Candidates by their used equation list.

**Methods**:
- `int compare(Candidate c1, Candidate c2)`
---
### CandidateInventoryComparator
**File:** `CandidateInventoryComparator.java` **Package:** `utils`

**Purpose**: compare Candidates by their pebble list inventory.

**Methods**:
- `int compare(Candidate c1, Candidate c2)`
---
### Card
**File:** `Card.java` **Package:** `common`

**Edited**: New constructor and method for reading from STDIN and creating a card with a given pebble list and star value.

**Added Constructor**
- `Card(ArrayList<Pebble> pebbles, Boolean hasStar)`

**Added Method**:
- `Card initializeNonRandomCard(ArrayList<Pebble> pebbles, Boolean hasStar)` : method to call new constructor with clear purpose.
---
### CardComparator
**File:** `CardComparator.java` **Package:** `utils`

**Purpose**: compare cards by their pebbles lexicographically.

**Methods**:
- `int compare(Card a, Card b)` 
---
### CardListComparator
**File:** `CardListComparator.java` **Package:** `utils`

**Purpose**: Compare a list of cards by size and then by the card comparator.

**Methods**:
- `int compare(ArrayList<Card> list1, ArrayList<Card> list2)`
---
### CardTransaction
**File:** `CardTransaction.java` **Package:** `referee.transaction`

**Purpose**: Define card execution and undo execute. Involves pebble exchanging between player and bank and awarding points/card to player.

**Constructor**: 
- `CardTransaction(Card card, Inventory playerInventory, Inventory bankInventory ,ArrayList<Card> playerCards, PlayerScore playerScore)`

- **Methods**:
- `int cardScore()`: call method in award points to get the correct int reward
- `Boolean execute()`: performs card transaction
- `Boolean undoExecute()`: undoes card transaction
---
### CardUtils
**File:** `CardComparator.java` **Package:** `utils`

**Purpose**: Helper method to create equation objects from std in.

**Methods**:
- `String convertCardListToString(ArrayList<Card> cardList)` : Properly format cards with no spaces between consecutive cards.
- `ArrayList<Card> convertToCardList(String str)`: take a string a convert to array list of card objects.
- `Card convertToCard(String str)`: convert string to single card
---
### Equation
**File:** `Equation.java` **Package:** `common`

**Edited**: Added method to call overloaded constructor.

**Added Method**:
- `Equation initializeNonRandomEquation(ArrayList<Pebble> leftSide, ArrayList<Pebble> rightSide)`: method to call new constructor with clear purpose.
---
### EquationComparator
**File:** `EquationComparator.java` **Package:** `utils`

**Purpose**: Compare equations first by left side then right side. A smaller equation has less pebbles on the given side or lexicographically smaller list.

**Methods**:
- `int compare(Equation a, Equation b)`
---
### EquationListComparator
**File:** `EquationListComparator.java` **Package:** `utils`

**Purpose**:Compare equation lists first by size then using equation comparator

**Methods**:
- `int compare(ArrayList<Equation> list1, ArrayList<Equation> list2)`
---
### EquationTransaction
**File:** `EquationTransaction.java` **Package:** `referee.transaction`

**Purpose**: Define equation execution. Involves pebble exchanging between player and bank.

**Constructor**:
- `EquationTransaction(Equation eq, Inventory sender, Inventory receiver)`

- **Methods**:
- `Boolean execute()`: handles equation execution and can handle undoing the execution if you reverse the order you give bank and player inventories.
---
### GameBoard
**File:** `GameBoard.java` **Package:** `referee`

**Edited**: Added constructor to initialize game board with given cards and a method to call constructor.

**Added Constructor**
- `GameBoard(ArrayList<Card> invisibleCardList, ArrayList<Card> visibleCardList)`

**Added Method**:
- `GameBoard initializeGameBoardWithCardLists(ArrayList<Card> invisibleCardList, ArrayList<Card> visibleCardList)`: method to call new constructor with clear purpose.
---
### Game_State
**File:** `Game_State.java` **Package:** `referee`

**Edited**:Edited to add constructor to initialize game state with set field values.
**Constructor**
- `Game_State(Bank bank, ArrayList<Card> invisibleCards,ArrayList<Player> playerList,ArrayList<Card> visibleCards)`

**Important Methods**:
- `Game_State initializeGameWithSTDIN(Bank bank, ArrayList<Card> invisibleCards,ArrayList<Player> playerList,ArrayList<Card> visibleCards)`: Calls correct construct with clear expected quantities.
- `ArrayList<PlayerScore> getNonActivePlayerScores()`: edited to not include active player score in score list for turn state because active player has access to its own score.
---
### Inventory
**File:** `Inventory.java` **Package:** `common`

**Edited**: Added constructor to initialize inventory with given pebbles and a method to call constructor.

**Added Constructor**
- `Inventory(ArrayList<Pebble> pebbles)`

**Added Method**:
- `Inventory initializeInventoryWithList(ArrayList<Pebble> pebbles)`: method to call constructor with set pebble list.
- `Inventory initializeInventoryWithInts(int redPebbleCount, int bluePebbleCount, int greenPebbleCount, int yellowPebbleCount, int whitePebbleCount)`: method to call constructor with int definitions of each pebble count.
---
### IStrategy
**File:** `IStrategy.java` **Package:** `player.strategy`

**Purpose**: Proxy access between player and strategy

**Method**
- `Optional<Candidate> getBestCandidate(Boolean pickedPebble))`: method can be called by player to recieve a best candidate move option. If picked pebble is true we know no exchanges can be made.
---
### ITransaction
**File:** `ITransaction.java` **Package:** `referee.transaction`

**Purpose**: Interface for equation and card transactions to implement.

**Method**
- `Boolean execute()`: method implemented by transactions.
---
### MaxNumCardsStrategy
**File:** `MaxNumCardsStrategy.java` **Package:** `player.strategy`

**Purpose**: extends AStrategy to maximize cards bought

**Constructor**: calls `super`
**Method**
- `int updateMetric(ArrayList<Card> currentCards, PlayerScore newPoints)` : returns currentCards.size()
---
### MaxScoreStrategy
**File:** `MaxScoreStrategy.java` **Package:** `player.strategy`

**Purpose**: extends AStrategy to maximize points won

**Constructor**: calls `super`
**Method**
- `int updateMetric(ArrayList<Card> currentCards, PlayerScore newPoints)` : returns int score from newPoints
---
### PebbleListComparator
**File:** `PebbleListComparator.java` **Package:** `utils`

**Purpose**:Compares lists of pebbles first by size then lexicographically.

**Methods**:
- `int compare(ArrayList<Pebble> list1, ArrayList<Pebble> list2)`
---
### PebbleUtils
**File:** `PebbleUtils.java` **Package:** `utils`

**Edited**: Added methods to handle user STDIN and desired STDOUT.

**Methods**:
- `ArrayList<String> convertPebbleListToLowerCase(ArrayList<Pebble> pebbles)`: returns string array list with lower case string representations of the pebble list.
- `String convertPebbleListToString(ArrayList<Pebble> pebbles)`: correctly joints pebbles without spaces for test cases.
---
### Player
**File:** `Player.java` **Package:** `common`

**Edited**: Edited to not have access to Pebble(can't add to own inventory) and added constructor to create player with given score and inventory.

**Added Constructor**:
- `Player(int score, Inventory inventory,RefFromPlayerActions ref)`

**Added Methods**:
- `initializePlayerWithScoreAndInventory(int score, Inventory inventory)`: Method to call correct constructor with given score and inventory.
- `void setStrategy(Turn_State turnState)`: gives strategy information from current turn state to correctly execute for the given round.
- `Candidate pickPlayerMove()`: determines if it can use equation, if not asks ref for a pebble, then calls the strategy to return a candidate.
---
### PlayerScore
**File:** `PlayerScore.java` **Package:** `player`

**Purpose**: object to hold player int score.

**Constructor**: 
- `PlayerScore(int score)`

**Methods**:
- `int getScore()`
- `void updateScore()`
---
### PlayerUtils
**File:** `PlayerUtils.java` **Package:** `utils.player_utils`

**Purpose**: Methods to deal with player representation for STDIN and STDOUT

**Methods**:
- `ArrayList<Player> convertToPlayerList(String str)`: Used to iterate through a string and create player object list.
- `Player convertToPlayer(String str)`: Used to convert a single string player representation to player object.
---
### RefFromPlayerActions
**File:** `RefFromPlayerActions.java` **Package:** `referee`

**Purpose**: Methods for player to interact with ref

**Methods**:
- `void giveBankPebbleToPlayer()`: randomly selects bank pebble, removes it from bank, adds it to player.
---
### StringUtils
**File:** `StringUtils.java` **Package:** `utils`

**Purpose**: Help trim string inputs from STDIN to process them correctly.

**Methods**:
- `String trimBrackets(String str)`: removes leading and ending [ ].
- `String trimCurlyBrackets(String str)`: removes leading and ending { }.
---
### TieBreaker
**File:** `TieBreaker.java` **Package:** `player.strategy`

**Purpose**: determine tiebreakers for card purchases and exchange purchases.

**Methods**:
- `ArrayList<Candidate> maxPointTieBreakHelper(ArrayList<Candidate> candidates)`: returns the Candidate(s) that yield the highest total points.
- `ArrayList<Candidate> maxRemainingInventoryTieBreakHelper(ArrayList<Candidate> candidates)`: returns the Candidate(s) with the largest size remaining inventory.
- `ArrayList<Candidate> smallestInventoryTieBreakHelper(ArrayList<Candidate> candidates)`: returns the Candidate(s) with smallest size inventory/ lexicographic list
- `ArrayList<Candidate> smallestCardListTieBreakHelper(ArrayList<Candidate> candidates)`:returns the Candidate(s) with the smallest lexicographic card list.
- `ArrayList<Candidate> smallestNumberOfExchangesTieBreakHelper(ArrayList<Candidate> candidates)`: returns the Candidate(s) with the smallest number of equations used.
- `ArrayList<Candidate> smallestEquationListTieBreakHelper(ArrayList<Candidate> candidates)`: returns Candidate(s) with the smallest equation set using the custom comparator that compares left and right sizes/lexicographic info
- `ArrayList<Candidate> cardPurchaseTieBreaker(ArrayList<Candidate> candidates)`:checks for best Candidate in order of: 1. max point, 2. max remaining inventory size, 3.smallest lexicographic inventory, 4. smallest card list by size and lexicographic.
- `ArrayList<Candidate> maxPointTieBreakHelper(ArrayList<Candidate> candidates)`: checks for best Candidate in order of: 1. least equations used, 2. card purchase tiebreaker, 3.smallest size/lexicographic equation list.
---
### Turn_State
**File:** `Turn_State.java` **Package:** `common`

**Edited**: Edited constructor for milestone 4 specifications and added a method to print the turn state according to testing guidelines.

**Constructor**
- `Turn_State(Inventory bankPebbles,Player activePlayer, ArrayList<Integer> otherPlayerScores, ArrayList<Card> visibleCards, ArrayList<Equation> equations)`

**Added Method**:
- `void printTurnState()`: method added to match milestone 4 expected output format.
---

## Testing


**Directory**: `test/java/xturn`
**Resource Location** `test/java/jTests/Four`

### Turn_StateTest
**File:** `Turn_StateTest.java`  **Directory**: `test/java/xturn`
**Resource Location** `test/java/jTests/Four`

**Purpose**: Runs testing requirements for this milestone that creates turn state by reading from STDIN.

**Tests**:
- `testTurnState0()`
- `testTurnState1()`
- `testTurnState2()`
---
### Turn_StateTestConsoleLauncher
**File:** `Turn_StateTestConsoleLauncher.java`  **Directory**: `test/java/xturn`
**Resource Location** `test/java/jTests/Four`

**Purpose**: Runs the tests in the `Turn_StateTest` file and ouputs the results to the console.

---
### CardComparatorTest
  **File:** `CardComparatorTest.java`  **Directory**: `test/java/utils`

**Purpose**: Tests our card comparator

**Tests**:
- `testCompare_whenFirstCardHasStar_shouldReturnPositive()`
- `testCompare_whenSecondCardHasStar_shouldReturnNegative()`
- `testCompare_whenBothCardsHaveStar_shouldUsePebbleComparison()`
- `testCompare_whenNeitherCardHasStar_shouldUsePebbleComparison()`
- `testCompare_whenBothCardsHaveSameStarStatusAndSamePebbles_shouldReturnZero()`
---
### CardListComparatorTest
**File:** `CardListComparatorTest.java`  **Directory**: `test/java/utils`

**Purpose**: Tests our card list comparator

**Tests**:
- `testDifferentSizes()`
- `testEqualLists()`
- `testDifferentContentSameSize()`
- `testEmptyLists()`
- `testOneEmptyList()`
---
### CardTransactionTest
**File:** `CardListComparatorTest.java`  **Directory**: `test/java/referee/transaction`

**Purpose**: Tests our card transaction mechanism.

**Tests**:
- `testExecuteSuccess()`
- `testExecuteFailure()`
- `testUndoExecuteSuccess()`
- `testUndoExecuteFailure()`
---
### EquationComparatorTest
**File:** `EquationComparatorTest.java`  **Directory**: `test/java/utils`

**Purpose**: Tests our equation comparator

**Tests**:
- `testIdenticalEquations()`
- `testDifferentLeftSide()`
- `testDifferentRightSide()`
- `testBothSidesDifferent()`
- `testEmptySides()`
---
### EquationListComparatorTest
**File:** `EquationListComparatorTest.java`  **Directory**: `test/java/utils`

**Purpose**: Tests our equation list comparator

**Tests**:
- `testIdenticalLists()`
- `testDifferentSizes()`
- `testDifferentElementsSameSize()`
- `testMultipleElementsWithDifferentComparisons()`
- `testEmptyLists()`
---
### EquationTransactionTest
**File:** `EquationTransactionTest.java`  **Directory**: `test/java/referee/transaction`

**Purpose**: Tests our equation transaction mechanism.

**Tests**:
- `testExecuteSuccess()`
- `testExecuteFailureDueToSenderPebbles()`
- `testExecuteFailureDueToReceiverPebbles()`
- `testExecuteWithEmptyEquation()`
---
### MaxNumCardsStrategyTest
**File:** `MaxNumCardsStrategyTest.java`  **Directory**: `test/java/player/strategy`

**Purpose**: Tests our strategy that recursively searches for best option with largest number of cards bought.

**Tests**:
- `testMaxCardsStrategyWithEnoughPebbles()`
- `testMaxCardsStrategyWithLimitedPebbles()`
- `testMaxCardsStrategyWithNoCardsAvailable()`
- `testMaxCardsStrategyWithNoPebbles()`
- `testMaxCardsStrategyWithMultipleTrades()`
---
### MaxScoreStrategyTest
**File:** `MaxScoreStrategyTest.java`  **Directory**: `test/java/player/strategy`

**Purpose**: Tests our strategy that recursively searches for best option with greatest number of points won.

**Tests**:
- `testBestCandidateCalculation1()`
- `testBestCandidateCalculationWithNoTrades()`
- `testBestCandidateCalculationWithMultipleCardPurchases()`
- `testBestCandidateCalculationWithMultipleTrades()`
- `testBestCandidateCalculationWithNoCardsAvailable()`
- `testBestCandidateCalculationWithInsufficientPebbles()`
---
### PebbleListComparatorTest
**File:** `PebbleListComparatorTest.java`  **Directory**: `test/java/utils`

**Purpose**: Tests our pebble list comparator

**Tests**:
- `testCompareBySize()`
- `testCompareSameSizeDifferentOrder()`
- `testCompareSameSizeSameOrder()`
- `testEmptyListVsNonEmptyList()`
---
### TieBreakerTest
**File:** `TieBreakerTest.java`  **Directory**: `test/java/player/strategy`

**Purpose**: Tests our tie breaking strategy.

**Tests**:
- `testCardPurchaseTieBreaker1()`
- `testExchangeAndPurchaseTieBreaker1()`
- `testExchangeAndPurchaseTieBreaker2()`
- `testMaxPointTieBreakHelper()`
- `testMaxRemainingInventoryTieBreakHelper()`
- `testSmallestInventoryTieBreakHelper()`
- `testSmallestCardListTieBreakHelper()`
- `testSmallestNumberOfExchangesTieBreakHelper()`
- `testSmallestEquationListTieBreakHelper()`
---
## Design

### player-protocol
**File**: `player-protocol.md` **Directory**: `Planning`

Memo outlines the player protocol flow between player and ref. A diagram shows the main communication needs.
---
## Running the Code
**Required Milestone Testing**
- to run the specific milestone testing that was asked of us locate the `Turn_StateTest` file in `test/java/xturn`.
- 
### Jar
- In the GameProject directory the testing task is packaged into the `Turn_StateTestConsoleLauncher.jar`
- Terminal command from GameProject Directory: `java --module-path Bazaar/javafx-sdk-21.0.5/lib --add-modules javafx.controls,javafx.graphics -jar Turn_StateTestConsoleLauncher.jar`
