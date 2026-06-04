package common;
import utils.RandomUtil;

import java.util.*;

public class Equation{

    private static final ResourceBundle RNG_BUNDLE = ResourceBundle.getBundle("RNG/rng");


    private final Pebble[] POSSIBLE_PEBBLES = {Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.YELLOW, Pebble.WHITE};
    private final int MAX_NUM_PEBBLES_PER_SIDE = Integer.parseInt(RNG_BUNDLE.getString("MAX_NUM_PEBBLES_PER_SIDE"));
    private ArrayList<Pebble> rightSide;
    private ArrayList<Pebble> leftSide;
    private boolean canBeUsedByActivePlayer = false;

    public Equation(){
        generateEquation();
    }

    /**
     * constructor used generate a non-random equation
     */
    public Equation(ArrayList<Pebble> leftSide, ArrayList<Pebble> rightSide){
        this.leftSide=leftSide;
        this.rightSide=rightSide;
    }

    /**
     * Method to call non-random constructor
     * @param leftSide
     * @param rightSide
     * @return
     */
    public static Equation initializeNonRandomEquation(ArrayList<Pebble> leftSide, ArrayList<Pebble> rightSide){
        return new Equation(leftSide, rightSide);
    }

    /**
     * Generates a random equation with random pebbles on each side
     */
    private void generateEquation(){
        ArrayList<Pebble> possiblePebbles = new ArrayList<>(Arrays.stream(POSSIBLE_PEBBLES).toList());

        // add pebbles to the left side
        leftSide = generateSide(possiblePebbles);

        // Remove the pebbles that are already on the left side
        for(Pebble pebble : leftSide){
            possiblePebbles.remove(pebble);
        }

        // add pebbles to the right side
        rightSide = generateSide(possiblePebbles);
    }

    public String toString(){
        return  leftSide.toString() + " = " + rightSide.toString();
    }

    /**
     * Helper function to generate each side of the equation with a random number of pebbles and
     * ensuring the same color is not present on both sides
     * @param possiblePebbles
     * @return array list of 1-4 pebbles
     */
    private ArrayList<Pebble> generateSide(ArrayList<Pebble> possiblePebbles){
        int numPebblesOnSide = RandomUtil.getRandom(MAX_NUM_PEBBLES_PER_SIDE)+1;
        ArrayList<Pebble> pebbles = new ArrayList<Pebble>();
        for (int i = 0; i < numPebblesOnSide; i++){
            pebbles.add(possiblePebbles.get(RandomUtil.getRandom(possiblePebbles.size())));
        }
        pebbles.sort(Comparator.comparing(Pebble::toString));

        return pebbles;
    }

    /**
     * Method to determine if player can use equation
     * @param inventory of players pebbles
     * @return true if player can use either side of equation, false otherwise
     */
    public boolean canUseEquation(ArrayList<Pebble> inventory){
        boolean useLeftSide = true;
        boolean useRightSide = true;
        ArrayList<Pebble> pebblesCopyRight = new ArrayList<>(inventory);
        ArrayList<Pebble> pebblesCopyLeft = new ArrayList<>(inventory);
        for (Pebble pebble : this.rightSide) {
            if (!pebblesCopyRight.remove(pebble)) {
                useRightSide = false;
            }
        }
        for (Pebble pebble : this.leftSide) {
            if (!pebblesCopyLeft.remove(pebble)) {
                useLeftSide = false;
            }
        }
        if(!useLeftSide && !useRightSide){
            return false;
        }
        else{
            return true;
        }
    }

    /**
     * Given a game equation or flipped equation, will check left side for valid player
     * and right side for valid bank
     * @param playerInventory and bankInventory
     * @return boolean for representing usability
     */
    public boolean playerCanUseLeftSide(ArrayList<Pebble> playerInventory,ArrayList<Pebble> bankInventory){
        ArrayList<Pebble> pebblesCopyPlayer = new ArrayList<>(playerInventory);
        ArrayList<Pebble> pebblesCopyBank = new ArrayList<>(bankInventory);
        for (Pebble pebble : this.leftSide) {
            if (!pebblesCopyPlayer.remove(pebble)) {
                return false;
            }
        }
        for (Pebble pebble : this.rightSide) {
            if (!pebblesCopyBank.remove(pebble)) {
                return false;
            }
        }
        return true;

    }

    /**
     * get private rightside field
     * @return
     */
    public ArrayList<Pebble> getRightSide(){
        return rightSide;
    }

    /**
     * get provate leftside field
     * @return
     */
    public ArrayList<Pebble> getLeftSide(){
        return leftSide;
    }

    /**
     * used to get desired player side on left
     * @return
     */
    public Equation flipEquation(){
        return new Equation(rightSide, leftSide);

    }

    /**
     * setter for canBeUsedByActivePlayer. To be used by ref at start of a turn
     * @return Boolean
     */
    public void setCanBeUsedByActivePlayer(Boolean canBeBoughtByActivePlayer) {
        this.canBeUsedByActivePlayer = canBeBoughtByActivePlayer;
    }

    /**
     * getter for canBeUsedByActivePlayer. To be used by the renderer
     * @return Boolean
     */
    public Boolean getCanBeUsedByActivePlayer() {
        return canBeUsedByActivePlayer;
    }



}
