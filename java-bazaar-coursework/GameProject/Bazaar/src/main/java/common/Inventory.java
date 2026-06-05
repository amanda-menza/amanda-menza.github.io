package common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Inventory {
    private int pebbleCount;
    private ArrayList<Pebble> pebbles;


    /**
     * Constructor for Inventory
     */
    public Inventory() {
        pebbleCount = 0;
        pebbles = new ArrayList<>();
    }

    /**
     * Made for xturn test harness to make inventory from stdin user input.
     * @param pebbles
     */
    public Inventory(ArrayList<Pebble> pebbles) {
        this.pebbleCount = pebbles.size();
        this.pebbles = new ArrayList<>(pebbles);
    }


    /**
     * Constructor for Inventory with pebble counts
     * @param redPebbleCount
     * @param bluePebbleCount
     * @param greenPebbleCount
     * @param yellowPebbleCount
     * @param whitePebbleCount
     */
    public Inventory(int redPebbleCount, int bluePebbleCount, int greenPebbleCount, int yellowPebbleCount, int whitePebbleCount) {
        pebbles = new ArrayList<>();
        pebbleCount = redPebbleCount + bluePebbleCount + greenPebbleCount + yellowPebbleCount + whitePebbleCount;
        addPebbles(redPebbleCount,Pebble.RED);
        addPebbles(bluePebbleCount,Pebble.BLUE);
        addPebbles(greenPebbleCount,Pebble.GREEN);
        addPebbles(yellowPebbleCount, Pebble.YELLOW);
        addPebbles(whitePebbleCount, Pebble.WHITE);
    }

    /**
     * Method created to read from STDIN in xturn. User defined bank list
     * @param pebbles
     * @return
     */
    public static Inventory initializeInventoryWithList(ArrayList<Pebble> pebbles){
        return new Inventory(pebbles);
    }

    public static Inventory initializeInventoryWithInts(int redPebbleCount, int bluePebbleCount, int greenPebbleCount, int yellowPebbleCount, int whitePebbleCount){
        return new Inventory(redPebbleCount, bluePebbleCount, greenPebbleCount, yellowPebbleCount, whitePebbleCount);
    }

    /**
     * Getters and Setters for Inventory
      * @return
     */
    public int getPebbleCount() {
        return pebbleCount;
    }

    public void addPebble(Pebble pebble) {
        if(pebble==null)
        {
            return;
        }
        pebbles.add(pebble);
        pebbleCount++;
    }

    public void addPebbles(ArrayList<Pebble> newPebbles) {
        if(newPebbles.isEmpty())
            return;
        for(Pebble p:newPebbles){
            addPebble(p);
        }
    }

    /**
     * Overide method to take in an int and a certain pebble count
     * @param pebbleCount
     * @param pebble
     */
    public void addPebbles(int pebbleCount, Pebble pebble){
        for(int i=0;i<pebbleCount;i++){
            addPebble(pebble);
        }
    }

    public void removePebble(Pebble pebble) {
        if(pebble==null)
            return;
        try {
            if(this.pebbles.remove(pebble))
            {
                pebbleCount--;
            }

        } catch (Exception e) {
            System.out.println("Error: Pebble not found in inventory");
        }

    }

//    public void removePebbles(ArrayList<Pebble> pebblesToRemove) {
//        if(pebblesToRemove.isEmpty())
//            return;
//        try {
//            this.pebbles.removeAll(pebblesToRemove);
//            pebbleCount -= pebblesToRemove.size();
//        } catch (Exception e) {
//            System.out.println("Error: Pebble not found in inventory");
//        }
//    }
    public void removePebbles(ArrayList<Pebble> pebblesToRemove) {
        if (pebblesToRemove.isEmpty()) return;

        for (Pebble pebble : pebblesToRemove) {
            removePebble(pebble);
        }
    }

    public ArrayList<Pebble> getPebbles() {
        return pebbles;
    }


    /**
     * POTENTIALLY DELETE
     * Method to get the count of each color of pebble in the inventory as a record
     * @return PebbleCountRecord
     */
//    public PebbleCountRecord getPebbleCountRecord() {
//        int redPebbles = 0;
//        int bluePebbles = 0;
//        int greenPebbles = 0;
//        int yellowPebbles = 0;
//        int whitePebbles = 0;
//
//        for (Pebble pebble : pebbles) {
//            switch (pebble) {
//                case RED -> redPebbles++;
//                case BLUE -> bluePebbles++;
//                case GREEN -> greenPebbles++;
//                case YELLOW -> yellowPebbles++;
//                case WHITE -> whitePebbles++;
//            }
//        }
//
//        return new PebbleCountRecord(redPebbles, bluePebbles, greenPebbles, yellowPebbles, whitePebbles);
//    }


    // This might be able to replace code above
    /**
     * Method to get the count of each color of pebble in the inventory as a map
     * @return counts
     */
    public Map<Pebble, Integer> getPebbleCounts() {
        Map<Pebble, Integer> counts = new HashMap<>();

        // Initialize counts for all pebble types to 0
        for (Pebble type : Pebble.values()) {
            counts.put(type, 0);
        }

        // Count each pebble
        for (Pebble pebble : pebbles) {
            counts.put(pebble, counts.get(pebble) + 1);
        }

        return counts;
    }



    /**
     * Checks if another inventory has the same pebble composition as this one
     * @param other The inventory to compare with
     * @return true if inventories have identical pebble counts, false otherwise
     */
    public boolean equals(Inventory other) {
        if (other == null) {
            return false;
        }

        Map<Pebble, Integer> thisCounts = this.getPebbleCounts();
        Map<Pebble, Integer> otherCounts = other.getPebbleCounts();

        return thisCounts.equals(otherCounts);
    }

    /**
     * Checks if this inventory has the same pebble composition as a list of pebbles
     * @param pebbles The list of pebbles to compare with
     * @return true if inventory has identical pebble counts as the list, false otherwise
     */
    public boolean equals(ArrayList<Pebble> pebbles) {
        if (pebbles == null) {
            return false;
        }

        // Create temporary inventory from pebble list to use existing equals method
        Inventory temp = new Inventory(pebbles);
        return this.equals(temp);
    }


    /**
     * Checks if all pebble counts in the inventory are non-negative
     * @return true if all pebble counts are >= 0, false if any count is negative
     */
    public boolean hasValidPebbleCounts() {
        Map<Pebble, Integer> counts = getPebbleCounts();

        for (Integer count : counts.values()) {
            if (count < 0) {
                return false;
            }
        }

        return true;
    }




}
