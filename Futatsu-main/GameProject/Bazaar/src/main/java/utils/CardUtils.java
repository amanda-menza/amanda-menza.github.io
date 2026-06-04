package utils;

import common.Card;
import common.Inventory;
import common.Pebble;

import java.util.*;
import java.util.stream.Collectors;

import static common.Card.initializeNonRandomCard;
import static utils.PebbleUtils.*;
import static utils.StringUtils.trimBrackets;
import static utils.StringUtils.trimCurlyBrackets;

public class CardUtils{

    /**
     * Method to correctly print card list without unnecessary spaces
     * @param cardList
     * @return
     */
    public static String convertCardListToString(ArrayList<Card> cardList){
        return "["+cardList.stream()
                .map(Card::toString) // Explicitly calls toString, though it should work without map()
                .collect(Collectors.joining(","))+"]";
    }

    /**
     * Method converts a string from STDIN into an array list of card objects
     * @param str
     * @return
     */
    public static ArrayList<Card> convertToCardList(String str){
        String trimmedStr = trimCurlyBrackets(trimBrackets(str));
        String[] cardArr = trimmedStr.split("\\},\\{");
        ArrayList<Card> cardList = new ArrayList<>();
        if(trimmedStr.isBlank()){
            return cardList;
        }
        for (String cardStr : cardArr) {
            Card card=convertToCard(cardStr.trim());
            cardList.add(card);
        }
        return cardList;
    }

    /**
     * Turns a given string into a single card
     * @param str
     * @return
     */
    public static Card convertToCard(String str){
        int commaIndex = str.indexOf(',');
        String starVal="";
        String pebbleStrList="";
        // Check if a comma exists in the string
        if (commaIndex != -1) {
            // Split into two parts: before the first comma, and after
            starVal = str.substring(0, commaIndex);
            pebbleStrList = str.substring(commaIndex + 1);
        }
        ArrayList<Pebble> cardPebbles = convertToPebbles(trimBrackets(pebbleStrList),",");
        Boolean hasStar = Boolean.parseBoolean(starVal);
        return initializeNonRandomCard(cardPebbles,hasStar);
    }

}