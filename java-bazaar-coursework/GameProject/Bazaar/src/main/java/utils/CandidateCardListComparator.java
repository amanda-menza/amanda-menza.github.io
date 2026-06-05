package utils;

import common.Card;
import common.Pebble;
import player.strategy.Candidate;

import java.util.ArrayList;
import java.util.Comparator;

public class CandidateCardListComparator implements Comparator<Candidate> {
    @Override
    public int compare(Candidate c1, Candidate c2) {
        Comparator<ArrayList<Card>> comparator = new CardListComparator();
        return comparator.compare(c1.getCardsBought(),c2.getCardsBought());
    }
}
