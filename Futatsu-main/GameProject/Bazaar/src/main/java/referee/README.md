# Referee Package Documentation

## Overview
The referee package contains the core game management and rule enforcement components for the Bazaar game. It handles game state, player turns, and ensures all game rules are followed.

## Core Classes

### Referee
**Purpose**: Main controller class that manages game flow and player interactions.

**Important Methods**:
- `initGameActions()`: Sets up game with players and initial state
- `runGame()`: Executes main game loop
- `evaluateMove()`: Validates player moves
- `executeMove()`: Performs validated player actions
- `notifyGameOver()`: Handles game end conditions

### Game_State
**Purpose**: Manages the overall game state and state transitions.

**Important Methods**:
- `startGame()`: Initiates game sequence
- `isGameOver()`: Checks game ending conditions
- `updateActivePlayerTurn()`: Handles player turn transitions
- `getPlayerRank()`: Returns sorted player rankings
- `removeIllegalPlayer()`: Handles player disqualification

### GameBoard
**Purpose**: Manages game components like cards and equations.

**Important Methods**:
- `initializeEquations()`: Sets up game equations
- `initializeCards()`: Creates and manages card deck
- `getInvisibleCards()`: Accesses hidden card deck

### Bank
**Purpose**: Manages the game's pebble bank.

**Important Methods**:
- `addPebbles()`: Adds pebbles to bank
- `removePebbles()`: Removes pebbles from bank
- `isEmpty()`: Checks if bank is empty

## Interfaces

### RefActionsForGameState
**Purpose**: Defines referee actions available to game state.

**Important Methods**:
- `getFirstPlayerRequest()`: Handles first phase of player turn
- `getSecondPlayerRequest()`: Handles second phase of player turn
- `evaluateMove()`: Validates move legality
- `executeMove()`: Performs move actions

### GameStateActions
**Purpose**: Defines game state actions available to referee.

**Important Methods**:
- `setupGame()`: Initializes game state
- `getTurnState()`: Gets current turn information
- `isGameOver()`: Checks end conditions
- `updateActivePlayerScore()`: Updates player scoring

### GameStateActionsForRef
**Purpose**: Extended interface for referee-specific game state actions.

**Important Methods**:
- `setInitialActivePlayer()`: Sets first player
- `removeIllegalPlayer()`: Handles player disqualification
- `getWinnersAndCheaters()`: Returns game results

## State Management

### Game_State.State Enum
**Purpose**: Defines game state machine states.

**States**:
- `SETUP`: Initial game setup
- `FIRST_REQUEST`: First phase of player turn
- `SECOND_REQUEST`: Second phase of player turn
- `EVALUATE_MOVE`: Move validation
- `EXECUTE_MOVE`: Move execution
- `NEXT_PLAYER_TURN`: Player transition
- `GAME_OVER`: Game completion

Each state includes:
- `nextState()`: Determines next state transition
- `performStateAction()`: Executes state-specific logic

For detailed implementation examples, refer to the individual class files in the codebase.
