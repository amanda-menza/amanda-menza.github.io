package common;

import java.util.ArrayList;
import java.util.Optional;

import common.transaction.CardTransaction;
import common.transaction.EquationTransaction;
import player.PlayerScore;
import player.strategy.Candidate;

/**
 * Purpose: Acts as a central location in game to perform game rule checks.
 */
public class RuleBook implements IRuleBook {

    public RuleBook() {
    }

    /**
     * Checks if a player's turn is valid based on this rulebook and the current
     * turn state
     *
     * @param candidate
     * @param turnState
     * @param pickedPebble
     * @return boolean for representing validity
     */
    @Override
    public boolean isValidTurn(Candidate candidate, Turn_State turnState, boolean pickedPebble) {
        if(pickedPebble && !candidate.getEquationsUsed().isEmpty()) {
            return false;
        }
        Inventory playerInventory = new Inventory(turnState.getActivePlayer().getInventory().getPebbles());
        Inventory bankInventory = new Inventory(turnState.getBankInventory().getPebbles());

        boolean areEquationsValid = areEquationsValid(candidate.getEquationsUsed(), playerInventory, bankInventory);

        ArrayList<Card> visibelCards= new ArrayList<>(turnState.getVisibleCards());
        ArrayList<Card> playerCards = new ArrayList<>();
        PlayerScore playerScore = new PlayerScore(0);

        boolean areCardsValid = areCardsValid(candidate.getCardsBought(), playerInventory, bankInventory, playerCards, playerScore,visibelCards);
        // all logical checks for a valid turn:
        if (playerInventory.equals(candidate.getRemainingInventory()) && bankInventory.hasValidPebbleCounts() && playerScore.equals(candidate.getTotalPoints()) && areEquationsValid && areCardsValid){
            return true;
        }
        else{
            return false;
        }
    }





    /**
     * Checks if a sequence of equations can be executed in order with the given
     * turn state
     *
     *@param equations
     * @param playerInventory
     * @param bankInventory
     * @return true if all equations can be executed in sequence, false otherwise
     */
    public boolean areEquationsValid(ArrayList<Equation> equations, Inventory playerInventory,
            Inventory bankInventory) {
        if (equations.size() <= MAXIMUM_EXCHANGES) {

            for (Equation equation : equations) {
                if (canUseEquation(equation,playerInventory,bankInventory)) {
                    EquationTransaction eqTransaction = new EquationTransaction(equation, playerInventory,
                            bankInventory);
                    eqTransaction.execute();
                } else {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }


    /**
     * Checks if a sequence of cards can be executed in order with the given turn state
     * @param cards List of cards to validate
     * @param playerInventory Current inventory of the player
     * @param bankInventory Current inventory of the bank
     * @param playerCards List of cards the player has already bought
     * @param playerScore Current score of the player
     * @return true if all cards can be executed in sequence, false otherwise
     */
    public boolean areCardsValid(ArrayList<Card> cards, Inventory playerInventory, Inventory bankInventory, ArrayList<Card> playerCards, PlayerScore playerScore, ArrayList<Card> visibelCards) {
        if(cards.size() <= NUM_VISIBLE_CARDS){
            for(Card card: cards){
                if(canBuyCard(card,playerInventory)){
                    CardTransaction cardTransaction = new CardTransaction(card, playerInventory, bankInventory, playerCards, playerScore,visibelCards);
                    cardTransaction.execute();
                }
                else{
                    return false;
                }
            }
            return true;
        }
        else{
            return false;
        }
    }

    /**
     * Checks if a player can use an equation
     * 
     * @param equation
     * @param playerInventory
     * @param bankInventory
     * @return boolean for representing usability
     */
    @Override
    public boolean canUseEquation(Equation equation, Inventory playerInventory, Inventory bankInventory) {
        return equation.playerCanUseLeftSide(playerInventory.getPebbles(), bankInventory.getPebbles());
    }

    /**
     * Checks if a player can buy a card
     * 
     * @param card
     * @param playerInventory
     * @return boolean for representing usability
     */
    public boolean canBuyCard(Card card, Inventory playerInventory) {
        return card.canBuyCard(playerInventory.getPebbles());
    }

    /**
     * Checks if the number of players is valid
     * 
     * @param numberOfPlayers
     * @return boolean for representing validity
     */
    public boolean validNumberOfPlayers(int numberOfPlayers) {
        return numberOfPlayers >= MINIMUM_NUM_PLAYERS && numberOfPlayers <= MAXIMUM_NUM_PLAYERS;
    }

    /**
     * Method to check if each equation can validly be used by player. Flipped equation checked for each.
     * Flipped equation is used to comply with the standard that the player is always using the left side.
     * @param playerWallet
     * @param bank
     * @param equations
     * @return
     */
    public ArrayList<Equation> filterEqSet(ArrayList<Pebble> playerWallet, ArrayList<Pebble> bank, ArrayList<Equation> equations){
        ArrayList<Equation> filteredEquations=new ArrayList<>();

        for(Equation equation: equations){
            if(equation.playerCanUseLeftSide(playerWallet,bank))
            {
                filteredEquations.add(equation);
            }
            Equation flipped=equation.flipEquation();
            if(flipped.playerCanUseLeftSide(playerWallet,bank)){
                filteredEquations.add(flipped);
            }
        }
        return filteredEquations;
    }

    /**
     * Filters visible cards that a player can buy
     * @param cardList
     * @param playerInventory
     * @return
     */
    public  ArrayList<Card> filterCardList(ArrayList<Card> cardList, Inventory playerInventory){
        ArrayList<Card> filteredCardList = new ArrayList<>();
        for (Card card : cardList) {
            if(card.canBuyCard(playerInventory.getPebbles()))
            {
                filteredCardList.add(card);
            }
        }
        return filteredCardList;
    }

    public Optional<Pebble> getDeterministicPebble(Turn_State s){
        Inventory bankInventory = s.getBankInventory();
        Pebble[] pebbleOrder = new Pebble[] {Pebble.RED, Pebble.WHITE, Pebble.BLUE, Pebble.GREEN, Pebble.YELLOW};
        for(Pebble p: pebbleOrder){
            if(bankInventory.getPebbles().contains(p)){
                bankInventory.removePebble(p);
                return Optional.of(p);
            }
        }
        return Optional.empty();
    }

}
