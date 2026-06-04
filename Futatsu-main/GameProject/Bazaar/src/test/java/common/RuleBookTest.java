package common;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import player.Player;
import player.PlayerScore;
import player.strategy.Candidate;

public class RuleBookTest {

    private RuleBook ruleBook;

    @BeforeEach
    void setUp() {
        ruleBook = new RuleBook();
    }

    @Test
    void testValidNumberOfPlayers() {
        assertTrue(ruleBook.validNumberOfPlayers(2), "2 players should be valid");
        assertTrue(ruleBook.validNumberOfPlayers(4), "4 players should be valid");
        assertFalse(ruleBook.validNumberOfPlayers(1), "1 player should be invalid");
        assertFalse(ruleBook.validNumberOfPlayers(7), "7 players should be invalid");
    }

    @Test
    void testCanBuyCard() {
        Inventory playerInventory = new Inventory();
        ArrayList<Pebble> pebbles = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE,Pebble.RED, Pebble.BLUE,Pebble.GREEN));
        playerInventory.addPebbles(pebbles);
        Card c1 = new Card(pebbles,true);
        Card c2 = new Card(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE,Pebble.RED, Pebble.GREEN,Pebble.GREEN)),false);
        assertTrue(ruleBook.canBuyCard(c1, playerInventory));
        assertFalse(ruleBook.canBuyCard(c2, playerInventory));
    }

    @Test
    void testCanUseEquation() {
        Inventory playerInventory = new Inventory();
        Inventory bankInventory = new Inventory();
        ArrayList<Pebble> playerPebbles = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> bankPebbles = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW));
        Equation e1 = new Equation(playerPebbles,bankPebbles);
        Equation e2 = new Equation(playerPebbles,playerPebbles);

        playerInventory.addPebbles(playerPebbles);
        bankInventory.addPebbles(bankPebbles);

        assertTrue(ruleBook.canUseEquation(e1, playerInventory, bankInventory));
        assertFalse(ruleBook.canUseEquation(e2, playerInventory, bankInventory));
    }

     @Test
     void testIsValidTurn() {
         // Setup initial inventories
         Inventory playerInv = new Inventory();
         playerInv.addPebbles(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE)));
         Player p = new Player("",0,playerInv);
         Inventory bankInv = new Inventory();
         bankInv.addPebbles(new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW,Pebble.GREEN, Pebble.YELLOW)));

         Equation e1 = new Equation(new ArrayList<>(Arrays.asList(Pebble.RED)),new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW,Pebble.YELLOW,Pebble.GREEN)));
         Card c1 = new Card(new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.YELLOW,Pebble.YELLOW, Pebble.GREEN,Pebble.GREEN)),false);

         Turn_State turnState = new Turn_State(bankInv,p,new ArrayList<>(),new ArrayList<>(Arrays.asList(c1)));

         Candidate candidate = new Candidate(new ArrayList<>(Arrays.asList(e1)),new ArrayList<>(Arrays.asList(c1)),5,new ArrayList<>(),1,1);

         assertTrue(ruleBook.isValidTurn(candidate, turnState, false));
     }

    @Test
    void testInvalidTurnTooManyEquations() {
        Inventory playerInv = new Inventory();
        playerInv.addPebbles(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE)));
        Player p = new Player("",0,playerInv);
        Inventory bankInv = new Inventory();
        bankInv.addPebbles(new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW,Pebble.GREEN, Pebble.YELLOW)));

        Equation e1 = new Equation(new ArrayList<>(Arrays.asList(Pebble.RED)),new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.YELLOW,Pebble.YELLOW,Pebble.GREEN)));
        Card c1 = new Card(new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.YELLOW,Pebble.YELLOW, Pebble.GREEN,Pebble.GREEN)),false);

        Turn_State turnState = new Turn_State(bankInv,p,new ArrayList<>(),new ArrayList<>(Arrays.asList(c1)));

        Candidate candidate = new Candidate(new ArrayList<>(Arrays.asList(e1,e1,e1,e1,e1)),new ArrayList<>(Arrays.asList(c1)),5,new ArrayList<>(),1,1);

        assertFalse(ruleBook.isValidTurn(candidate, turnState, false));
    }
}