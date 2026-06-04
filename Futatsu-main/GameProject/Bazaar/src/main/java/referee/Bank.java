package referee;

import common.Inventory;
import common.Pebble;

import java.util.ArrayList;
import java.util.ResourceBundle;

import static common.Inventory.initializeInventoryWithInts;
import static common.Inventory.initializeInventoryWithList;

public class Bank {

    private static final ResourceBundle RNG_BUNDLE = ResourceBundle.getBundle("RNG/rng");

    private static final int NUM_STARTING_PEBBLES = Integer.parseInt(RNG_BUNDLE.getString("NUM_STARTING_PEBBLES"));

    private static final int STARTING_RED_PEBBLES = NUM_STARTING_PEBBLES;
    private static final int STARTING_YELLOW_PEBBLES = NUM_STARTING_PEBBLES;
    private static final int STARTING_GREEN_PEBBLES = NUM_STARTING_PEBBLES;
    private static final int STARTING_BLUE_PEBBLES = NUM_STARTING_PEBBLES;
    private static final int STARTING_WHITE_PEBBLES = NUM_STARTING_PEBBLES;

    private Inventory bankInventory;

    public Bank() {
        bankInventory = initializeInventoryWithInts(STARTING_RED_PEBBLES,STARTING_BLUE_PEBBLES,STARTING_GREEN_PEBBLES,STARTING_YELLOW_PEBBLES,STARTING_WHITE_PEBBLES);
    }

    /**
     * Constructor made for xturn test to simulate a bank from stdin user input
     */
    public Bank(ArrayList<Pebble> bank){
        bankInventory= initializeInventoryWithList(bank);
    }


    /**
     * Method to call constructor for STDIN with user input bank inventory
     * @param bank
     * @return
     */
    public static Bank initializeBankWithPebbleList(ArrayList<Pebble> bank){
        return new Bank(bank);
    }

    /**
     * Mehtod to accept pebbles from an equation
     * @param pebbles
     */
    public void addPebbles(ArrayList<Pebble> pebbles) {
        bankInventory.addPebbles(pebbles);
    }

    /**
     * Method to remove pebbles from the bank
     * @param pebbles
     */
    public void removePebbles(ArrayList<Pebble> pebbles) {
        bankInventory.removePebbles(pebbles);
    }

    public Inventory getBankInventory() {
        return bankInventory;
    }

    public boolean isEmpty(){
        return bankInventory.getPebbles().isEmpty();
    }


}