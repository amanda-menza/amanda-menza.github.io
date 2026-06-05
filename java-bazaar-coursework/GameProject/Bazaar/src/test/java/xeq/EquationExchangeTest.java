package xeq;

import org.junit.jupiter.api.Test;


import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static xeq.EquationExchangeMain.main;

public class EquationExchangeTest {

    /**
     * One valid rule output test
     */
    @Test
    public void testEquationExchange0() {
        String parameter = System.getProperty("test.path", "");

        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Three/0-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Three/0-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut.trim(), actualOut.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 2 valid rule outputs, second one uses flipped equation
     */
    @Test
    public void testEquationExchange1() {
        String parameter = System.getProperty("test.path", "");

        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Three/1-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Three/1-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut.trim(), actualOut.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * no valid rules
     */
    @Test
    public void testEquationExchange2() {
        String parameter = System.getProperty("test.path", "");

        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Three/2-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Three/2-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut.trim(), actualOut.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
