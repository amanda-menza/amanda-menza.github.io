package common;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PebbleTest {
    /**
     * Test the basic properties of the enum
     */
    @Test
    public void testEnumValues() {
        // Test that the enum contains the expected number of constants
        Pebble[] pebbles = Pebble.values();
        assertEquals(5, pebbles.length, "Pebble enum should have exactly 5 constants");

        // Test that the enum constants have the expected names
        assertEquals(Pebble.RED, Pebble.valueOf("RED"));
        assertEquals(Pebble.BLUE, Pebble.valueOf("BLUE"));
        assertEquals(Pebble.GREEN, Pebble.valueOf("GREEN"));
        assertEquals(Pebble.YELLOW, Pebble.valueOf("YELLOW"));
        assertEquals(Pebble.WHITE, Pebble.valueOf("WHITE"));
    }


}
