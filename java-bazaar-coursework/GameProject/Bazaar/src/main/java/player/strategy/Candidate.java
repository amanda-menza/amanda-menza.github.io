package player.strategy;

import common.Card;
import common.Equation;
import common.Pebble;
import utils.EquationUtils;

import java.util.*;

import static utils.CardUtils.convertCardListToString;
import static utils.PebbleUtils.convertPebbleListToString;

/**
 * Purpose: represent a candidate for the strategy search process
 */
public class Candidate {
    private ArrayList<Equation> equations;  // List of Equations used
    private ArrayList<Card> cardsBought;    // List of cards purchased
    private int totalPoints;           // Total points from purchased cards
    private ArrayList<Pebble> remainingInventory; // The remaining pebbles in the inventory
    private int numberOfTrades;
    private int numberOfCards;

    public Candidate(){
        equations = new ArrayList<>();
        cardsBought = new ArrayList<>();
        totalPoints = 0;
        remainingInventory = new ArrayList<>();
        numberOfTrades = 0;
        numberOfCards = 0;
    }
    public Candidate(ArrayList<Equation> equations, ArrayList<Card> cardsBought, int totalPoints, ArrayList<Pebble> remainingInventory, int numberOfTrades, int numberOfCards) {
        this.equations = equations;
        this.cardsBought = cardsBought;
        this.totalPoints = totalPoints;
        this.remainingInventory = remainingInventory;
        this.numberOfTrades = numberOfTrades;
        this.numberOfCards = numberOfCards;
    }


    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public void setRemainingInventory(ArrayList<Pebble> remainingInventory) {
        this.remainingInventory = remainingInventory;
    }
    public void setCardsBought(ArrayList<Card> cardsBought) {
        this.cardsBought = cardsBought;
        this.numberOfCards = cardsBought.size();
    }
    public void setEquations(ArrayList<Equation> equations) {
        this.equations = equations;
        this.numberOfTrades = equations.size();
    }

    public ArrayList<Equation> getEquationsUsed() {
        return equations;
    }

    public ArrayList<Card> getCardsBought() {
        return cardsBought;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public ArrayList<Pebble> getRemainingInventory() {
        return remainingInventory;
    }

    public int getNumberOfTrades() {
        return numberOfTrades;
    }

    public int getNumberOfCards() {
        return numberOfCards;
    }

    public String toString(){
        return "equations used["+numberOfTrades+"]: "+equations.toString()+"\n cards bought["+numberOfCards+"]: "+cardsBought.toString()+"\n total points: "+totalPoints;
    }
     public int getRemainingInventorySize(){
        return remainingInventory.size();
     }

    public void printCandidate(){
        ArrayList<String> rules = EquationUtils.formatRule(equations);
        for(String rule : rules){
            System.out.println(rule);
        }
        System.out.println();
        System.out.println(convertCardListToString(cardsBought));
        System.out.println();
        System.out.println(totalPoints);
        System.out.println();
        remainingInventory.sort(Comparator.comparing(Pebble::toString));
        System.out.print(convertPebbleListToString(remainingInventory));
    }



}
