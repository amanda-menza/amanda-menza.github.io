package utils;

import common.Equation;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Purpose is to compare equation lists first by size then using equation comparator
 */
public class EquationListComparator implements Comparator<ArrayList<Equation>> {
    @Override
    public int compare(ArrayList<Equation> list1, ArrayList<Equation> list2) {
        // First, compare by size
        int sizeComparison = Integer.compare(list1.size(), list2.size());
        if (sizeComparison != 0) {
            return sizeComparison;
        }
        Comparator<Equation> comparator = new EquationComparator();
        int minSize = Math.min(list1.size(), list2.size());
        for (int i = 0; i < minSize; i++) {
            int equationComparison = comparator.compare(list1.get(i),list2.get(i));
            if (equationComparison != 0) {
                return equationComparison;
            }
        }
        return 0;
    }
}