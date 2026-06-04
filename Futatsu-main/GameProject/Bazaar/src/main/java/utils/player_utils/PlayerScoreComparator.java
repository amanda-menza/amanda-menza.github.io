package utils.player_utils;

import player.Player;

import java.util.Comparator;

/**
 * This class is used to compare the scores of two players
 * Which will be used to sort the players in descending order of score at the end of the game
 */
public class PlayerScoreComparator implements Comparator<Player> {
    @Override
    public int compare(Player p1, Player p2) {
        return Integer.compare(p2.getPlayerScore().getScore(), p1.getPlayerScore().getScore());
    }

}
//
//public static class PlayerScoreTupleComparator implements Comparator<Map.Entry<Player, Integer>> {
//    @Override
//    public int compare(Map.Entry<Player, Integer> tuple1, Map.Entry<Player, Integer> tuple2) {
//        return Integer.compare(tuple2.getValue(), tuple1.getValue());
//    }
//}