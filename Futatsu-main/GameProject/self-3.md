## Self Evaluation Form for Milestone 3

0. the data representation for the referee's knowledge about the player, including its interpretation

For this checkpoint, the referee gets passed an instance of a `Player` that is the `currentPlayer` from the `GameState`. It's interpretation is the same of a `Player`, in that it has an `Inventory` and functions get information about itself and change it's inventory contents. 
https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/7abe3182c53a3d9d26847e2f32a7d67f0d1328d4/GameProject/Bazaar/src/main/java/referee/Game_State.java#L160C5-L167C6

1. determining whether a game is over, its signature and purpose statement

Signature:
   public boolean isGameOver()
Purpose:
   Called after each move is executed to check if game is over
   return true if end game conditions met

https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/main/java/referee/Game_State.java#L195C4-L209C6

2. extracting the turn state from the referee’s game state representation, its signature and purpose statement
Referee has a GameStateActions interface field that it calls on:         [currentTurnState=gameState.getTurnState();](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/main/java/referee/Referee.java#L35C9-L35C51)
[Game state gives ref the necessary information as new turn state object](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/main/java/referee/Game_State.java#L220C5-L228C6)
[Turn_State class](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/main/java/common/Turn_State.java#L7C1-L27C2)
Purpose: Given to player on every turn by ref

4. graphical rendering the referee’s game state its signature and purpose statement; and
[Purpose: Render the game state that the ref will see to the screen. Basically GameView plus the bank stats.](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/main/java/renderables/RefView.java#L83C5-L135C1)

4. graphical rendering the turn state data transmitted from the referee to the player, its signature and purpose statement.
[Purpose: Render the turn state that the player will see to the screen.](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/main/java/renderables/GameView.java#L81C4-L132C1)
5. the unit tests for the "end of game" functionality.

[test game over transition in Game_State](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/test/java/referee/Game_StateTest.java#L109C5-L121C1)
[after every executed move ref checks if game ending conditions met](https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/372ccbb484c01768aca0a9cb9092a81a31664e64/GameProject/Bazaar/src/test/java/referee/RefereeTest.java#L106C5-L110C6)



