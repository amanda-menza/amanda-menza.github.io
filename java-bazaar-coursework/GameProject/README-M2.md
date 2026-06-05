# Bazaar: The Futatsu Team Version

## Project Purpose
_This project aims to simulate the game of Bazaar as defined by our class guidelines._

**Aims of Milestone 2:**
- creating a set of equations

- filtering the set of equations according to whether a player can use them to trade with its pebbles

- rendering the table of equations graphically

- creating cards

- determining whether a player can acquire a card with its pebbles

- rendering cards graphically

---

## Table of Contents
**[Files](#file-descriptions)**
- [Card](#card)
- [CardRender](#cardrender)
- [Equation](#equation)
- [EquationRender](#equationrender)
- [GameBoard](#gameboard)
- [Inventory](#inventory)
- [JavaFXApplication](#javafxapplication)
- [Pebble](#pebble)
- [PebbleCountRecord](#pebblecountrecord)
- [Player](#player)
- [RandomUtil](#randomutil)
- [Referee](#referee)
- [Renderable](#renderable)

**[Testing](#unit-tests)**
- [CardTest](#cardtest)
- [EquationTest](#equationtest)

**[Running the Code](#running-the-code)**

---

## File Descriptions

### Card
**File:** `Card.java` **Package:** `common`

**Purpose**: Logically define what properties a card in Bazaar has, assign values to these properties, and check if a card can be bought given a set of pebb. Each card is randomly assigned 5 pebbles and the presence of a star.

**Constructor**
- `Card()`

**Fields**:
- `ArrayList<Pebble> pebbles`
- `Boolean hasStar`

**Important Methods**:
- `pebbleGen()`: handles random pebble generation for constructor
- `starGen()`: handles random star generation for constructor
- `canBuyCard(ArrayList<Pebble>)`: checks if pebble collection can purchase card

---
### CardRender
**File:** `CardRender.java` **Package:** `common`

**Purpose**: Use javafx libraries to turn card properties into a graphical representation. Implements `Renderable` interface.

**Constructor**
- `CardRender(Card)`

**Fields**:
- `Card card`

**Important Methods**:
- `render()`: returns a Pane with pebbles represented as 5 circles and a star if needed.
- `createStar(double, double, double, double, int)`: returns a Polygon

---
### Equation
**File:** `Equation.java` **Package:** `common`

**Purpose**: Logically define the properties of an equation in Bazaar, randomly generate these properties, and determine if a given set of pebbles can use the equation. 

**Constructor**
- `Equation()`

**Fields**:
- `ArrayList<Pebble> leftSide`
- `ArrayList<Pebble> rightSide`

**Important Methods**:
- `generateEquation()`: called from constructor to randomize and set the fields.
- `generateSide(ArrayList<Pebble>)`: helper method for `generateEquation()`
- `canUseEquation(ArrayList<Pebble>)`: checks if pebble collection can use equation(left or right side)
---
### EquationRender
**File:** `EquationRender.java` **Package:** `common`

**Purpose**:Use javafx libraries to turn equation properties into a graphical representation. Implements `Renderable` interface.

**Constructor**
- `EquationRender(Equation)`

**Fields**:
- `Equation equation`

**Important Methods**:
- `render()`: returns a Pane with circles for pebbles on left and right side with equal sign in the middle.

---
### GameBoard
**File:** `GameBoard.java` **Package:** `common`

**Purpose**: Initialize and hold the set of equations and cards for game play.

**Constructor**
- `GameBoard()`

**Fields**:
- `ArrayList<Card> visibleCards`
- `ArrayList<Card> invisibleCards`
- `ArrayList<Equation> equations`

**Important Methods**:
- `initializeCards()`: called by constructor to generate the 4 visible and 16 invisible cards
- `initializeEquations()`: called by constructor to generate 10 equations

---
### Inventory
**File:** `Inventory.java` **Package:** `common`

**Purpose**: Class to represent a collection of pebbles and handle manipulation to that collection like adding and removing.

**Constructor**
- `Inventory()`
- `Inventory(int, int, int, int, int)`

**Fields**:
- `ArrayList<Pebble> pebbles`
- `int pebbleCount`

**Important Methods**:
- `removePebble(Pebble)`: method to remove a single pebble
- `addPebble(Pebble)`: method to add a single pebble
- `removePebbles(ArrayList<Pebble>)`: method to remove a group of pebbles
- `addPebbles(ArrayList<Pebble>)`: method to add a group of pebbles
- `getPebbleCountRecord()`: method to get the count of each color of pebble in the inventory as a record

---
### JavaFXApplication
**File:** `JavaFXApplication.java` **Package:** `common`

**Purpose**: To handle the display of cards, equations, and players in a javaFX application. A user can manually add pebbles to an inventory and graphically see, with green highlighting, which equations and cards are valid to use.

**Constructor**
- `JavaFXApplication()`

**Fields**:
- `BorderPane mainLayout`
- `HBox cardContainer`
- `VBox equationContainer`
- `Player player1`
- `Referee referee`
- `List<Card> cards`
- `List<Equation> equations`

**Important Methods**:
- `launchApp()`: called by main to launch the instance
- `setToRender(GameBoard)`: called by `launchApp()` to get visible cards and equations from `GameBoard` and set the cards and equations field
- `displayCards()`: renders 4 visible cards and highlights the ones players can use in green
- `displayEquations()`: renders 10 game equations and highlights the ones players can use in green
- `displayPlayer()`: shows number of each pebble a player has and lets user manually increase/decrease count

---
### Pebble
**File:** `Pebble.java` **Package:** `common`

**Purpose**: Enum class to represent a pebble with a specified color.

**Constructor**
- `Pebble(Color)`

**Fields**:
- `Color color`

**Important Methods**:
- `makeCircle(int, int, int)`: returns Circle representation of pebble

---
### PebbleCountRecord
**File:** `PebbleCountRecord.java` **Package:** `common`

**Purpose**: Concisely represent a pebble collection and make it easy to determine number of each pebble color for efficient transactions.

**Constructor**
- `PebbleCountRecord(int, int, int, int, int)`
---
### Player
**File:** `Player.java` **Package:** `common`

**Purpose**: Represent a participant in the Bazaar game and defining their holdings.

**Constructor**
- `Player(String)`

**Fields**:
- `int score`
- `Inventory myInventory`
- `ArrayList<Card> myCards`

**Important Methods**:
- `getInventory()`: returns player pebbles as an Inventory.
- `addCard()`: handles player purchasing card
- `addPebble()`: handles player introducing new pebble to inventory

---
### RandomUtil
**File:** `RandomUtil.java` **Package:** `common`

**Purpose**: Wrap Math.random() so values can be mocked in unit tests.

**Important Methods**:
- `getRandom(int)`: gets random int from 0 to int bound-1

---
### Referee
**File:** `Referee.java` **Package:** `common`

**Purpose**:Omniscient observer of the game and controller of player interaction with game. Acts as a middle man so there is separation between player and game element access.

**Constructor**
- `Referee()`

**Fields**:
- `GameBoard gameBoard`
- `ArrayList<Player> players`
- `int currentPlayerIndex`

**Important Methods**:
- `addPlayer()`: player enters game
- `getCurrentPlayer()`: return player with current turn
- `canUseEquation(Equation, Player)`: checks if given player can use given equation by calling the canUseEquation method of the equation
- `canBuyCard(Card,Player)`: checks if given player can purchase given card by calling the canBuyCard method of the card

---
### Renderable
**File:** `Renderable.java` **Package:** `common`

**Purpose**: Interface for classes that need to be graphically rendered.

**Important Methods**:
- `render()`: returns Pane that serves as the root for the scene
---
## Unit Tests
**Directory**: `test/java/common`

### CardTest
**File:** `CardTest.java`

**Tests**:
- `testCardGen1()`: Mocks, and asserts true, the random assignment of a card with pebbles blue, green, red, white, yellow and a star.
- `testCardGen2()`: Mocks, and asserts true, the random assignment of a card with pebbles red, red, red, red, red and no star.
- `testCanBuyCard()`: Mocks a card generation and creates 2 inventories. Asserts that only the correct inventory is found to be able to successfully buy.
---
### EquationTest
**File:** `EquationTest.java`

**Tests**:
- `testEqnGen1()`: Mocks, and asserts true, the random assignment of an equation with a specified number and color of pebbles on each side.
- `testCanUseEquation()`: Mocks an equation generation and creates 2 inventories. Asserts that only the correct inventory is found to be able to use the equation.
---
## Running the Code
1. Locate the main.java file in the `main/java` directory.
2. Run the main method and wait for a JavaFX application to open.
3. Create your desired Player inventory and watch card/equation availability change.



