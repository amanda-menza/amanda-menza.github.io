package common;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.Arrays;

class InventoryTest {

    private Inventory inventory;  // The class you're testing

    @BeforeEach
    void setUp() {
        inventory = new Inventory();  // Reset inventory before each test
    }

    @Test
    void testAddPebbles() {
        Pebble pebble = Pebble.BLUE;
        ArrayList<Pebble> pebblesToAdd = new ArrayList<>(Arrays.asList(pebble,pebble,pebble));

        // Add 3 Blue pebbles
        inventory.addPebbles(pebblesToAdd);

        // Verify the correct number of pebbles is added
        assertEquals(3, inventory.getPebbleCount());
        assertEquals(3, inventory.getPebbles().size());
        assertTrue(inventory.getPebbles().contains(pebble));
    }

    @Test
    void testAddPebblesWithZeroCount() {
        Pebble pebble = Pebble.RED;

        // Add 0 Red pebbles
        inventory.addPebbles(0, pebble);

        // Verify no pebbles are added
        assertEquals(0, inventory.getPebbleCount());
        assertEquals(0, inventory.getPebbles().size());
    }

    @Test
    void testRemovePebble() {
        Pebble pebble = Pebble.GREEN;

        // Add 1 Green pebble
        inventory.addPebbles(1, pebble);

        // Remove the Green pebble
        inventory.removePebble(pebble);

        // Verify the pebble is removed
        assertEquals(0, inventory.getPebbleCount());
        assertFalse(inventory.getPebbles().contains(pebble));
    }

    @Test
    void testRemovePebbleThatDoesNotExist() {
        Pebble pebble = Pebble.YELLOW;

        // Try removing a non-existing Yellow pebble
        inventory.removePebble(pebble);

        // Verify that nothing changes, i.e., no error occurs
        assertEquals(0, inventory.getPebbleCount());
        assertFalse(inventory.getPebbles().contains(pebble));
    }

    @Test
    void testRemovePebbleWithNullInput() {
        // Attempt to remove a null pebble
        inventory.removePebble(null);

        // Verify that no pebbles are removed, no error is thrown
        assertEquals(0, inventory.getPebbleCount());
    }

    @Test
    void testRemovePebbles() {
        // Add multiple pebbles to the inventory
        inventory.addPebbles(3, Pebble.BLUE);
        inventory.addPebbles(2, Pebble.RED);

        // Create a list of pebbles to remove
        ArrayList<Pebble> pebblesToRemove = new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.RED));

        // Remove the Blue and Red pebbles
        inventory.removePebbles(pebblesToRemove);

        // Verify the number of pebbles remaining in inventory
        assertEquals(3, inventory.getPebbleCount());
    }


    @Test
    void testRemovePebblesWithEmptyList() {
        // Add some pebbles
        inventory.addPebbles(3, Pebble.GREEN);

        // Try removing an empty list of pebbles
        inventory.removePebbles(new ArrayList<>());

        // Verify no pebbles are removed
        assertEquals(3, inventory.getPebbleCount());
    }
}

