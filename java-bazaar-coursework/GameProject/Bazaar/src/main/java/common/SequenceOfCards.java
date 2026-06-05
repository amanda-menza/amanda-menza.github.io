package common;
import java.util.*;

/**
 * Object to return for requestCards() method so referee can get a full Candidate of information from the player
 */
public class SequenceOfCards {
    private ArrayList<Card> cardsBought;
    private int pointsFromBuyingCards;
    private ArrayList<Pebble> remainingInventoryAfterBuyingCards;

    public SequenceOfCards(ArrayList<Card> cardsBought, int pointsFromBuyingCards, ArrayList<Pebble> remainingInventoryAfterBuyingCards) {
        this.cardsBought = cardsBought;
        this.pointsFromBuyingCards = pointsFromBuyingCards;
        this.remainingInventoryAfterBuyingCards = remainingInventoryAfterBuyingCards;
    }

    public ArrayList<Card> getCardsBought() {
        return cardsBought;
    }

    public int getPointsFromBuyingCards() {
        return pointsFromBuyingCards;
    }

    public ArrayList<Pebble> getRemainingInventoryAfterBuyingCards() {
        return remainingInventoryAfterBuyingCards;
    }
}