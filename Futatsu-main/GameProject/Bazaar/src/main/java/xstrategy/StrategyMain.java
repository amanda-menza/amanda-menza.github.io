package xstrategy;

import common.Card;
import common.Equation;
import common.Turn_State;
import player.Player;
import player.PlayerException;
import player.PlayerScore;
import referee.Bank;
import referee.Game_State;
import referee.Referee;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;

import static utils.BankUtils.convertToBank;
import static utils.CardUtils.convertToCardList;
import static utils.EquationUtils.convertEquation;
import static utils.player_utils.PlayerUtils.convertToPlayer;
import static utils.player_utils.PlayerUtils.convertToPlayerScoreList;

/**
 * Purpose: Parse turn state std in and strategy type to find the best candidate. Print best candidate to std out.
 */
public class StrategyMain {
    public static void main(String[] args) throws PlayerException {

        Scanner scanner = new Scanner(new InputStreamReader(System.in));
        ArrayList<String> commands = new ArrayList<>();
        while (scanner.hasNext()) {
            String line = scanner.nextLine();
            if(!line.isBlank())
            {
                commands.add(line);
            }
        }
        ArrayList<Equation> equations = new ArrayList<>();
        for(int i = 0; i < 10; i++)
        {
            equations.add(convertEquation(commands.get(i)," = "));
        }
        Game_State gameState = new Game_State();
        Referee ref= new Referee(gameState);
        String activePlayerStr=commands.get(10);
        String bankString = commands.get(11);
        String visibleCardString = commands.get(12);
        String otherScoreString = commands.get(13);
        String strategyString = commands.get(14);

        Player activePlayer = convertToPlayer(activePlayerStr);
        Bank bank = convertToBank(bankString);
        ArrayList<Card> visibleCards = convertToCardList(visibleCardString);
        ArrayList<PlayerScore> otherPlayerScores = convertToPlayerScoreList(otherScoreString);
        Turn_State turnState = new Turn_State(bank.getBankInventory(), activePlayer, otherPlayerScores, visibleCards);
        activePlayer.setup(equations);
        activePlayer.setStrategyType(strategyString);
        gameState.setCurrentTurnState(turnState);
        ref.getFirstPlayerRequest();
        ref.getSecondPlayerRequest();
        //System.out.println(ref.evaluateMove());
        ref.getRefCurrentCandidate().printCandidate();
        //activePlayer.getCurrentCandidate().printCandidate();
//        System.out.println(bestCandidate);
    }
}
