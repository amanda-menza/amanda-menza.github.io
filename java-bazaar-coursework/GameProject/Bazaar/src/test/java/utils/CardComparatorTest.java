package utils;

import common.Card;
import common.Pebble;
import org.junit.jupiter.api.Test;

import static common.Card.initializeNonRandomCard;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Arrays;

class CardComparatorTest {

    private final CardComparator comparator = new CardComparator();
    ArrayList<Pebble> pebbleList1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE,Pebble.BLUE,Pebble.BLUE,Pebble.GREEN));
    ArrayList<Pebble> pebbleList2 = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.BLUE,Pebble.YELLOW,Pebble.GREEN,Pebble.GREEN));
    ArrayList<Pebble> pebbleList3 = new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.WHITE, Pebble.RED, Pebble.RED, Pebble.BLUE));

    @Test
    void testCompare_whenFirstCardHasStar_shouldReturnPositive() {
        Card cardA = initializeNonRandomCard(pebbleList1, true);
        Card cardB = initializeNonRandomCard(pebbleList1, false);

        assertTrue(comparator.compare(cardA, cardB) > 0, "Card A should be greater because it has a star.");
    }

    @Test
    void testCompare_whenSecondCardHasStar_shouldReturnNegative() {
        Card cardA = initializeNonRandomCard(pebbleList1, false);
        Card cardB = initializeNonRandomCard(pebbleList1, true);

        assertTrue(comparator.compare(cardA, cardB) < 0, "Card B should be greater because it has a star.");
    }

    @Test
    void testCompare_whenBothCardsHaveStar_shouldUsePebbleComparison() {
        Card cardA = initializeNonRandomCard(pebbleList1, true);
        Card cardB = initializeNonRandomCard(pebbleList2, true);

        int result = comparator.compare(cardA, cardB);
        assertTrue(comparator.compare(cardA, cardB) < 0, "Card B should be greater because A it is lexographically smaller.");
    }

    @Test
    void testCompare_whenNeitherCardHasStar_shouldUsePebbleComparison() {
        Card cardA = initializeNonRandomCard(pebbleList2, false);
        Card cardB = initializeNonRandomCard(pebbleList1, false);

        int result = comparator.compare(cardA, cardB);
        assertTrue(comparator.compare(cardA, cardB) > 0, "Card A should be greater because B is lexographically smaller.");
    }

    @Test
    void testCompare_whenBothCardsHaveSameStarStatusAndSamePebbles_shouldReturnZero() {
        Card cardA = initializeNonRandomCard(pebbleList3, false);
        Card cardB = initializeNonRandomCard(pebbleList3, false);
        int result = comparator.compare(cardA, cardB);
        assertEquals(0, comparator.compare(cardA, cardB), "Cards with same star status and pebbles should be equal.");
    }
}