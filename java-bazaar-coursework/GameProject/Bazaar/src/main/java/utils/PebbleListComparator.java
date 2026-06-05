package utils;

import common.Pebble;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Compares lists of pebbles first by size then lexicographically
 */
public class PebbleListComparator implements Comparator<ArrayList<Pebble>> {
    @Override
    public int compare(ArrayList<Pebble> list1, ArrayList<Pebble> list2) {
        // Compare by size first
        int sizeComparison = Integer.compare(list1.size(), list2.size());
        if (sizeComparison != 0) {
            return sizeComparison;
        }
        list1.sort(Comparator.comparing(Pebble::toString));
        list2.sort(Comparator.comparing(Pebble::toString));
        // If sizes are the same, compare lexicographically by Pebble enum order
        int minSize = Math.min(list1.size(), list2.size());
        for (int i = 0; i < minSize; i++) {
            int pebbleComparison = list1.get(i).compareTo(list2.get(i));
            if (pebbleComparison != 0) {
                return pebbleComparison;
            }
        }

        return 0; // Return 0 if both lists are identical in size and order
    }
}

