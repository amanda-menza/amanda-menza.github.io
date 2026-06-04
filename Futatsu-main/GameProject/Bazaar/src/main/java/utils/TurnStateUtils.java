package utils;

import common.Card;
import common.Turn_State;
import player.Player;
import player.PlayerScore;
import referee.Bank;

import java.util.ArrayList;

import static utils.BankUtils.convertToBank;
import static utils.CardUtils.convertToCardList;
import static utils.StringUtils.trimCurlyBrackets;
import static utils.player_utils.PlayerUtils.convertToPlayer;
import static utils.player_utils.PlayerUtils.convertToPlayerScoreList;

/**
 * Purpose: helper methods to deal with STDIN
 */
public class TurnStateUtils {
    /**
     * Helper method to convert STDIN to turn state
     * @param activePlayerStr
     * @param bankString
     * @param visibleCardString
     * @param otherScoreString
     * @return
     */
    public static Turn_State convertToTurnState(String activePlayerStr, String bankString, String visibleCardString, String otherScoreString ){
        Player activePlayer = convertToPlayer(trimCurlyBrackets(activePlayerStr));
        Bank bank = convertToBank(bankString);
        ArrayList<Card> visibleCards = convertToCardList(visibleCardString);
        ArrayList<PlayerScore> otherPlayerScores = convertToPlayerScoreList(otherScoreString);
        return new Turn_State(bank.getBankInventory(), activePlayer, otherPlayerScores, visibleCards);

    }

}
