package utils;

import common.Equation;
import common.Pebble;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

public class EquationListComparatorTest {

    private final Comparator<ArrayList<Equation>> equationListComparator = new EquationListComparator();

    @Test
    public void testIdenticalLists() {
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED));
        ArrayList<Pebble> rightSide = new ArrayList<>(Arrays.asList(Pebble.BLUE));

        Equation eq1 = new Equation(leftSide, rightSide);
        Equation eq2 = new Equation(leftSide, rightSide);

        ArrayList<Equation> list1 = new ArrayList<>(Arrays.asList(eq1, eq2));
        ArrayList<Equation> list2 = new ArrayList<>(Arrays.asList(eq1, eq2));

        assertEquals(0, equationListComparator.compare(list1, list2));  // identical lists should be equal
    }

    @Test
    public void testDifferentSizes() {
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Arrays.asList(Pebble.BLUE));

        Equation eq1 = new Equation(leftSide, rightSide);

        ArrayList<Equation> list1 = new ArrayList<>(Arrays.asList(eq1));
        ArrayList<Equation> list2 = new ArrayList<>(Arrays.asList(eq1, eq1));

        assertTrue(equationListComparator.compare(list1, list2) < 0);   // list1 is smaller than list2
        assertTrue(equationListComparator.compare(list2, list1) > 0);   // list2 is greater than list1
    }

    @Test
    public void testDifferentElementsSameSize() {
        ArrayList<Pebble> leftSide1 = new ArrayList<>(Arrays.asList(Pebble.RED));
        ArrayList<Pebble> rightSide1 = new ArrayList<>(Arrays.asList(Pebble.BLUE));

        ArrayList<Pebble> leftSide2 = new ArrayList<>(Arrays.asList(Pebble.BLUE));
        ArrayList<Pebble> rightSide2 = new ArrayList<>(Arrays.asList(Pebble.RED));

        Equation eq1 = new Equation(leftSide1, rightSide1);
        Equation eq2 = new Equation(leftSide2, rightSide2);

        ArrayList<Equation> list1 = new ArrayList<>(Arrays.asList(eq1));
        ArrayList<Equation> list2 = new ArrayList<>(Arrays.asList(eq2));

        assertNotEquals(0, equationListComparator.compare(list1, list2));  // lists differ by element
        assertTrue(equationListComparator.compare(list1, list2) > 0);      // list1 is greater than list2 based on eq1 > eq2
    }

    @Test
    public void testMultipleElementsWithDifferentComparisons() {
        ArrayList<Pebble> leftSide1 = new ArrayList<>(Arrays.asList(Pebble.RED));
        ArrayList<Pebble> rightSide1 = new ArrayList<>(Arrays.asList(Pebble.BLUE));

        ArrayList<Pebble> leftSide2 = new ArrayList<>(Arrays.asList(Pebble.RED));
        ArrayList<Pebble> rightSide2 = new ArrayList<>(Arrays.asList(Pebble.RED));

        Equation eq1 = new Equation(leftSide1, rightSide1);
        Equation eq2 = new Equation(leftSide2, rightSide2);

        ArrayList<Equation> list1 = new ArrayList<>(Arrays.asList(eq1, eq2));
        ArrayList<Equation> list2 = new ArrayList<>(Arrays.asList(eq2, eq1));

        assertNotEquals(0, equationListComparator.compare(list1, list2));  // lists differ by order of elements
        assertTrue(equationListComparator.compare(list1, list2) < 0);      // list1 < list2 based on order of eq1 and eq2
    }

    @Test
    public void testEmptyLists() {
        ArrayList<Equation> list1 = new ArrayList<>();
        ArrayList<Equation> list2 = new ArrayList<>();

        assertEquals(0, equationListComparator.compare(list1, list2));  // two empty lists are equal
    }
}

