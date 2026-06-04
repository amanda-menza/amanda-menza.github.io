# Renderables Package Documentation

## Overview
The renderables package contains the UI components and view management for the Bazaar game. It handles the graphical representation of game elements and user interactions.

## Core Components

### GameView
**Purpose**: Main view component for player interface.

**Important Methods**:
- `setToRender(GameBoard, Player, Referee)`: Sets up game elements to display
- `updateGameState()`: Updates UI based on current game state
- `handleCardClick(Card)`: Processes card selection events
- `launchApp()`: Initializes and displays the game interface

### RefView
**Purpose**: Extended view component for referee interface with additional bank information.

**Important Methods**:
- `setToRender(GameBoard, Player, Referee)`: Sets up game elements to display
- `updateGameState()`: Updates UI with referee-specific information
- `launchApp()`: Initializes and displays the referee interface

### CardsComponent
**Purpose**: Manages the display of game cards.

**Important Methods**:
- `setOnCardClick(Consumer<Card>)`: Sets card click handler
- `updateCards(List<Card>)`: Refreshes card display
- `renderCards()`: Creates visual card representations

### EquationsComponent
**Purpose**: Manages the display of game equations.

**Important Methods**:
- `updateEquations(List<Equation>)`: Refreshes equation display
- `renderEquations()`: Creates visual equation representations

### PlayerStatusComponent
**Purpose**: Displays player information and inventory.

**Important Methods**:
- `updateStatus(String, int, Map<Pebble, Integer>)`: Updates player stats
- `handlePebbleClick()`: Processes pebble selection events

### TurnStatusComponent
**Purpose**: Shows current turn state including bank information.

**Important Methods**:
- `updateStatus(Player, Inventory)`: Updates turn state display
- `renderBankStatus()`: Shows current bank inventory

## Layout Constants

### Common Display Settings
- Background dimensions: 1200x800
- Scene dimensions: 1200x800
- Component spacing: 5-25 pixels
- Standard padding: 10 pixels

### Style Constants
- Background color: #F5DEB3 (Wheat)
- Card dimensions: 110x150
- Pebble radius: 8 pixels
- Font settings: 20px bold for titles

## Event Handling

### Click Events
- Card selection
- Pebble addition
- Equation usage

### State Updates
- Player inventory changes
- Bank inventory updates
- Score modifications
- Card availability updates

## Component Hierarchy
