# Milestone 3

## Project Purpose
_This project aims to simulate the game of Bazaar as defined by our class guidelines._

**Aims of Milestone 3:**
- determining whether a game is over
- extracting the turn state from the referee’s game state representation
- graphical rendering the referee’s game state
- graphical rendering the turn state data transmitted from the referee to the player
- write a memo to designa. player interface in the form of a method/function wish list
- integration testing

---

## Table of Contents
**[Files](#file-descriptions)**
- [Bank](#bank)
- [Equation](#equation)
- [EquationUtil](#equationutil)
- [Game_State](#game_state)
- [GameStateActions](#gamestateactions)
- [PebbleUtil](#pebbleutil)
- [Player](#player)
- [PlayerFromRefActions](#playerfromrefactions)
- [PlayerScoreComparator](#playerscorecomparator)
- [Referee](#referee)
- [RefereeActions](#refereeactions)
- [RefFromPlayerActions](#reffromplayeractions)
- [Turn_State](#turn_state)
- [GameView](#gameview)
- [RefView](#refview)
- [EquationsComponent](#equationscomponent)
- [CardsComponent](#cardscomponent)
- [PlayerStatusComponent](#playerstatuscomponent)
- [TurnStatusComponent](#turnstatuscomponent)

**[Testing](#testing)**
- [EquationExchangeTest](#equationexchangetest)
- [Game_StateTest](#game_statetest)
- [RefereeTest](#refereetest)

**[Design](#design)**
- [player-interface.md](#player-interface.md)

**[Running the Code](#running-the-code)**

---

## File Descriptions

### Bank
**File:** `Bank.java` **Package:** `referee`

**Purpose**: Represent the game's bank with an Inventory. New bank gets initialized with 20 of each pebble color.

**Constructor**
- `Bank()`

**Fields**:
- `Inventory bankInventory`

**Important Methods**:
- `addPebbles(ArrayList<Pebble>)`: adds group of pebbles by calling addPebbles on `Inventory` object
- `removePebbles(ArrayList<Pebble>)`: removes group of pebbles by calling removePebbles on `Inventory` object
- `isEmpty()`: checks if bank is empty of pebbles

---
### Equation
**File:** `Equation.java` **Package:** `common`

**Edited**: Defined in M2 but modifications made to take into account player AND bank inventories.

**Added Constructor**
- `Equation(leftSide,rightSide)`

**Added Methods**:
- `flipEquation()`: switch right and left sides.
- `playerCanUseLeftSide(playerInvenry,bankInventory)`: checks that player can use left side and bank can use right side. Pre flip equation if needed before calling method.
---
### EquationUtil
**File:** `EquationUtil.java` **Package:** `utils`

**Purpose**: Helper method to create equation objects from std in.

**Methods**:
- `convertEquation(String)`: returns equation from string of pebble colors and = sign
---
### Game_State
**File:** `Game_State.java` **Package:** `referee`

**Purpose**:Define a state machine flow for the game and define actions to perform at each state. Hold omniscient information about game and players.

**Constructor**
- `Game_State()` : current state is set to `SETUP`

**Fields**:
- `Bank bank`
- `Player activePlayer`
- `ArrayList<Player> players`
- `int activePlayerIndex`
- `State currentState`
- `GameBoard gameBoard`
- `RefereeActions referee`
- `boolean checkLastRound` : if bank is empty note that this might be the last round. Rotate through all players after this is made true to see if they can buy a card.
- `int checkLastRoundCards` : number of invisible cards left after noting it could be last round. Used to see if any cards were bought after full player rotation.

**States**
- `SETUP`
- `ACTIVE_PLAYER_TURN`
- `EVALUATE_MOVE`
- `EXECUTE_MOVE`
- `NEXT_PLAYER_TURN`
- `GAME_OVER`

**Important Methods**:
- `nextState()`: defines current state's next state
- `performStateAction()`: each state defines this to call a custom state method.
- `setReferee(RefereeActions)`: sets a ref interface for the game state.
- `startGame()`: keeps calling next states and performing actions on each state.
- `getPlayerRank()`: uses custom comparator to rank players by score.
- `setupGame()`: creates a new bank, game board, player list.
- `updateActivePlayer()`: action of the NEXT_PLAYER_TURN state.
- `notifyGetPlayerMove()`: action of the ACTIVE_PLAYER_TURN state to notify ref.
- `notifyEvaluateMove()`: action of EVALUATE_MOVE state to notify ref to validate.
- `notifyExecuteMove()`: action of EXECUTE_MOVE. Once validated, tells ref to execute.
- `endGame()`: action of GAME_OVER state. Returns player rank summary.
- `isGameOver()`: checks game ending conditions.
- `removeIllegalPlayer()`: removes misbehaving player sent from ref.
- `getTurnState()`: returns turn state to ref.
- `getCurrentScores()`: used for turn state summary.
- `addPlayer()`: add to list of players.
---
### GameStateActions
**File:** `GameStateActions.java` **Package:** `referee`

**Purpose**: Set of game state methods shared with ref as an interface.

**List of Methods**
- `setupGame()`
- `startGame()`
- `setReferee(RefereeActions)`
- `getTurnState()`
- `getPlayerRank()`
- `isGameOver()`
- `removeIllegalPlayer()`
- `addPlayer()`
- `getGameBoard()`
---
### PebbleUtil
**File:** `PebbleUtil.java` **Package:** `utils`

**Purpose**: Helper method to create pebble lists from std in.

**Methods**:
- `convertToPebbles(String)`: returns pebble array list from string of pebble colors
---
### Player
**File:** `Player.java` **Package:** `common`

**Edited**: Edits made for ref interaction.

**Added Fields**:
- `Turn_State myTurnState`

**Added Methods**:
- `setupTurn(Turn_State)`: updates turn state field
- `updateScore(int)`: adds given int to score.
---
### PlayerFromRefActions
**File:** `PlayerFromRefActions.java` **Package:** `common`

**Purpose**: Interface that contains player methods available to ref.

**List of Methods**
- `setupTurn(Turn_State)`
- `updateScore(int)`
---
### PlayerScoreComparator
**File:** `PlayerScoreComparator.java` **Package:** `utils.player_utils`
**Purpose**: Custom comparator to sort player list by score for player rankings.
---
### Referee
**File:** `Referee.java` **Package:** `referee`

**Edited**: Methods added for player and game state interactions.

**Edited Constructor**
- `Referee(GameStateActions)`

**Edited Fields**
- `GameStateActions gameState`
- `Player activePlayer`
- `Turn_State currentTurnState`
- `ArrayList<Player> endGameReport`

**Edited Methods**
- `initGame(ArrayList<Player>)`: sends list of starting players to game state.
- `notifyAddPlayer(Player)`: sends player to be added to game state.
- `updateActivePlayer(Player)`: updates on every new turn.
- `getPlayerMove()`: gets turn state from game and sets up active players turn. Needs to be completed.
- `evaluateMove()`: check validity of player move. Needs to be completed.
- `executeMove()`: perform necessary transactions on valid move. Needs to be completed.
- `notifyGameOver(ArrayList<Player> rank)`: sets end game report with current player rank list.
- `canUseEquation(Equation, Player)`: calls method from `Equation` using player `Inventory` and current bank `Inventory`.
- `filterEqSet(ArrayList<Pebble> playerWallet, ArrayList<Pebble> bank, ArrayList<Equation> equations)` : returns array list of equations player can validly use as their original or flipped version.
---
### RefereeActions
**File:** `RefereeActions.java` **Package:** `referee`

**Purpose**: Interface with ref methods available from game state.

**List of Methods**
- `updateActivePlayer(Player)`
- `getPlayerMove()`
- `evaluateMove()`
- `executeMove()`
- `notifyGameOver(ArrayList<Player>)`
- `initGame(ArrayList<Player>`
- `filterEqSet(ArrayList<Pebble> playerWallet, ArrayList<Pebble> bank, ArrayList<Equation> equations)`
---
### RefFromPlayerActions
**File:** `RefFromPlayerActions.java` **Package:** `referee`

**Purpose**: Interface so player can communicate with ref.
Needs implementation.

---
### Turn_State
**File:** `Turn_State.java` **Package:** `common`

**Purpose**: Given to player on every turn by ref.

**Constructor**
- `Turn_State(Inventory bankPebbles,Game_State.State activePlayerState, ArrayList<Integer> playerScores)`

**Fields**:
- `Inventory bankPebbles`
- `Game_State.State activePlayerState`
- `ArrayList<Integer> playerScores`
---

### GameView
**File:** `GameView.java` **Package:** `renderables`

**Purpose**: Render the turn state that the player will see to the screen.

**Fields**:
- `GameBoard gameBoard`
- `Player player`
- `Referee referee`

---
### RefView
**File:** `RefView.java` **Package:** `renderables`

**Purpose**: Render the game state that the ref will see to the screen. Basically GameView plus the bank stats.

**Fields**:
- `GameBoard gameBoard`
- `Player player`
- `Referee referee`

---

### EquationsComponent
**File:** `EquationsComponent.java` **Package:** `renderables`

**Purpose**: Render the equations that the player will see to the screen into the GameView.

**Fields**:
- `VBox equationsList` : what will hold the graphical representation of the equations
- `List<Equation> equations` : list of equations to be displayed

**Constructor**
- `EquationsComponent()`

**Methods**:
- `renderEquations()`: renders the equations to the screen
- `updateEquations()`: updates the equations on the screen

---

### CardsComponent
**File:** `CardsComponent.java` **Package:** `renderables`

**Purpose**: Render the cards that the player will see to the screen into the GameView.

**Fields**:
- `GridPane cardsGrid` : what will hold the graphical representation of the cards
- `List<Card> cards` : list of cards to be displayed
- `Consumable<Card> onCardClick` : action to be taken when a card is clicked


**Constructor**
- `CardsComponent()`

**Methods**:
- `renderCards()`: renders the cards to the screen
- `updateCards()`: updates the cards on the screen
- `setOnCardClick()`: sets the action for when a card is clicked

---

### PlayerStatusComponent

**File:** `PlayerStatusComponent.java` **Package:** `renderables`

**Purpose**: Render the player status that the player will see to the screen into the GameView. Should include pebble counts, player name, and player score.

**Fields**: 
- `HBox playerSection` : what will hold the graphical representation of the player name
- `HBox scoreSection` : what will hold the graphical representation of the player score
- `HBox pebbleSection` : what will hold the graphical representation of the player pebble counts
- `Player player` : the player to be displayed and whose data will be displayed
- `Runnable onPebbleAdded` : action to be run when a pebble is added to the player's inventory

**Constructor**
- `PlayerStatusComponent(Player player, Runnable onPebbleAdded)`

**Methods**:
- `updateStatus()`: Updates the player status on the screen

---

### TurnStatusComponent

**File:** `TurnStatusComponent.java` **Package:** `renderables`

**Purpose**: Render the turn status that the player will see to the screen into the RefView. Should include the data for the active player and the bank values.

**Fields**:
- `PlayerStatusComponent playerSection` : what will hold the graphical representation of the player status
- `HBox bankSection` : what will hold the graphical representation of the bank values

**Constructor**
- `TurnStatusComponent(Player player, Inventory bankInventory, Runnable onPebbleAdded)`

**Methods**:
- `updateStatus()`: Updates the turn status on the screen

---

## Testing
**Directory**: `test/java/xeq`
**Resource Location** `test/java/jTests/Three`

### EquationExchangeTest
**File:** `EquationExchangeTest.java`

**Tests**:
- `testEquationExchange0()`: One valid rule output test
- `testEquationExchange1()`: 2 valid rule outputs, second one uses flipped equation
- `testEquationExchange2()`: no valid rules
---
### Game_StateTest
**File:** `Game_StateTest.java`

**Tests**:
- `testInitialStateIsSetup()`: assert the setUp stage as initial
- `testStateTransitions()`: validate each nextState() output
- `testSetupGame()`: assert game board, players, and bank are initialized
- `testNotifyGetPlayerMove()`: test the action of ACTIVE_PLAYER_TURN state
- `testEvaluateMove()`: test action of EVALUATE_MOVE state
- `testExecuteMove()`: test action of EXECUTE_MOVE state
- `testGameOverTransition()`: test game end function
- `testNextPlayerTurn()`: test action of NEXT_PLAYER_TURN state
---
---
### RefereeTest
**File:** `RefereeTest.java`

**Tests**:
- `testInitGameWithInvalidPlayerCount()`: assert that the illegal number of players exception is thrown
- `testInitGameWithValidPlayerCount()`: validate game setup goes correctly with a valid number of players
- `testNotifyAddPlayer()`: verify game state is called to add player
- `testUpdateActivePlayer()`: test that active player updates correctly
- `testGetTurnState()`: verify game state and ref exchange turn state
- `testGetPlayerMove()`: verify ref set up to communicate with player
- `testExecuteMove()`: test referee.executeMove()
- `testCanUseEquation()`: test action of ref verifying equation
- `testCanBuyCard()`: test action of ref verifying card buy
- `testFilterEqSet()`: test action of ref filtering set of equations
---
## Running the Code
**Required Milestone Testing**
- to run the specific milestone testing that was asked of us locate the EquationExchangeTest file in `test/java/xeq`.
- You can run the main method for custom input or the test cases for the 3 hardcoded input files.

**Rendering**
- To run the javafx application run main in the root folder /java.
- Comment and uncomment the corresponding methods in lines 39-40 to view the GameView and RefView respectively.

## Jar Files
- to see the turn state run `java -jar Turn_State.jar` from `GameProject` directory.
- to see the game state run `java -jar Game_State.jar` from `GameProject` directory.
- to give user input for the test scenario in this milestone regarding equation exchanges run `java --module-path Bazaar/javafx-sdk-21.0.5/lib --add-modules javafx.controls,javafx.graphics -jar EquationExchangeMain.jar` from the `GameProject` directory.
- to run a file that runs all 3 of our test cases run `java --module-path Bazaar/javafx-sdk-21.0.5/lib --add-modules javafx.controls,javafx.graphics -jar EquationExchangeTestLauncher.jar`
- to see the inputs and outputs of our test files on the console run `java --module-path Bazaar/javafx-sdk-21.0.5/lib --add-modules javafx.controls,javafx.graphics -jar EquationExchangeConsoleTest.jar`