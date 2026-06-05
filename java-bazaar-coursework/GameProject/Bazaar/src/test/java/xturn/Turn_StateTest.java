package xturn;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static xturn.Turn_StateMain.main;



import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static referee.Game_State.initializeGameWithSTDIN;
import static utils.BankUtils.convertToBank;
import static utils.CardUtils.convertToCardList;
import static utils.player_utils.PlayerUtils.convertToPlayerList;

public class Turn_StateTest {


    @Test
    public void testTurnState0() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Four/0-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Four/0-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut.trim(), actualOut.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Test
    public void testTurnState1() {
        String parameter = System.getProperty("test.path", "");
        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Four/1-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Four/1-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut.trim(), actualOut.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Test
    public void testTurnState2() {
        String parameter = System.getProperty("test.path", "");

        try {
            System.setIn(new FileInputStream(parameter+"src/test/java/jTests/Four/2-in.txt"));
            ByteArrayOutputStream testOut = new ByteArrayOutputStream();
            PrintStream testPrintStream = new PrintStream(testOut);
            System.setOut(testPrintStream);
            main(new String[0]);

            String actualOut = testOut.toString();
            Path filePath = Paths.get(parameter+"src/test/java/jTests/Four/2-out.txt");
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);

            String expectedOut = String.join("\n", lines);
            assertEquals(expectedOut.trim(), actualOut.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}