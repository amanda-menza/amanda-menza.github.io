package common;

import utils.RandomUtil;

import java.util.*;

import static utils.PebbleUtils.convertPebbleListToString;

public class Card{

    private static final ResourceBundle RNG_BUNDLE = ResourceBundle.getBundle("RNG/rng");

    private final int STAR_ODDS = Integer.parseInt(RNG_BUNDLE.getString("STAR_ODDS"));
    private final int NUM_PEBBLES_PER_CARD = Integer.parseInt(RNG_BUNDLE.getString("NUM_PEBBLES_PER_CARD"));
    private final int ZERO = Integer.parseInt(RNG_BUNDLE.getString("ZERO"));
    private final int NUM_COLORS = Integer.parseInt(RNG_BUNDLE.getString("NUM_COLORS"));


    private ArrayList<Pebble> pebbles;
    private Boolean hasStar;
    private Boolean canBeBoughtByActivePlayer = false;

    /**
     * Constructor to create new card with random pebble assignment
     * and random presence of star
     */
    public Card() {
        pebbles = pebbleGen();
        hasStar = starGen();
    }

    /**
     * Constructor to create a star from given user input
     * @param pebbles
     * @param hasStar
     */
    public Card(ArrayList<Pebble> pebbles, Boolean hasStar) {
        this.pebbles = pebbles;
        this.hasStar = hasStar;
    }

    /**
     * Method to call constructor with non-random assignment
     * @param pebbles
     * @param hasStar
     * @return
     */
    public static Card initializeNonRandomCard(ArrayList<Pebble> pebbles, Boolean hasStar){
        return new Card(pebbles, hasStar);
    }

    /**
     * Determines whether the card gets a star or not. 
     * The odds of getting a star is 1/STAR_ODDS
     * @return
     */
    private boolean starGen(){
        //int rand = (int) (Math.random() * STAR_ODDS);
        int rand = RandomUtil.getRandom(STAR_ODDS);
        return rand == ZERO;
    }

    /**
     * Randomizes the 5 pebble colors that the card will show
     * and returns them as an ArrayList
     * @return
     */
    private ArrayList<Pebble> pebbleGen(){
        ArrayList<Pebble> pebbles = new ArrayList<>();
        for (int i = 0; i < NUM_PEBBLES_PER_CARD; i++) {
            //int rand = (int) (Math.random() * NUM_COLORS);
            int rand = RandomUtil.getRandom(NUM_COLORS);
            switch (rand) {
                case 0:
                    pebbles.add(Pebble.RED);
                    break;
                case 1:
                    pebbles.add(Pebble.BLUE);
                    break;
                case 2:
                    pebbles.add(Pebble.GREEN);
                    break;
                case 3:
                    pebbles.add(Pebble.YELLOW);
                    break;
                case 4:
                    pebbles.add(Pebble.WHITE);
                    break;
            }
        }
        pebbles.sort(Comparator.comparing(Pebble::toString));
        return pebbles;
    }

    /**
     * returns boolean that signifies if card has a star
     * @return
     */
    public boolean getHasStar(){
        return this.hasStar;
    }

    /**
     * returns an arraylist of the pebbles on the card
     * @return
     */
    public ArrayList<Pebble> getPebbles(){
        return this.pebbles;
    }

    /**
     * Checks if the player has enough pebbles to purchase this card by duplicating the player's inventory
     * and removing the pebbles on the card from the copy. If the copy has enough pebbles, it breaks out of
     * the loop and returns true. If not enough pebbles, it returns false because the removal will fail.
     * @param inventory of player
     * @return boolean that returns whether the player can buy the card
     */
    public boolean canBuyCard(ArrayList<Pebble> inventory){
        ArrayList<Pebble> pebblesCopy = new ArrayList<>(inventory);
        for (Pebble pebble : this.pebbles) {
            if (!pebblesCopy.remove(pebble)) {
                return false;
            }
        }
        return true;
    }

    public String toString()
    {
        return "{"+hasStar+","+convertPebbleListToString(pebbles)+"}";
    }


    /**
     * setter for canBeBoughtByActivePlayer. To be used by ref at start of a turn
     * @return Boolean
     */
    public void setCanBeBoughtByActivePlayer(Boolean canBeBoughtByActivePlayer) {
        this.canBeBoughtByActivePlayer = canBeBoughtByActivePlayer;
    }

    /**
     * getter for canBeBoughtByActivePlayer. To be used by the renderer
     * @return Boolean
     */
    public Boolean getCanBeBoughtByActivePlayer() {
        return canBeBoughtByActivePlayer;
    }




}
