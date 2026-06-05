package player.strategy;

import common.*;
import common.transaction.CardTransaction;
import common.transaction.EquationTransaction;
import player.PlayerScore;
import utils.CardUtils;
import utils.EquationUtils;

import java.util.*;
import java.util.Optional;

public abstract class AStrategy implements IStrategy {

    private final int MAX_EXCHANGES = 4;
    private Inventory currentBankInventory;
    private Inventory currentPlayerInventory;
    private ArrayList<Equation> equations;
    private ArrayList<Card> currentVisibleCards;
    private ArrayList<Candidate> bestCandidate;
    private int maxMetric;
    private boolean pickedPebble;
    private IRuleBook ruleBook;

    public AStrategy(ArrayList<Equation> equations) {
        this.equations = equations;
        ruleBook = new RuleBook();
    }

    public void setEqs(ArrayList<Equation> equations) {
        this.equations = equations;
    }

    /**
     * Each turn a player updates its strategy with current information
     * @param playerInventory
     * @param currentVisibleCards
     * @param bankInventory
     */
    public void updateStrategy(Inventory playerInventory, ArrayList<Card> currentVisibleCards, Inventory bankInventory){
        this.currentPlayerInventory = new Inventory(playerInventory.getPebbles());
        this.currentVisibleCards = new ArrayList<>(currentVisibleCards);
        this.currentBankInventory = new Inventory(bankInventory.getPebbles());
        bestCandidate = new ArrayList<>();
        maxMetric = -1;
    }

    /**
     * implemented by separate strategies to choose desired metric
     * @param currentCards
     * @param newPoints
     * @return
     */
    protected abstract int updateMetric(ArrayList<Card> currentCards,PlayerScore newPoints);

    /**
     * starts the recursive call, and returns the best candidate that was found
     * @return
     */
    public Optional<Candidate> getBestCandidate(Boolean pickedPebble){
        this.pickedPebble= pickedPebble;
        PlayerMoveState startingState = new PlayerMoveState(currentPlayerInventory,currentBankInventory,equations,currentVisibleCards,new ArrayList<Equation>(),new ArrayList<>(), new PlayerScore(0),bestCandidate);
        if(pickedPebble){
            buyCardRecursive(startingState);
        }
        else{
            exchangePurchaseRecursion(startingState);
        }

        if(bestCandidate.isEmpty()){
            return Optional.empty();
        }
        if (bestCandidate.size() > 1) {
            bestCandidate = TieBreaker.exchangeAndPurchaseTieBreaker(bestCandidate);
        }
        return Optional.of(bestCandidate.get(0));
    }

    /**
     * performs recursion on available equations and calls card recursion
     * @param playerMoveState
     * @return
     */
    public PlayerMoveState exchangePurchaseRecursion(PlayerMoveState playerMoveState){
        // filter equations that can be used
        ArrayList<Equation> filteredEquations = ruleBook.filterEqSet(playerMoveState.getCurrentPlayerInventory().getPebbles(),playerMoveState.getCurrentBankInventory().getPebbles(),playerMoveState.getAvailableEquations());
        // make recursive call to see
        buyCardRecursive(playerMoveState);
        if(filteredEquations.isEmpty() || playerMoveState.getEquationsUsed().size()>=MAX_EXCHANGES){
            return playerMoveState;
        }

        for (Equation equation : filteredEquations) {
            PlayerMoveState postExchange =  playerMoveState.executeFunctionalEquationPurchase(equation);
            buyCardRecursive(postExchange);
            exchangePurchaseRecursion(postExchange);
        }
        return playerMoveState;
    }

    /**
     * performs recursion on available cards
     * @param playerMoveState
     * @return
     */
    public PlayerMoveState buyCardRecursive(PlayerMoveState playerMoveState) {
        ArrayList<Card> usableCards = ruleBook.filterCardList(playerMoveState.getAvailableCards(), playerMoveState.getCurrentPlayerInventory());
        if(usableCards.isEmpty())
            return playerMoveState;
        for (Card card : usableCards) {
            PlayerMoveState postPurchase = playerMoveState.executeFunctionalCardPurchase(card);
            int newMetric = updateMetric(postPurchase.getCardsBought(), postPurchase.getCurrentPoints());
            if (newMetric >= maxMetric) {
                Candidate newCandidate = new Candidate(
                        new ArrayList<>(postPurchase.getEquationsUsed()), new ArrayList<>(postPurchase.getCardsBought()),
                        postPurchase.getCurrentPoints().getScore(), new ArrayList<>(postPurchase.getCurrentPlayerInventory().getPebbles()),
                        postPurchase.getEquationsUsed().size(), postPurchase.getCardsBought().size());

                if (newMetric > maxMetric) {
                    bestCandidate.clear();  // Reset the list for new top metric
                    maxMetric = newMetric;
                }
                bestCandidate.add(newCandidate);
            }
            buyCardRecursive(postPurchase);
        }
        return playerMoveState;
    }


}

