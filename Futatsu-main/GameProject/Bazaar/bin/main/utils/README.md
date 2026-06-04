# Utils Package Documentation

## Overview
The utils package provides utility classes for data conversion, comparison, and string manipulation used throughout the Bazaar game implementation.

## Core Utilities

### Bank Utilities
**Purpose**: Handles bank-related conversions.

**Important Methods**:
- `convertToBank(String)`: Converts STDIN string to Bank object

### Card Utilities
**Purpose**: Manages card conversions and formatting.

**Important Methods**:
- `convertToCardList(String)`: Converts STDIN string to Card list
- `convertToCard(String)`: Creates single Card from string
- `convertCardListToString(ArrayList<Card>)`: Formats card list for output

### Equation Utilities
**Purpose**: Handles equation conversions and validation.

**Important Methods**:
- `convertEquation(String, String)`: Creates Equation from string input
- `formatRule(ArrayList<Equation>)`: Formats equations for output
- `validateRules(Turn_State, ArrayList<Equation>)`: Validates equation sequences

### String Utilities
**Purpose**: Common string manipulation operations.

**Important Methods**:
- `trimBrackets(String)`: Removes square brackets
- `trimCurlyBrackets(String)`: Removes curly braces

### Game State Utilities
**Purpose**: Manages game state conversions.

**Important Methods**:
- `convertStdInToGameStateWithActors()`: Creates game state from input strings

### Pebble Utilities
**Purpose**: Handles pebble-related conversions.

**Important Methods**:
- `convertToPebbles(String, String)`: Creates Pebble list from string
- `convertPebbleListToString(ArrayList<Pebble>)`: Formats pebble list for output

## Comparators

### Card Comparators
- **CardComparator**: Compares cards by star status and pebbles
- **CardListComparator**: Compares card lists by size then contents
- **CandidateCardListComparator**: Compares candidates by cards bought

### Equation Comparators
- **EquationComparator**: Compares equations by sides
- **EquationListComparator**: Compares equation lists by size then contents
- **CandidateEquationListComparator**: Compares candidates by equations used

### Player Comparators
- **PlayerScoreComparator**: Compares players by score
- **CandidateInventoryComparator**: Compares candidates by remaining inventory

### Pebble Comparators
- **PebbleListComparator**: Compares pebble lists by size then lexicographically

## Player Utilities

### PlayerUtils
**Purpose**: Handles player-related conversions.

**Important Methods**:
- `convertToPlayerList(String)`: Creates Player list from string
- `convertToPlayer(String)`: Creates single Player from string
- `convertToPlayerScoreList(String)`: Creates PlayerScore list from string

## Random Utilities
**Purpose**: Provides random number generation.

**Important Methods**:
- `getRandom(int)`: Generates random number within bound

For detailed implementation examples, refer to the individual class files in the codebase.
