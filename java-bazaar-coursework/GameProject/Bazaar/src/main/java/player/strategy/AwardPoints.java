package player.strategy;

import common.Card;
import common.Inventory;

public class AwardPoints {
    private static final int PLAIN_3_OR_MORE=1;
    private static final int STAR_3_OR_MORE=2;
    private static final int PLAIN_2=2;
    private static final int STAR_2=3;
    private static final int PLAIN_1=3;
    private static final int STAR_1=5;
    private static final int PLAIN_0=5;
    private static final int STAR_0=8;

    private static int[][] pointsTable = {
            {PLAIN_0, PLAIN_1, PLAIN_2, PLAIN_3_OR_MORE}, // No star
            {STAR_0, STAR_1, STAR_2, STAR_3_OR_MORE}      // Has star
    };


    /**
     * Returns correct number of points based on how many pebbles are left
     * and if card has a star.
     * Uses game guidelines to determine point scale.
     * @param inventory
     * @param card
     * @return number of points player should be awarded
     */
    public static int calculatePoints(Inventory inventory, Card card) {
        int pebblesLeft = Math.min(inventory.getPebbleCount(), 3);
        boolean hasStar = card.getHasStar();
        int starIndex = hasStar ? 1 : 0;
        return pointsTable[starIndex][pebblesLeft];
    }

}
