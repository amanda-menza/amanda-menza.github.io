
Self-Evaluation Form for Milestone 2

Indicate below each bullet which file/unit takes care of each task:

1. Does your implementation come with a separate data representation for collections of pebbles (like those on cards, in the bank, or in the player's possession)?
    Yes, pebbles is defined as an enum class but separate pebble collections are represented as their own objects.
    For example:
    - Card has its own associated ArrayList of pebbles https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/2eba7d1b9cbfae38d27e6ffe735b5148ba061ebe/GameProject/Bazaar/src/main/java/common/Card.java#L19C5-L19C39
    - Inventory is a separate data representation for a player's pebbles https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/2eba7d1b9cbfae38d27e6ffe735b5148ba061ebe/GameProject/Bazaar/src/main/java/common/Inventory.java#L5C1-L7C39
    - Equations has its own left and right side pebble entities https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/2eba7d1b9cbfae38d27e6ffe735b5148ba061ebe/GameProject/Bazaar/src/main/java/common/Equation.java#L12C4-L14C1

2. Do your "filtering" and "acquisition" functionalities come with signatures/purpose statements?
    Yes for both cards and equations these methods are explained, additionally, acquisition and filter use the same logic checks. 
    Card: This method checks if someone can acquire a card by making a copy of the player's inventory and trying to remove a pebble that's on the card from the inventory copy.
    - aquisition: https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/b11cbd076d527564c87c15a9bef62e6f1472a3ff/GameProject/Bazaar/src/main/java/common/Card.java#L90C5-L96C8
    - filtering: https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/b11cbd076d527564c87c15a9bef62e6f1472a3ff/GameProject/Bazaar/src/main/java/common/JavaFXApplication.java#L80C8-L88C10
      - graphically able to see filtering of card set for given player by valid cards lighting up green.
    Equation: Works similarly to the card acquisition by copying inventory and trying to remove pebbles from the copy.
    - aquisition: https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/b11cbd076d527564c87c15a9bef62e6f1472a3ff/GameProject/Bazaar/src/main/java/common/Equation.java#L58C5-L62C8
    - filtering: https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/b11cbd076d527564c87c15a9bef62e6f1472a3ff/GameProject/Bazaar/src/main/java/common/JavaFXApplication.java#L103C8-L110C10
      - graphically able to see filtering of equation set for given player by valid equations lighting up green.
3. Do your "filtering" and "acquisition" functionalities come with unit tests?
    We have unit tests only for the aquisition not for the filtering, but we incorporated the filtering into the visual rendering so we could visually see if cards or equations turned green as they were meant to for our specific test player's inventory.
    Card:
    - aquisition unit test: https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/b11cbd076d527564c87c15a9bef62e6f1472a3ff/GameProject/Bazaar/src/test/java/common/CardTest.java#L109C5-L130C6
    
   Equation:
    - aquisition unit test: https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/a303b03ebe4e7539b35058cd6aa2dda13700567f/GameProject/Bazaar/src/test/java/common/EquationTest.java#L58C5-L74C6

4. Is your "filtering" functionality a composite of other pieces of functionality? (Its specification implies at least two tasks.)
    Yes, the filtering functionality is a composite of the referee, player, their inventory, and card and equation functionality respectively. Filtering right now runs on a render of the respective screen, so when checking a player object's ability to acquire, the cards or equations are looped through when going through rendering and the referee calls a canBuy... method for each which gets an arraylist inventory of pebbles from the player and then calls the actual card or equations canBuy... method and then sets the background color of that element based on the result of that method.

Thinking Question:

It is necessary to consider the use cases (context) behind programming tasks, for example, when you work out the focused and precise purpose statement of the equations component. Here is the question you would ponder:

5. How do you anticipate this component will be used?
- The equations component will be used to generate the initial equations for the game and then also for the referee to execute any trades the players will want to perform. It will provide information on which pebbles are in an equation and the related operation for the referee to undergo with the bank and relevant player.
(Provide a concise one or two sentence answer for this question. No code links needed.)