package common;

import java.util.ArrayList;
import java.util.Optional;
import java.util.ResourceBundle;

import player.strategy.Candidate;

/**
 * Purpose: interface for player, ref, strategy to interact with rule book.
 */
public interface IRuleBook {

    public static final ResourceBundle RNG_BUNDLE = ResourceBundle.getBundle("RNG/rng");

    public static final int MINIMUM_NUM_PLAYERS=Integer.parseInt(RNG_BUNDLE.getString("MINIMUM_NUM_PLAYERS"));
    public static final int MAXIMUM_NUM_PLAYERS=Integer.parseInt(RNG_BUNDLE.getString("MAXIMUM_NUM_PLAYERS"));
    public static final int MAXIMUM_EXCHANGES=Integer.parseInt(RNG_BUNDLE.getString("MAXIMUM_EXCHANGES"));
    public static final int NUM_VISIBLE_CARDS=Integer.parseInt(RNG_BUNDLE.getString("NUM_VISIBLE_CARDS"));



    /**
     * Checks if a player's turn is valid
     *
     * @param playerTurn
     * @param turnState
     * @param pickedPebble
     * @return boolean for representing validity
     */
    public boolean isValidTurn(Candidate playerTurn, Turn_State turnState,boolean pickedPebble);

    /**
     * Checks if a player can use an equation
     * @param equation
     * @param playerInventory
     * @param bankInventory
     * @return boolean for representing usability
     */
    public boolean canUseEquation(Equation equation, Inventory playerInventory, Inventory bankInventory);

    /**
     * Checks if a player can buy a card
     * @param card
     * @param playerInventory
     * @return boolean for representing usability
     */
    public boolean canBuyCard(Card card, Inventory playerInventory);


    /**
     * Checks if the number of players is valid
     * @param numberOfPlayers
     * @return boolean for representing validity
     */
    public boolean validNumberOfPlayers(int numberOfPlayers);

    /**
     * filters set of equations so it returns set that player can use.
     * @param playerWallet
     * @param bank
     * @param equations
     * @return
     */
    public ArrayList<Equation> filterEqSet(ArrayList<Pebble> playerWallet, ArrayList<Pebble> bank, ArrayList<Equation> equations);

    /**
     * returns a filtered set of available cards that the player can use
     * @param cardList
     * @param playerInventory
     * @return
     */
    public  ArrayList<Card> filterCardList(ArrayList<Card> cardList, Inventory playerInventory);

    /**
     * retrieves pebble from bank in color order
     * @param s
     * @return
     */
    public Optional<Pebble> getDeterministicPebble(Turn_State s);
}
