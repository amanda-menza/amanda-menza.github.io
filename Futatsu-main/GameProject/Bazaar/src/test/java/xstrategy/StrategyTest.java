package xstrategy;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import utils.RandomUtil;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static xstrategy.StrategyMain.main;

public class StrategyTest {
    @Test
    public void testStrategy0() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Five/0-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Five/0-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testStrategy1() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Five/1-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);
            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Five/1-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testStrategy2() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Five/2-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Five/2-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testStrategy3() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Five/3-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Five/3-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
