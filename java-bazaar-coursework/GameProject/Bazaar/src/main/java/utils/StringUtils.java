
package utils;

import common.Equation;

import java.util.ArrayList;
import java.util.stream.Collectors;

public class StringUtils{

    /**
     * remove beginning and closing brackets from an array given as a string
     * @param str
     * @return
     */
    public static String trimBrackets(String str) {
        if (str != null && str.startsWith("[") && str.endsWith("]")) {
            return str.substring(1, str.length() - 1);
        }
        return str;
    }

    /**
     * Remove leading and closing curly brackets from string
     * @param str
     * @return
     */
    public static String trimCurlyBrackets(String str) {
        if (str != null && str.startsWith("{") && str.endsWith("}")) {
            return str.substring(1, str.length() - 1);
        }
        return str;
    }


}