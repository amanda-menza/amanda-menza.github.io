# Common Package Documentation

## Overview
The common package contains core game components and utilities for the Bazaar game implementation. It includes classes for game pieces, rendering, transactions, and rule management.

## Classes

### Card
**Purpose**: Represents a card in the Bazaar game with pebble requirements and star status.

**Important Methods**:
- `canBuyCard(ArrayList<Pebble>)`: Checks if a player can buy the card with their pebbles
- `initializeNonRandomCard(ArrayList<Pebble>, Boolean)`: Creates a card with specified pebbles and star status

### CardRender
**Purpose**: Handles JavaFX rendering of cards.

**Important Methods**:
- `render()`: Creates a visual representation of a card
- `renderGameView()`: Creates a compact version of the card for game view
- `createStar()`: Generates a star polygon for cards with stars

### Equation
**Purpose**: Represents an exchange equation with left and right sides of pebbles.

**Important Methods**:
- `canUseEquation(ArrayList<Pebble>)`: Checks if player can use the equation
- `playerCanUseLeftSide()`: Validates if player can use left side and bank can use right side
- `flipEquation()`: Creates new equation with sides swapped

### EquationRender
**Purpose**: Handles JavaFX rendering of equations.

**Important Methods**:
- `render()`: Creates visual representation of equation
- `renderGameView()`: Creates compact version for game view

### Inventory
**Purpose**: Manages collections of pebbles.

**Important Methods**:
- `addPebble()/removePebble()`: Modifies inventory contents
- `getPebbleCounts()`: Returns map of pebble colors to quantities
- `hasValidPebbleCounts()`: Validates inventory state

### IRuleBook
**Purpose**: Interface defining game rule validation methods.

**Important Methods**:
- `isValidTurn()`: Validates player turn actions
- `canUseEquation()/canBuyCard()`: Validates specific game actions
- `filterEqSet()/filterCardList()`: Returns valid options for player actions

### JavaFXApplication
**Purpose**: Main application class for visual game interface.

**Important Methods**:
- `start()`: Initializes JavaFX application
- `displayCards()/displayEquations()`: Renders game components

### Pebble
**Purpose**: Enum representing colored game pieces.

**Important Methods**:
- `makeCircle()`: Creates visual circle representation
- `getColor()`: Returns JavaFX color for rendering

### Renderable
**Purpose**: Interface for components that can be visually displayed.

**Methods**:
- `render()`: Creates visual representation of component

### RuleBook
**Purpose**: Implements game rules and validation logic.

**Important Methods**:
- `areEquationsValid()/areCardsValid()`: Validates sequences of game actions
- `filterEqSet()/filterCardList()`: Returns valid game options

### Turn_State
**Purpose**: Represents the game state during a player's turn.

**Important Methods**:
- `getBankInventory()/getVisibleCards()`: Access game state
- `printTurnState()`: Outputs current state

### Transaction Package

#### CardTransaction
**Purpose**: Handles card purchase logic.

**Important Methods**:
- `execute()`: Performs card purchase
- `undoExecute()`: Reverses card purchase

#### EquationTransaction
**Purpose**: Handles equation exchange logic.

**Important Methods**:
- `execute()`: Performs pebble exchange

#### ITransaction
**Purpose**: Interface for game transactions.

**Methods**:
- `execute()`: Performs transaction logic

## Helper Classes

### PebbleOrExchanges
**Purpose**: Represents player's choice between taking a pebble or making exchanges.

### SequenceOfCards
**Purpose**: Represents sequence of card purchases in a turn.

For detailed implementation examples, refer to the individual class files in the codebase.
