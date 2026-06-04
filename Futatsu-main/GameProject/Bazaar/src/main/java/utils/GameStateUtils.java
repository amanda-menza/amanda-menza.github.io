package utils;

import common.Card;
import common.Equation;
import player.Player;
import referee.Bank;
import referee.Game_State;
import utils.player_utils.PlayerUtils;

import java.util.*;

import static utils.StringUtils.*;

public class GameStateUtils {
    public static Game_State convertStdInToGameStateWithActors(String gameStateString,String actorString, ArrayList<Equation> eqs) {
        String trimmedStr=trimBrackets(trimCurlyBrackets(gameStateString));
        String [] splitArr = trimmedStr.split("\\],\\[");
        Bank bank = BankUtils.convertToBank(splitArr[0]);
        ArrayList<Card> invisibleCards = CardUtils.convertToCardList(splitArr[1]);
        ArrayList<Card> visibleCards;
        if(splitArr.length>3){
            visibleCards=CardUtils.convertToCardList(splitArr[3]);
        }
        else{
            visibleCards = new ArrayList<>();
        }
        ArrayList<Player> playerList;
        if(splitArr[2].isEmpty()){
            playerList=new ArrayList<>();
        }
        else{
            playerList = PlayerUtils.convertToPlayerListWithActorInfo(actorString, splitArr[2]);
        }
        return Game_State.initializeGameWithPlayers(bank,invisibleCards,visibleCards,playerList,eqs);
    }
}
