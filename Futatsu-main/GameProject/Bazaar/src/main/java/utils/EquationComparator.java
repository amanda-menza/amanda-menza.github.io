package utils;

import common.Equation;
import common.Pebble;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Purpose is to compare equations first by left side then right side.
 * A smaller equation has less pebbles on the given side or lexicographically smaller list.
 */
public class EquationComparator implements Comparator<Equation> {
    @Override
    public int compare(Equation a, Equation b) {
        Comparator<ArrayList<Pebble>> comparator = new PebbleListComparator();
        int compareLeft=comparator.compare(a.getLeftSide(), b.getLeftSide());
        int compareRight=comparator.compare(a.getRightSide(), b.getRightSide());
        if (compareLeft!=0) {
            return compareLeft;
        } else if (compareRight!=0) {
            return compareRight;
        }

        return 0;
    }
}
