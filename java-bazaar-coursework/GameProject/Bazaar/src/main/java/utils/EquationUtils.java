package utils;

import common.*;

import java.util.ArrayList;
import java.util.stream.Collectors;

import static common.Equation.initializeNonRandomEquation;
import static utils.PebbleUtils.convertPebbleListToString;
import static utils.PebbleUtils.convertToPebbles;
import static utils.StringUtils.trimBrackets;

public class EquationUtils {
    /**
     * Used to convert a string from STDIN into a valid equation object based on delimiter
     * @param strEq
     * @return Equation
     */
    public static Equation convertEquation(String strEq, String delimiter)
    {

        String [] strArr=strEq.split(delimiter);
        ArrayList<Pebble> leftSide= PebbleUtils.convertToPebbles(strArr[0],delimiter);
        ArrayList<Pebble> rightSide= PebbleUtils.convertToPebbles(strArr[1],delimiter);
        return initializeNonRandomEquation(leftSide,rightSide);

    }

    /**
     * Method to take filtered eqns and correctly format it for output
     * @param filtered
     * @return
     */
    public static ArrayList<String> formatRule(ArrayList<Equation> filtered){
        ArrayList<String> rules= new ArrayList<>();
        for(Equation eq:filtered) {
            String str="";
            str += eq.getLeftSide().stream()
                    .map(pebble -> pebble.name().toLowerCase()) // Convert each Pebble to lowercase string
                    .collect(Collectors.joining(" "));
            str += " -> ";
            str += eq.getRightSide().stream()
                    .map(pebble -> pebble.name().toLowerCase()) // Convert each Pebble to lowercase string
                    .collect(Collectors.joining(" "));
            rules.add(str);
        }
        return rules;
    }

    /**
     * Helper method to convert equation or rule lists
     * @param commands
     * @param delimiter
     * @return
     */
    public static ArrayList<Equation> convertFromStringListToEqList(ArrayList<String> commands, String delimiter){
        ArrayList<Equation> equations = new ArrayList<>();

        for(String s: commands){
            String trimmedStr = trimBrackets(s);
            if(trimmedStr.isEmpty()){
                return equations;
            }
            equations.add(convertEquation(trimmedStr,delimiter));
        }
        return equations;
    }

    /**
     * Helper method to show result of rule/equation validation to STDOUT
     * @param turnState
     * @param rules
     */
    public static void validateRules(Turn_State turnState, ArrayList<Equation> rules){
        Inventory bankInventory = turnState.getBankInventory();
        Inventory playerInventory = turnState.getActivePlayer().getInventory();
        RuleBook ruleBook = new RuleBook();
        boolean isValid = ruleBook.areEquationsValid(rules,playerInventory,bankInventory);
        if(isValid){
            System.out.println(convertPebbleListToString(playerInventory.getPebbles()));
            System.out.println();
            System.out.print(convertPebbleListToString(bankInventory.getPebbles()));
        }
        else{
            System.out.print("false");
        }
    }

    /**
     * Except STDIN from game test
     * @param stringEqs
     * @return
     */
    public static ArrayList<Equation> convertFrom2DArrayListToEquationList(ArrayList<String> stringEqs){
        ArrayList<Equation> equations = new ArrayList<>();
        for(String s: stringEqs){
            String [] eqArr=trimBrackets(trimBrackets(s)).split("\\],\\[");
            if(eqArr[0].isBlank())
            {
                return equations;
            }
            String leftStr = eqArr[0].substring(1);
            String rightStr = eqArr[1].substring(0,eqArr[1].length()-1);
            ArrayList<Pebble> leftPebbles =convertToPebbles(leftStr,",");
            ArrayList<Pebble> rightPebbles =convertToPebbles(rightStr,",");
            equations.add(initializeNonRandomEquation(leftPebbles,rightPebbles));
        }

        return equations;
    }


}
