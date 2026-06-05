package xeq;

import common.Equation;
import common.IRuleBook;
import common.Pebble;

import common.RuleBook;
import referee.GameStateActionsForRef;
import referee.Game_State;
import referee.Referee;
import referee.RefActionsForGameState;
import utils.EquationUtils;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;

import static utils.EquationUtils.convertEquation;
import static utils.PebbleUtils.convertToPebbles;

public class EquationExchangeMain {
    public static void main(String[] args) {

        Scanner scanner = new Scanner(new InputStreamReader(System.in));
        ArrayList<String> commands = new ArrayList<>();
        while (scanner.hasNext()) {
            String line = scanner.nextLine();
            commands.add(line);
        }
        scanner.close();
        ArrayList<Equation> equations = new ArrayList<>();
        ArrayList<Pebble> wallet;
        ArrayList<Pebble> bank;
        int stopIndex=-1;

        //accumulate all the equations
        for(int i=0;i<commands.size();i++)
        {
            String inputLine=commands.get(i);
            if(inputLine.equals(""))
            {
                stopIndex=i;
                break;
            }
            else{
                equations.add(convertEquation(inputLine," = "));
            }
        }
        GameStateActionsForRef gameState = new Game_State();
        RefActionsForGameState ref=new Referee(gameState);
        wallet=new ArrayList<>();
        bank=new ArrayList<>();
        if(commands.size()>stopIndex+1) {
            wallet = convertToPebbles(commands.get(stopIndex + 1), " ");
            if (commands.size() > stopIndex + 3) {
                bank = convertToPebbles(commands.get(stopIndex + 3), " ");
            }
        }
        IRuleBook ruleBook = new RuleBook();
        ArrayList<Equation> filtered= ruleBook.filterEqSet(wallet,bank,equations);
        ArrayList<String> rules = EquationUtils.formatRule(filtered);
        for(String rule:rules){
            System.out.println(rule);
        }


    }

}
