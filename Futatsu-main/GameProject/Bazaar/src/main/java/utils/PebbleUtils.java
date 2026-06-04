package utils;

import common.Pebble;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.stream.Collectors;
import javafx.scene.paint.Paint;


public class PebbleUtils {
    /**
     * Method to turn a string of pebble colors into a valid pebble array list
     * @param str
     * @return ArrayList<Pebble>
     */
    public static ArrayList<Pebble> convertToPebbles(String str,String delimiter)
    {
        ArrayList<Pebble> pebbles=new ArrayList<>();
        if(str.isBlank())
            return pebbles;
        String [] strArr=str.toUpperCase().split(delimiter);
        for(String color:strArr)
        {
            try {
                pebbles.add(Pebble.valueOf(color.toUpperCase()));
            }
            catch (IllegalArgumentException e)
            {
                System.out.println("Invalid pebble color: "+color);
            }
        }

        return pebbles;

    }

    /**
     * Method to turn pebble colors to lower case list
     * @param pebbles
     * @return
     */
    public static ArrayList<String> convertPebbleListToLowerCase(ArrayList<Pebble> pebbles)
    {
       ArrayList<String> lowercasePebbles = pebbles.stream()
                .map(pebble -> pebble.name().toLowerCase())
                .collect(Collectors.toCollection(ArrayList::new));
       return lowercasePebbles;
    }

    /**
     * Method to correctly print pebble list without unnecessary spaces
     * @param pebbles
     * @return
     */
    public static String convertPebbleListToString(ArrayList<Pebble> pebbles){
        ArrayList<String> lower = convertPebbleListToLowerCase(pebbles);
        return "["+lower.stream().collect(Collectors.joining(","))+"]";
    }
}
