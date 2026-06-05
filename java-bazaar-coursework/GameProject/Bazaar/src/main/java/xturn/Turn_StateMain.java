package xturn;

import common.Card;
import common.Turn_State;
import player.Player;
import referee.Bank;
import referee.Game_State;
import referee.Referee;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;

import static referee.Game_State.initializeGameWithSTDIN;
import static utils.BankUtils.convertToBank;
import static utils.CardUtils.convertToCardList;
import static utils.player_utils.PlayerUtils.convertToPlayerList;

public class Turn_StateMain {
    public static void main(String[] args) {

        Scanner scanner = new Scanner(new InputStreamReader(System.in));
        ArrayList<String> commands = new ArrayList<>();
        while (scanner.hasNext()) {
            String line = scanner.nextLine();
            if (!line.isBlank()) {
                commands.add(line);
            }
        }

        String bankString = commands.get(0);
        String invisibleCardString = commands.get(1);
        String playerString = commands.get(2);
        String visibleCardString = commands.get(3);
        Bank bank = convertToBank(bankString);
        ArrayList<Card> invisibleCards = convertToCardList(invisibleCardString);
        ArrayList<Card> visibleCards = convertToCardList(visibleCardString);
        Game_State gameState = initializeGameWithSTDIN(bank, invisibleCards, visibleCards);
        Referee ref = new Referee(gameState);
        gameState.setReferee(ref);
        ArrayList<Player> players = convertToPlayerList(playerString);
        for (Player player : players) {
            ref.notifyAddPlayer(player);
        }
        gameState.setInitialActivePlayer();
        Turn_State turnState = gameState.getTurnState();
        turnState.printTurnState();
    }
}
