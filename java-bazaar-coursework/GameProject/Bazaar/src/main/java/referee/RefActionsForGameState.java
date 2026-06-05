package referee;
import player.IPlayer;
import player.Player;

import java.util.ArrayList;

/**
 * Purpose: Ref actions available from game state so that the two can communicate
 */
public interface RefActionsForGameState {
    void getFirstPlayerRequest();
    void getSecondPlayerRequest();
    boolean evaluateMove();
    void executeMove();
    void notifyGameOver(ArrayList<IPlayer> rank);
    void updateActivePlayer(IPlayer player);
}
