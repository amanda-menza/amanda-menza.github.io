# Self-Evaluation Form for Milestone 4

**0. The data representation for representing pebble exchanges, including its interpretation.**

[The EquationTransaction](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/referee/transaction/EquationTransaction.java#L6C1-L23C6)
class represents an exchange of pebble equations where execution takes left hand side equation pebbles from player and gives them to the bank and removes right side hand pebbles from the bank to give to the player.It implements the ITransaction interface.
You can undo the equation by sending the player and bank inventories in the reverse order. 

**1. The data representation for representing the purchases of cards, including its interpretation.**

[The CardTransaction](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/referee/transaction/CardTransaction.java#L10C1-L25C6) class represents a card purchase. It takes player pebbles to give them to the bank and transfers the new card/points to the player. It implements the ITransaction interface.
You can execute or undo execute card purchases in this class.

**2. The strategy functionality for answering question 1 from the milestone, its signature, and purpose statement.**

The [beginning of the pickPlayerMoveMethod](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/Player.java#L100C5-L106C10) decides if a player should pick a pebble based on checking if it can currently use any equations. If it picks a pebble, the strategy knows not to allow any eqution exchanges.

If player needs a pebble, it asks the [ref to give one randomly from bank](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/referee/Referee.java#L87C5-L95C6).

**3. The strategy functionality for answering question 2 from the milestone, its signature, and purpose statement.**

The [maximizeRecursive](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/AStrategy.java#L56C5-L146C6) function optimizes the equation and card selection towards maximizing the given metric, which is either number of cards bought or number of points won. It returns the best candidate or list of candidates.


**4. The strategy functionality for determining which pebble exchanges a player wishes to conduct; its signature and purpose statement.**

[This recursive section of the above method](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/AStrategy.java#L79C9-L101C10) goes through different equations used to figure out which combination helps buy cards to maximize the metric.

**5. The strategy functionality for tie-breaking card purchases.**

[The cardPurchaseTieBreaker method](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/TieBreaker.java#L8C5-L23C1) uses different helper methods to break ties based off of the rules in milestone 3.For each rule, it weeds out candidates if the list is larger than 1.

**6. The strategy functionality for tie-breaking the exchanges of pebbles.**

[The exchangeAndPurchaseTieBreaker method](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/TieBreaker.java#L24C5-L36C1) uses the card purchase tiebreaker and some other custom comparators to narrow down candidates with the optimal equation set, as laid out in the rules of milestone 3.

**7. Unit tests that show:**

- No cards can be bought with the available pebbles.

[Unit test for maxNumCardsStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/test/java/player/strategy/MaxNumCardsStrategyTest.java#L73C5-L87C1)

[Unit test for maxScoreStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/test/java/player/strategy/MaxScoreStrategyTest.java#L119C5-L132C6)

- A card can be bought without exchanges of pebbles.

[Unit test for maxNumCardsStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/test/java/player/strategy/MaxNumCardsStrategyTest.java#L42C5-L56C6)

[Unit test for maxScoreStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/test/java/player/strategy/MaxScoreStrategyTest.java#L62C4-L80C1)

- A card can be bought after an exchange of pebbles.

[Unit test for maxNumCardsStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/test/java/player/strategy/MaxNumCardsStrategyTest.java#L101C4-L116C6)

[Unit test for maxScoreStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/test/java/player/strategy/MaxScoreStrategyTest.java#L100C4-L117C6)

- Two cards can be bought after an exchange of pebbles.

Missing this specific unit test. We have tests for buying 2 cards with no trades, using 2 trades to buy one card, but not using trades to buy 2 cards.

**8. Explain how your code abstracts over the two rather similar strategies.**

We used the template and hook pattern. The abstract class template is [AStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/AStrategy.java#L12C1-L201C2). The concrete classes are [maxScoreStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/MaxScoreStrategy.java#L10C1-L18C2) and [maxNumCardStrategy](#https://github.com/ECE495-F24-PairProgramming/Futatsu/blob/6317b50d19173c61a83ae6d1932e78d28f71f1f1/GameProject/Bazaar/src/main/java/player/strategy/MaxNumCardsStrategy.java#L14C1-L29C2).
These are found in the `main/java/player/strategy` directory. The concrete classes extend the template, using the `AStrategy` recursive method but each implementing their own function to `updateMetric`.