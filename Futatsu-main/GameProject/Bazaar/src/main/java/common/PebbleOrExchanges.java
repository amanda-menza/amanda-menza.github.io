package common;
import java.util.*;

/**
 * Purpose:
 * the format of return when the ref asks player for requestPebbleOrTrades.
 */
public class PebbleOrExchanges {
    private boolean receivePebble;
    private ArrayList<Equation> exchanges;

    public PebbleOrExchanges(boolean receivePebble, ArrayList<Equation> exchanges) {
        this.receivePebble = receivePebble;
        this.exchanges = exchanges;
    }

    public boolean getReceivePebble() {
        return receivePebble;
    }

    public ArrayList<Equation> getExchanges() {
        return exchanges;
    }
}
