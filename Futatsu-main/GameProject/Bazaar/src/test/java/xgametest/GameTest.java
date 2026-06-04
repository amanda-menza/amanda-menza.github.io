package xgametest;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static xgametest.GameTestMain.main;

public class GameTest {
    @Test
    public void testGame0() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/0-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/0-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testGame1() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/1-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);
            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/1-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testGame2() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/2-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/2-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testGame3() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/3-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/3-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testGame4() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/4-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/4-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testGame5() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/5-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/5-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testGame6() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/6-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/6-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testGame7() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/7-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/7-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testGame8() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/8-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/8-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testGame9() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Seven/9-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Seven/9-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
