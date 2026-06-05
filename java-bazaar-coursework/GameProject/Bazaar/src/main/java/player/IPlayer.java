package player;

import common.*;

import java.util.ArrayList;

/**
 * Purpose: player interpretation to conceal strategy from referee
 */
public interface IPlayer {
    /**
     * set player up with the game equations
     * @param e
     */
    void setup(ArrayList<Equation> e) throws PlayerException;

    /**
     * communicate to the ref if pebble is needed or exchanges are taking place.
     * @param s
     * @return
     */
    PebbleOrExchanges requestPebbleOrTrades(Turn_State s) throws PlayerException;

    /**
     * Return cards to be bought, points associated with those cards, and inventory that should remain after buying.
     * @param s
     * @return
     */
    SequenceOfCards requestCards(Turn_State s) throws PlayerException;

    /**
     * True if player wins game
     * @param w
     */
    void win(boolean w) throws PlayerException;

    /**
     * return the name of the player, will be used for equivalence checks
     * @return String
     */
    String getName();

    /**
     * Send the end gme report to each player
     * @param rank
     */
    void setEndGameReport(ArrayList<IPlayer> rank);


    PlayerScore getPlayerScore();

    void updateScore(int points);

    int getScore();

    Inventory getInventory();

    ArrayList<Card> getMyCards();






}
