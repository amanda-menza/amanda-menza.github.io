package utils;

import common.Card;
import common.Pebble;
import org.junit.jupiter.api.Test;

import static common.Card.initializeNonRandomCard;
import static org.junit.jupiter.api.Assertions.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Arrays;

public class CardListComparatorTest {

    private final Comparator<ArrayList<Card>> cardListComparator = new CardListComparator();
    Card card1 = initializeNonRandomCard(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE,Pebble.BLUE,Pebble.BLUE,Pebble.GREEN)),true);
    Card card2 = initializeNonRandomCard(new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.BLUE,Pebble.YELLOW,Pebble.GREEN,Pebble.GREEN)),true);
    Card card3 = initializeNonRandomCard(new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.WHITE, Pebble.RED, Pebble.RED, Pebble.BLUE)),true);



    @Test
    public void testDifferentSizes() {
        ArrayList<Card> list1 = new ArrayList<>(Arrays.asList(card1, card2));
        ArrayList<Card> list2 = new ArrayList<>(Arrays.asList(card2));
        assertTrue(cardListComparator.compare(list1, list2) > 0);  // list1 is larger than list2
        assertTrue(cardListComparator.compare(list2, list1) < 0);  // list2 is smaller than list1
    }

    @Test
    public void testEqualLists() {
        ArrayList<Card> list1 = new ArrayList<>(Arrays.asList(card1, card2));
        ArrayList<Card> list2 = new ArrayList<>(Arrays.asList(card1, card2));
        assertEquals(0, cardListComparator.compare(list1, list2));  // lists have identical cards
    }

    @Test
    public void testDifferentContentSameSize() {
        ArrayList<Card> list1 = new ArrayList<>(Arrays.asList(card1, card2));
        ArrayList<Card> list2 = new ArrayList<>(Arrays.asList(card2, card1));
        assertTrue(cardListComparator.compare(list1, list2) < 0);  // list1's first less than list2's
        assertTrue(cardListComparator.compare(list2, list1) > 0);  // reversed comparison
    }


    @Test
    public void testEmptyLists() {
        ArrayList<Card> list1 = new ArrayList<>();
        ArrayList<Card> list2 = new ArrayList<>();
        assertEquals(0, cardListComparator.compare(list1, list2));  // both lists are empty
    }

    @Test
    public void testOneEmptyList() {
        ArrayList<Card> list1 = new ArrayList<>();
        ArrayList<Card> list2 = new ArrayList<>(Arrays.asList(card1));
        assertTrue(cardListComparator.compare(list1, list2) < 0);  // empty list1 should be considered "less than" non-empty list2
        assertTrue(cardListComparator.compare(list2, list1) > 0);  // reversed comparison
    }
}

