## Memo: Player Interface
**TO**: CEOs  
**FROM**: Team Futatsu  
**DATE**: 10/28/24  
**SUBJECT**: AI Player Mechanics and Referee Control in Bazaar.

In our Bazaar implementation, the `Referee` assumes the role of game manager, walking each player through their turn.

The referee's responsibilities include:

- **Engaging players**: Informing them of the game’s state, as necessary, in the form of a `Turn_State`.
- **Managing turns**: Orchestrating the game’s flow by acquiring, evaluating, and initiating execution of each move.

### AI Player Interface Design

Below is a proposed interface for the mechanics of AI players, presented as a **method wish list**. Each method includes a description of the knowledge required to perform the action effectively.

#### 1. `updateTurnState()`
- **Purpose**: On each new turn a player should recieve an updated turn state from ref so they can make decisions.

#### 2. `drawOrExchange()`
- **Purpose**: The first part of every players turn can start with a pebble draw or using an equation for pebble exchange.
- **Knowledge Requirements**:
    - Knowledge of available resources (equations and cards) to determine if a card can be bought with current pebbles, with an addition of one random pebble, or if an equation would be beneficial to impact a bigger change in player inventory.
    - player can choose to skip any pebble transactions.
    - Using equations also relies on bank inventory.

#### 2. `buyOrSkip()`
- **Purpose**: Retrieves array list of cards wish to be bought as second part of their turn or an empty list if they do not wish to buy.
- **Knowledge Requirements**:
    - Access to visible cards and player's own inventory.

#### 3. `updateScore()`
- **Purpose**: If a card is bought, player must be given correct number of points based on pebbles left and if the card has a star.
- **Knowledge Requirements**:
    - Player's inventory pebble count and current score to add to.

#### 4. `updateCards()`
- **Purpose**: A player also gets the card they bought added to their collection

#### 5. `updateInventory()`
- **Purpose**: Pebbles need to be removed/added when equations are used or cards are bought or a random pebble is being acquired.
- **Knowledge Requirements**:
    - Access to player's inventory

#### 6. `skipAction()`
- **Purpose**: Declines to take a new action (e.g., skipping a draw or skipping card buying).
- **Knowledge Requirements**:
    - No additional knowledge required; simply notifies the referee to skip.

#### 7. `evaluateMove()`
- **Purpose**: Necessary to evaluate a move's validity and remove a player if necessary.
-  **Knowledge Requirements**:
    - Definition of a valid move.