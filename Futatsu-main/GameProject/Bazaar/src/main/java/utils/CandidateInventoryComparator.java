package utils;

import common.Card;
import common.Pebble;
import player.strategy.Candidate;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Purpose is to compare Candidates by comparing their inventory pebble lists
 */
public class CandidateInventoryComparator implements Comparator<Candidate> {
    @Override
    public int compare(Candidate c1, Candidate c2) {
        Comparator<ArrayList<Pebble>> comparator = new PebbleListComparator();
        return comparator.compare(c1.getRemainingInventory(),c2.getRemainingInventory());
    }
}
