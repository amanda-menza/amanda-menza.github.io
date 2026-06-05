package edu.duke.futatsu.warmup2;

import java.util.ArrayList;

public class Mother extends APerson{

    /**
     * Instantiates a Mother object calling APerson constructor
     * @param name
     * @param children
     */
    public Mother(String name, ArrayList<APerson> children) {
        super(name,children);
    }

    /**
     *
     * @return "mother"
     */
    @Override
    public String toPathString() {
        return "\"mother\"";
    }
}
