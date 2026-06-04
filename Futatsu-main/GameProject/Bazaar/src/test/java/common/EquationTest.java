package common;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import utils.RandomUtil;

import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;

public class EquationTest {
    Equation equation;

    /**
     * Test case to mock random assignment in Equation
     */
    @Test
    public void testEqnGen1() {
        try (MockedStatic<RandomUtil> mockedStatic = mockStatic(RandomUtil.class)) {
            // Mock the first call for num pebbles on leftside and second for num pebbles on rightside
            when(RandomUtil.getRandom(Constants.MAX_NUM_PEBBLES_PER_SIDE)).thenReturn(2,1);

            // Mock the subsequent calls for the pebbles added to leftside
            when(RandomUtil.getRandom(Constants.NUM_COLORS))
                    .thenReturn(0,0, 2);  // RED, RED, GREEN

            //mock rightside pebble assignment
            when(RandomUtil.getRandom(Constants.NUM_COLORS-2))
                    .thenReturn(1,0);  //YELLOW, BLUE

            // Create a new Equation instance, which will use the mocked RandomUtil
            equation = new Equation();
            System.out.println(equation);

            // Verify order of calls
            mockedStatic.verify(() -> RandomUtil.getRandom(Constants.MAX_NUM_PEBBLES_PER_SIDE), times(2));
            mockedStatic.verify(() -> RandomUtil.getRandom(Constants.NUM_COLORS), times(3));
            mockedStatic.verify(() -> RandomUtil.getRandom(Constants.NUM_COLORS-2), times(2));


            // Validate the generated pebbles in sorted order
            ArrayList<Pebble> pebbles = equation.getLeftSide();
            assertEquals(3, pebbles.size(), "There should be exactly 3 pebbles");
            assertEquals(Pebble.GREEN, pebbles.get(0));
            assertEquals(Pebble.RED, pebbles.get(1));
            assertEquals(Pebble.RED, pebbles.get(2));
            pebbles = equation.getRightSide();
            assertEquals(2, pebbles.size(), "There should be exactly 2 pebbles");
            assertEquals(Pebble.BLUE, pebbles.get(0));
            assertEquals(Pebble.YELLOW, pebbles.get(1));

        }
    }

    @Test
    public void testCanUseEquation(){
        try (MockedStatic<RandomUtil> mockedStatic = mockStatic(RandomUtil.class)) {
            when(RandomUtil.getRandom(Constants.MAX_NUM_PEBBLES_PER_SIDE)).thenReturn(2,3);
            when(RandomUtil.getRandom(Constants.NUM_COLORS)).thenReturn(0,0,1);
            when(RandomUtil.getRandom(Constants.NUM_COLORS-2)).thenReturn(2,1,0,2);

            equation = new Equation();

            ArrayList<Pebble> inventory1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED, Pebble.BLUE, Pebble.BLUE, Pebble.WHITE,Pebble.GREEN));
            ArrayList<Pebble> inventory2 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED, Pebble.WHITE, Pebble.WHITE, Pebble.GREEN));

            assertTrue(equation.canUseEquation(inventory1));
            assertTrue(!equation.canUseEquation(inventory2));

        }
    }


    @Test
    public void testPlayerCanUseLeftSide() {
        // Sample left and right sides for equation
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW));

        Equation equation = new Equation(leftSide, rightSide);

        // Mock player and bank inventories
        ArrayList<Pebble> playerInventory = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.WHITE));
        ArrayList<Pebble> bankInventory = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW, Pebble.WHITE));

        assertTrue(equation.playerCanUseLeftSide(playerInventory, bankInventory));

        // Test case where player inventory is missing a required pebble
        playerInventory = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.WHITE));
        assertFalse(equation.playerCanUseLeftSide(playerInventory, bankInventory));

        // Test case where bank inventory is missing a required pebble
        playerInventory = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.WHITE));
        bankInventory = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.WHITE));
        assertFalse(equation.playerCanUseLeftSide(playerInventory, bankInventory));
    }

    @Test
    public void testFlipEquation() {
        // Sample left and right sides for equation
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW));

        Equation equation = new Equation(leftSide, rightSide);
        Equation flippedEquation = equation.flipEquation();

        // Assert that flipEquation swaps leftSide and rightSide
        assertEquals(rightSide, flippedEquation.getLeftSide());
        assertEquals(leftSide, flippedEquation.getRightSide());
    }
}
