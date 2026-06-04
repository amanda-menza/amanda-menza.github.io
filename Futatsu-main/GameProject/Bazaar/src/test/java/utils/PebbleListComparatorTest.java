package utils;
import common.Pebble;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

class PebbleListComparatorTest {

    private final Comparator<ArrayList<Pebble>> comparator = new PebbleListComparator();

    @Test
    void testCompareBySize() {
        ArrayList<Pebble> list1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE)); // Size 2
        ArrayList<Pebble> list2 = new ArrayList<>(Arrays.asList(Pebble.RED));               // Size 1

        // list1 should be greater than list2 because it has more elements
        assertTrue(comparator.compare(list1, list2) > 0);

        // Reversed order
        assertTrue(comparator.compare(list2, list1) < 0);
    }

    @Test
    void testCompareSameSizeDifferentOrder() {
        ArrayList<Pebble> list1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));     // {RED, BLUE}
        ArrayList<Pebble> list2 = new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.RED));     // {BLUE, RED}

        assertTrue(comparator.compare(list2, list1) == 0);
        //get sorted so should be equal
    }

    @Test
    void testCompareSameSizeSameOrder() {
        ArrayList<Pebble> list1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));     // {RED, BLUE}
        ArrayList<Pebble> list2 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));     // {RED, BLUE}

        // Both lists are the same, so they should be considered equal
        assertTrue(comparator.compare(list1, list2) == 0);
    }

    @Test
    void testEmptyLists() {
        ArrayList<Pebble> list1 = new ArrayList<>();  // Empty list
        ArrayList<Pebble> list2 = new ArrayList<>();  // Empty list

        // Both lists are empty, so they should be considered equal
        assertTrue(comparator.compare(list1, list2) == 0);
    }

    @Test
    void testEmptyListVsNonEmptyList() {
        ArrayList<Pebble> list1 = new ArrayList<>();                       // Empty list
        ArrayList<Pebble> list2 = new ArrayList<>(Arrays.asList(Pebble.RED));  // Non-empty list with one element

        // list1 should be considered smaller because it is empty
        assertTrue(comparator.compare(list1, list2) < 0);

        // Reversed order
        assertTrue(comparator.compare(list2, list1) > 0);
    }
}
