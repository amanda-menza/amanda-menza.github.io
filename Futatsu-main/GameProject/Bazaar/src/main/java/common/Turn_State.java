package common;

import player.IPlayer;
import player.Player;
import player.PlayerScore;

import java.util.ArrayList;
import java.util.stream.Collectors;

import static utils.CardUtils.convertCardListToString;
import static utils.PebbleUtils.convertPebbleListToString;

public class Turn_State {
    private Inventory bankInventory;
    private IPlayer activePlayer;
    private ArrayList<PlayerScore> otherPlayerScores;
    private ArrayList<Card> visibleCards;
    public Turn_State(Inventory bankPebbles, IPlayer activePlayer, ArrayList<PlayerScore> otherPlayerScores, ArrayList<Card> visibleCards) {
        this.activePlayer = activePlayer;
        this.otherPlayerScores = otherPlayerScores;
        this.bankInventory = bankPebbles;
        this.visibleCards = visibleCards;
    }

    public Inventory getBankInventory() {
        return bankInventory;
    }
    public IPlayer getActivePlayer() {
        return activePlayer;
    }
    public ArrayList<PlayerScore> getOtherPlayerScores() {
        return otherPlayerScores;
    }

    public ArrayList<Card> getVisibleCards() {
        return visibleCards;
    }

    public void printTurnState(){
        String bankInventoryString = convertPebbleListToString(bankInventory.getPebbles());
        String visibleCardString = convertCardListToString(visibleCards);
        String otherPlayerScoreString = "["+otherPlayerScores.stream()
                .map(object -> String.valueOf(object.getScore())) // Converts each Integer to a String
                .collect(Collectors.joining(",")) + "]";
        System.out.println(activePlayer.toString());
        System.out.println();
        System.out.println(bankInventoryString);
        System.out.println();
        System.out.println(visibleCardString);
        System.out.println();
        System.out.println(otherPlayerScoreString);



    }

}