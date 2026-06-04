## Memo: Game Observer Memo
**TO**: CEOs  
**FROM**: Team Futatsu  
**DATE**: 12/10/24  
**SUBJECT**: Design of Game Observer

There are a few things that come to mind when thinking about the game observer.

1. The observer could provide Model-View separation for the visual representation of the game.
2. Observer could act as a server for communication within the game, making it easier to implement the game across machines without needing to know the intricacies of the game. (i.e. json packets of info)
3. Observer could act as a notifier for specific events in the game, reducing responsibility of other components, specifically the referee.

For the first point, the observer would be able to observe game state as well as the turn state and using this information, communicate with a view component to update the visual representation of the game. It's signature could look like this:

```java
public interface GameObserver {
    void updateGameState(GameState gameState); // controls information about the overall game like all scores, cards, equations etc.
    void updateTurnState(TurnState turnState); // controls information about the current turn like the current player, current score, player cards, etc.
}
```

As for server communication, the observer could be responsible for sending and receiving json packets to and from the other components in the game. This does mean new implementation for breaking down game information into json packets and probably a lot of Java reflection for creating the objects from the json packets. 

Some psuedo code for this could look like this:

```java
public interface GameObserver {
    void receiveRefereePostRequest(RefereePostRequest request);
    void receivePlayerPostRequest(PlayerPostRequest request);
    void sendRefereePostResponse(RefereePostResponse response);
    void sendPlayerPostResponse(PlayerPostResponse response);
}
```

This right now essentially only handles the referee and player post requests and responses. It does not handle the communication between players or the communication between the referee and the game state, but certainly could be expanded to do so.

As for the notifier, the observer could be responsible for notifying the other components in the game of specific events. This could be things like a player has won the game, or a player has broken a rule so instead of the referee having to notify the game State and having it kick the player, the notifier could notify the game State and any other future components that would need to know about the event.

This class could look like this:

```java
public interface GameObserver {
    void notifyPlayerCheated(ArrayList<Object> needToBeNotified);
    void notifyPlayerWon(ArrayList<Object> needToBeNotified);
    void notifyPlayerLost(ArrayList<Object> needToBeNotified);
}
```

