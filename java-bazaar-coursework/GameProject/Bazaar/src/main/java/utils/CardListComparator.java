package utils;

import common.Card;
import common.Pebble;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Compares card lists first by size and then by using card comparator.
 */
public class CardListComparator implements Comparator<ArrayList<Card>> {
    @Override
    public int compare(ArrayList<Card> list1, ArrayList<Card> list2) {
        // First, compare by size
        int sizeComparison = Integer.compare(list1.size(), list2.size());
        if (sizeComparison != 0) {
            return sizeComparison;
        }
        Comparator<Card> comparator = new CardComparator();
        int minSize = Math.min(list1.size(), list2.size());
        for (int i = 0; i < minSize; i++) {
            int cardComparison = comparator.compare(list1.get(i),list2.get(i));
            if (cardComparison != 0) {
                return cardComparison;
            }
        }
        return 0;
    }
}