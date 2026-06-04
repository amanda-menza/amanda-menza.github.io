package xrules;

import common.*;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;
import static utils.EquationUtils.*;
import static utils.TurnStateUtils.convertToTurnState;

/**
 * Purpose: Main method to process test input for xrules in milestone 6
 */
public class RuleValidationMain {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(new InputStreamReader(System.in));
        ArrayList<String> commands = new ArrayList<>();
        while (scanner.hasNext()) {
            String line = scanner.nextLine();
            commands.add(line);
        }
        int eqIndex=-1;
        int ruleIndex=-1;
        ArrayList<String> equationStrings = new ArrayList<>();
        ArrayList<String> ruleStrings = new ArrayList<>();
        for(int i=0;i<commands.size();i++){
            if(commands.get(i).isBlank()){
                eqIndex=i;
                break;
            }
            equationStrings.add(commands.get(i));
        }
        for(int i=eqIndex+1;i<commands.size();i++){
            if(commands.get(i).isBlank()){
                ruleIndex=i;
                break;
            }
            ruleStrings.add(commands.get(i));
        }

        ArrayList<Equation> equations = convertFromStringListToEqList(equationStrings," = ");
        ArrayList<Equation> rules = convertFromStringListToEqList(ruleStrings," -> ");

        String activePlayerStr=commands.get(ruleIndex+1);
        String bankString = commands.get(ruleIndex+2);
        String visibleCardString = commands.get(ruleIndex+3);
        String otherScoreString = commands.get(ruleIndex+4);

        Turn_State turnState = convertToTurnState(activePlayerStr,bankString,visibleCardString,otherScoreString);

        validateRules(turnState,rules);
    }

}
