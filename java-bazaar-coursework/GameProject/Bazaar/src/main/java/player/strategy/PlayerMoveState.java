package player.strategy;

import common.Card;
import common.Equation;
import common.Inventory;
import player.PlayerScore;
import common.transaction.CardTransaction;
import common.transaction.EquationTransaction;

import java.util.*;

/**
 * Purpose: to handle different states of recursion layers by creating objects with
 * their own copies of inventories and important variables.
 */
public class PlayerMoveState {
    private Inventory currentPlayerInventory;
    private Inventory currentBankInventory;
    private ArrayList< Equation> availableEquations;
    private ArrayList<Card> availableCards;
    private ArrayList< Equation> equationsUsed;
    private ArrayList<Card> cardsBought;
    private PlayerScore currentPoints;
    private ArrayList<Candidate> bestCandidates;

    public PlayerMoveState(Inventory currentPlayerInventory, Inventory currentBankInventory, ArrayList<Equation> availableEquations,ArrayList<Card> availableCards, ArrayList<Equation> equationsUsed, ArrayList<Card> cardsBought, PlayerScore currentPoints,ArrayList<Candidate> bestCandidates) {
        this.currentPlayerInventory = currentPlayerInventory;
        this.currentBankInventory = currentBankInventory;
        this.availableEquations = availableEquations;
        this.availableCards = availableCards;
        this.equationsUsed = equationsUsed;
        this.cardsBought = cardsBought;
        this.currentPoints = currentPoints;
        this.bestCandidates = bestCandidates;
    }

    /**
     * Creates copies of necessary variables and returns new PlayerMoveState object for a card purchase.
     * @param card
     * @return
     */
    public PlayerMoveState executeFunctionalCardPurchase(Card card)
    {
        Inventory playerCopy = new Inventory(currentPlayerInventory.getPebbles());
        Inventory bankCopy = new Inventory(currentBankInventory.getPebbles());
        ArrayList<Card> playerCardsCopy = new ArrayList<>(cardsBought);
        ArrayList<Card> visibleCardsCopy = new ArrayList<>(availableCards);
        PlayerScore scoreCopy = new PlayerScore(currentPoints.getScore());
        CardTransaction functionalTransaction = new CardTransaction(card,playerCopy,bankCopy,playerCardsCopy,scoreCopy,visibleCardsCopy);
        functionalTransaction.execute();
        return new PlayerMoveState(playerCopy,bankCopy,availableEquations,visibleCardsCopy,equationsUsed,playerCardsCopy,scoreCopy,bestCandidates);
    }

    /**
     * Creates copies of necessary variables and returns new PlayerMoveState object for an equation purchase.
     * @param equation
     * @return
     */
    public PlayerMoveState executeFunctionalEquationPurchase(Equation equation){
        Inventory playerCopy = new Inventory(currentPlayerInventory.getPebbles());
        Inventory bankCopy = new Inventory(currentBankInventory.getPebbles());
        ArrayList<Equation> equationsUsedCopy = new ArrayList<>(equationsUsed);
        EquationTransaction functionalTransaction = new EquationTransaction(equation,playerCopy,bankCopy);
        functionalTransaction.execute();
        equationsUsedCopy.add(equation);
        return new PlayerMoveState(playerCopy,bankCopy,availableEquations,availableCards,equationsUsedCopy,cardsBought,currentPoints,bestCandidates);
    }

    public Inventory getCurrentPlayerInventory() {
        return currentPlayerInventory;
    }
    public Inventory getCurrentBankInventory() {
        return currentBankInventory;
    }
    public ArrayList<Equation> getAvailableEquations() {
        return availableEquations;
    }
    public ArrayList<Card> getAvailableCards() {
        return availableCards;
    }
    public ArrayList<Equation> getEquationsUsed() {
        return equationsUsed;
    }
    public ArrayList<Card> getCardsBought() {
        return cardsBought;
    }
    public PlayerScore getCurrentPoints() {
        return currentPoints;
    }
    public ArrayList<Candidate> getBestCandidates() {
        return bestCandidates;
    }

}
