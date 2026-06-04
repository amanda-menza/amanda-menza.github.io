package xrules;

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
import static xrules.RuleValidationMain.main;

public class RuleValidationTest {
    @Test
    public void testRuleValidation0() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Six/0-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Six/0-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testRuleValidation1() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Six/1-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);
            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Six/1-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    @Test
    public void testRuleValidation2() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Six/2-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Six/2-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut, actualOut);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}