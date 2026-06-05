package player;

import common.*;

import java.util.*;

/**
 * Purpose: class through which ref can interact with IPlayer
 */
public class Mechanism {

    IPlayer player;


    public Mechanism(IPlayer p) {
        this.player = p;
    }

    /**
     * set player up with the game equations
     * @param e
     */
    public void setup(ArrayList<Equation> e)throws PlayerException{
        player.setup(e);
    }

    /**
     * communicate to the ref if pebble is needed or exchanges are taking place.
     * @param s
     * @return
     */
    public PebbleOrExchanges requestPebbleOrTrades(Turn_State s) throws PlayerException{
        return player.requestPebbleOrTrades(s);
    }

    /**
     * Return cards to be bought, points associated with those cards, and inventory that should remain after buying.
     * @param s
     * @return
     */
    public SequenceOfCards requestCards(Turn_State s)throws PlayerException{
        return player.requestCards(s);
    }

    /**
     * Let IPlayer know if they won or lost
     * @param w
     */
    public void win(boolean w) throws PlayerException{
        player.win(w);
    }

    /**
     * Send the end gme report to each player
     * @param rank
     */
    public void setEndGameReport(ArrayList<IPlayer> rank){
        player.setEndGameReport(rank);
    }





}
