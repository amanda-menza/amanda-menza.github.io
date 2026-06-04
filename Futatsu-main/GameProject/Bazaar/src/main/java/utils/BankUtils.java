package utils;

import referee.Bank;

import static referee.Bank.initializeBankWithPebbleList;
import static utils.PebbleUtils.convertToPebbles;
import static utils.StringUtils.trimBrackets;

public class BankUtils {
    /**
     * Method converts a string from STDIN into a bank object
     * @param str
     * @return
     */
    public static Bank convertToBank(String str){
        String bankString=trimBrackets(str);
        return initializeBankWithPebbleList(convertToPebbles(bankString,","));
    }
}
