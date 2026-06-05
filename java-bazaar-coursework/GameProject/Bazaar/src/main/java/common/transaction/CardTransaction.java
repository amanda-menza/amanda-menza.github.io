package common.transaction;

import common.Card;
import common.Inventory;
import player.PlayerScore;
import player.strategy.AwardPoints;

import java.util.ArrayList;

public class CardTransaction {

    private ArrayList<Card> playerCards; // cards a player has already purchased
    private Card card;
    private Inventory playerInventory;
    private Inventory bankInventory;
    private PlayerScore playerScore;
    ArrayList<Card> visibleCards;


    public CardTransaction(Card card, Inventory playerInventory, Inventory bankInventory ,ArrayList<Card> playerCards, PlayerScore playerScore,ArrayList<Card> visibleCards) {
        this.card = card;
        this.playerInventory = playerInventory;
        this.playerCards = playerCards;
        this.playerScore=playerScore;
        this.bankInventory=bankInventory;
        this.visibleCards=visibleCards;
    }

    public int cardScore(){
        return AwardPoints.calculatePoints(playerInventory, card);
    }

    /**
     * Execute a card transaction by updating bank and player accordingly
     * @return
     */
    public Boolean execute() {
        if(card.canBuyCard(playerInventory.getPebbles())){
            playerInventory.removePebbles(card.getPebbles());
            bankInventory.addPebbles(card.getPebbles());
            playerCards.add(card);
            visibleCards.remove(card);
            playerScore.updateScore(playerScore.getScore()+cardScore());
            return true;
        }

        return false;
    }




    /**
     * undo execution of a card transaction by updating bank and player accordingly
     * @return
     */
    public Boolean undoExecute(){
        if(card.canBuyCard(bankInventory.getPebbles())){
            playerScore.updateScore(playerScore.getScore()-cardScore());
            bankInventory.removePebbles(card.getPebbles());
            playerInventory.addPebbles(card.getPebbles());
            playerCards.remove(card);
            return true;
        }
        return false;
    }

}
