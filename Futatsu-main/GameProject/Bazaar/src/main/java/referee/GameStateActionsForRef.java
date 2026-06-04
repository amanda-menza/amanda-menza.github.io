package referee;

import player.IPlayer;
import player.Player;
import common.Turn_State;

import java.util.ArrayList;

/**
 * Purpose: GameState actions available from ref so they can communicate
 */
public interface GameStateActionsForRef {
    void setInitialActivePlayer();
    void startGame();
    Turn_State getTurnState();
    ArrayList<Player> getPlayerRank();
    boolean isGameOver();
    void removeIllegalPlayer();
    void removeIllegalPlayer(IPlayer player);
    void addPlayer(IPlayer player);
    GameBoard getGameBoard();
    Game_State.State getCurrentState();
    void updateActivePlayerScore(int points);
    ArrayList<ArrayList<String>> getWinnersAndCheaters();
    void endGame();
}
