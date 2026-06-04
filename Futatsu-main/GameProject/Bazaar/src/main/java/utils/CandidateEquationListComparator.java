package utils;

import common.Equation;
import player.strategy.Candidate;

import java.util.ArrayList;
import java.util.Comparator;

/**
 * Compare candidates by looking at their equations used list.
 */
public class CandidateEquationListComparator implements Comparator<Candidate> {
    @Override
    public int compare(Candidate c1, Candidate c2) {
        Comparator<ArrayList<Equation>> comparator = new EquationListComparator();
        return comparator.compare(c1.getEquationsUsed(),c2.getEquationsUsed());
    }
}