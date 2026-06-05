package utils;

import common.Card;
import common.Pebble;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Purpose is to compare cards as specified in tie breaking rules for milestone 4
 */
public class CardComparator implements Comparator<Card> {
    @Override
    public int compare(Card a, Card b) {
        // First, compare by star status
        if (a.getHasStar() && !b.getHasStar()) {
            return 1;  // a is greater than b
        } else if (!a.getHasStar() && b.getHasStar()) {
            return -1;   // a is less than b
        }
        Comparator<ArrayList<Pebble>> comparator = new PebbleListComparator();
        return comparator.compare(a.getPebbles(),b.getPebbles());
    }
}