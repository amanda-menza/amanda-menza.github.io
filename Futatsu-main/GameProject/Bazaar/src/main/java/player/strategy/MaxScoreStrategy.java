package player.strategy;

import common.Card;
import common.Equation;
import common.Inventory;
import player.PlayerScore;

import java.util.*;

public class MaxScoreStrategy extends AStrategy{
    public MaxScoreStrategy(ArrayList<Equation> equations){
        super(equations);
    }

    public int updateMetric(ArrayList<Card> currentCards, PlayerScore newPoints){
        return newPoints.getScore();
    }
}
