package utils;

import common.Equation;
import common.Pebble;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Arrays;

public class EquationComparatorTest {

    private final Comparator<Equation> equationComparator = new EquationComparator();

    @Test
    public void testIdenticalEquations() {
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.RED));
        Equation equation1 = new Equation(leftSide, rightSide);
        Equation equation2 = new Equation(leftSide, rightSide);
        assertEquals(0, equationComparator.compare(equation1, equation2));  // identical equations should be equal
    }

    @Test
    public void testDifferentLeftSide() {
        ArrayList<Pebble> leftSide1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> leftSide2 = new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.WHITE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED));

        Equation equation1 = new Equation(leftSide1, rightSide);
        Equation equation2 = new Equation(leftSide2, rightSide);

        assertNotEquals(0, equationComparator.compare(equation1, equation2));  // equations differ by left side
        assertTrue(equationComparator.compare(equation1, equation2) < 0);      // equation1's left side should be less than equation2's
    }

    @Test
    public void testDifferentRightSide() {
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide1 = new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.RED));
        ArrayList<Pebble> rightSide2 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));

        Equation equation1 = new Equation(leftSide, rightSide1);
        Equation equation2 = new Equation(leftSide, rightSide2);

        assertNotEquals(0, equationComparator.compare(equation1, equation2));  // equations differ by right side
        assertTrue(equationComparator.compare(equation1, equation2) > 0);      // equation1's right side should be greater than equation2's
    }

    @Test
    public void testBothSidesDifferent() {
        ArrayList<Pebble> leftSide1 = new ArrayList<>(Arrays.asList(Pebble.BLUE));
        ArrayList<Pebble> rightSide1 = new ArrayList<>(Arrays.asList(Pebble.RED));

        ArrayList<Pebble> leftSide2 = new ArrayList<>(Arrays.asList(Pebble.RED));
        ArrayList<Pebble> rightSide2 = new ArrayList<>(Arrays.asList(Pebble.BLUE));

        Equation equation1 = new Equation(leftSide1, rightSide1);
        Equation equation2 = new Equation(leftSide2, rightSide2);

        assertNotEquals(0, equationComparator.compare(equation1, equation2));  // both sides differ
        assertTrue(equationComparator.compare(equation1, equation2) < 0);      // equation1 is less than equation2 based on left side
    }

    @Test
    public void testEmptySides() {
        ArrayList<Pebble> emptyList = new ArrayList<>();

        Equation equation1 = new Equation(emptyList, emptyList);
        Equation equation2 = new Equation(emptyList, emptyList);

        assertEquals(0, equationComparator.compare(equation1, equation2));  // both equations are empty and should be equal
    }
}

