package player.strategy;

import utils.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class TieBreaker {

    /**
     * Card purchase tiebreaker follows 4 rules laid out in milestone 4 to find the one candidate with:
     * 1. max awarded points
     * 2. largest size remaining wallet
     * 3. lexographically smallest remaining wallet
     * 4. smallest card sequence
     *
     * returns as a list so it can be reused in exchange-and-purchase tiebreaker if more than one candidate still remains
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> cardPurchaseTieBreaker(ArrayList<Candidate> candidates){
        ArrayList<Candidate> currentCandidates = smallestCardListTieBreakHelper(smallestInventoryTieBreakHelper(maxRemainingInventoryTieBreakHelper(maxPointTieBreakHelper(candidates))));
        return currentCandidates;
    }

    /**
     * exchange and purchase request tiebreaker follows 3 rules laid out in milestone 4 to find candidate with:
     * 1. smallest number of equations used.
     * 2. card purchase tiebreak rules
     * 3. smallest equation list using custom comparator
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> exchangeAndPurchaseTieBreaker(ArrayList<Candidate> candidates){
        ArrayList<Candidate> currentCandidates = smallestEquationListTieBreakHelper(cardPurchaseTieBreaker(smallestNumberOfExchangesTieBreakHelper(candidates)));
        return currentCandidates;
    }

    /**
     * Return list of candidates with max points
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> maxPointTieBreakHelper(ArrayList<Candidate> candidates){
        return getTopCandidates(
                candidates,
                Comparator.comparingInt(Candidate::getTotalPoints).reversed(),
                Candidate::getTotalPoints
        );
    }

    /**
     * Return list of candidates with max size of remaining inventory
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> maxRemainingInventoryTieBreakHelper(ArrayList<Candidate> candidates){
        return getTopCandidates(
                candidates,
                Comparator.comparingInt(Candidate::getRemainingInventorySize).reversed(),
                Candidate::getRemainingInventorySize
        );
    }

    /**
     * Return list of candidates with "smallest" inventory using custom comparator
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> smallestInventoryTieBreakHelper(ArrayList<Candidate> candidates){
        Comparator<Candidate> candidateInventoryComparator = new CandidateInventoryComparator();
        return getTopCandidates(
                candidates,
                candidateInventoryComparator,
                c -> c // Use candidate itself as the key since the comparator defines "smallest"
        );
    }

    /**
     * Return list of candidates with "smallest" card list sequence using custom comparator
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> smallestCardListTieBreakHelper(ArrayList<Candidate> candidates) {
        Comparator<Candidate> candidateCardListComparator = new CandidateCardListComparator();
        return getTopCandidates(
                candidates,
                candidateCardListComparator,
                c -> c // Same logic as above
        );
    }

    /**
     * Return list of candidates that use smallest number of equations
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> smallestNumberOfExchangesTieBreakHelper(ArrayList<Candidate> candidates){
        return getTopCandidates(
                candidates,
                Comparator.comparingInt(Candidate::getNumberOfTrades),
                Candidate::getNumberOfTrades
        );
    }

    /**
     * Return list of candidates with "smallest" equation list sequence using custom comparator
     * @param candidates
     * @return
     */
    public static ArrayList<Candidate> smallestEquationListTieBreakHelper(ArrayList<Candidate> candidates){
        Comparator<Candidate> candidateEquationListComparator = new CandidateEquationListComparator();
        return getTopCandidates(
                candidates,
                candidateEquationListComparator,
                c -> c // Same logic as above
        );
    }


    /**
     * Helper method to take in candidate list and comparator to perform filter
     * @param candidates
     * @param comparator
     * @param keyExtractor
     * @return
     * @param <T>
     */
    public static <T> ArrayList<Candidate> getTopCandidates(
            ArrayList<Candidate> candidates,
            Comparator<Candidate> comparator,
            Function<Candidate, T> keyExtractor) {

        ArrayList<Candidate> topCandidates = new ArrayList<>();

        if (!candidates.isEmpty()) {
            // Sort using the provided comparator
            candidates.sort(comparator);

            // Get the key of the "top" candidate
            T topKey = keyExtractor.apply(candidates.get(0));

            // Add all candidates with the same key as the top candidate
            topCandidates.addAll(candidates.stream()
                    .takeWhile(candidate -> keyExtractor.apply(candidate).equals(topKey))
                    .collect(Collectors.toList()));
        }

        return topCandidates;
    }


}
