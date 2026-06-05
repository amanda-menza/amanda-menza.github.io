# Player Package Documentation

## Overview
The player package contains the core player implementation and strategy components for the Bazaar game. It handles player actions, decision-making, and score management.

## Core Classes

### IPlayer
**Purpose**: Interface defining the contract for player implementations.

**Important Methods**:
- `setup(ArrayList<Equation>)`: Initializes player with game equations
- `requestPebbleOrTrades(Turn_State)`: Decides between taking a pebble or making trades
- `requestCards(Turn_State)`: Determines which cards to purchase
- `win(boolean)`: Handles game end notification

### Player
**Purpose**: Main implementation of IPlayer interface.

**Important Methods**:
- `findCurrentCandidate()`: Determines best move using strategy
- `updateStrategyForTurn()`: Updates strategy with current game state
- `setStrategyType()`: Sets player's strategy (max points or max cards)

### Mechanism
**Purpose**: Wrapper class for player-referee interaction.

**Important Methods**:
- `setup()`: Initializes player
- `requestPebbleOrTrades()`: Forwards trade decisions
- `requestCards()`: Forwards card purchase decisions

### PlayerScore
**Purpose**: Manages player's score tracking.

**Important Methods**:
- `updateScore()`: Modifies player's current score
- `getScore()`: Retrieves current score

## Strategy Package

### IStrategy
**Purpose**: Interface for different player strategies.

**Important Methods**:
- `getBestCandidate()`: Returns best move based on strategy
- `updateStrategy()`: Updates with current game state

### AStrategy
**Purpose**: Abstract base class implementing common strategy logic.

**Important Methods**:
- `exchangePurchaseRecursion()`: Recursively evaluates exchange options
- `buyCardRecursive()`: Recursively evaluates card purchase options

### Strategy Implementations
- **MaxScoreStrategy**: Optimizes for maximum points
- **MaxNumCardsStrategy**: Optimizes for maximum number of cards

### Supporting Classes

#### Candidate
**Purpose**: Represents a possible move sequence.

**Important Fields**:
- `equations`: List of equations to use
- `cardsBought`: Cards to purchase
- `totalPoints`: Points from sequence
- `remainingInventory`: Remaining pebbles

#### PlayerMoveState
**Purpose**: Tracks game state during move evaluation.

**Important Methods**:
- `executeFunctionalCardPurchase()`: Simulates card purchase
- `executeFunctionalEquationPurchase()`: Simulates equation exchange

#### TieBreaker
**Purpose**: Resolves ties between equally valued moves.

**Important Methods**:
- `cardPurchaseTieBreaker()`: Resolves card purchase ties
- `exchangeAndPurchaseTieBreaker()`: Resolves exchange sequence ties

#### AwardPoints
**Purpose**: Calculates points for card purchases.

**Important Methods**:
- `calculatePoints()`: Determines points based on remaining pebbles and card stars

## Exceptions

### PlayerException
**Purpose**: Custom exception for player-related errors.

For detailed implementation examples, refer to the individual class files in the codebase.
