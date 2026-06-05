package referee;

import player.Player;
import common.Turn_State;

import java.util.ArrayList;

/**
 * Purpose: GameState actions available from ref so they can communicate
 */
public interface GameStateActions {
    void setupGame();
    void startGame();
    void setReferee(RefActionsForGameState referee);
    Turn_State getTurnState();
    ArrayList<Player> getPlayerRank();
    boolean isGameOver();
    void removeIllegalPlayer(Player player);
    void addPlayer(Player player);
    GameBoard getGameBoard();
    Game_State.State getCurrentState();
    void updateActivePlayerScore(int points);

}
