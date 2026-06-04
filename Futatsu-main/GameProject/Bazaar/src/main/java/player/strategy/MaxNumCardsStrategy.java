package player.strategy;

import common.Card;
import common.Equation;
import common.Inventory;
import player.PlayerScore;
import utils.EquationUtils;

import java.util.*;

/**
 * Class for strategy that focuses on maximizing cards bought
 */
public class MaxNumCardsStrategy extends AStrategy{
    public MaxNumCardsStrategy(ArrayList<Equation> equations){
        super(equations);
    }

    /**
     * updates metric in recursion to be current card list size
     * @param currentCards
     * @param newPoints
     * @return
     */
    public int updateMetric(ArrayList<Card> currentCards, PlayerScore newPoints){
        return currentCards.size();
    }

}

