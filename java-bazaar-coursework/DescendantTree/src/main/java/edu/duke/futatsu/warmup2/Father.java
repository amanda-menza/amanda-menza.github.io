package edu.duke.futatsu.warmup2;

import java.util.ArrayList;

public class Father extends APerson{

    /**
     * Instantiates a Father object calling APerson constructor
     * @param name
     * @param children
     */
    public Father(String name, ArrayList<APerson> children) {
        super(name,children);
    }

    /**
     * Method to get string representation of role
     * @return "father"
     */
    @Override
    public String toPathString() {
        return "\"father\"";
    }
}
