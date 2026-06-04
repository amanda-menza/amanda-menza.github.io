package player.strategy;

import common.Card;
import common.Equation;
import common.Inventory;
import common.Pebble;
import player.PlayerScore;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class PlayerMoveStateTest {

    @Test
    public void testExecuteFunctionalCardPurchase() {
        // Setup
        Inventory playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.GREEN,Pebble.RED, Pebble.BLUE, Pebble.GREEN))); // Mock pebbles
        Inventory bankInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.GREEN))); // Mock pebbles
        ArrayList<Card> availableCards = new ArrayList<>();
        Card cardToPurchase = new Card(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.GREEN,Pebble.RED, Pebble.BLUE)),true); // Mock card
        availableCards.add(cardToPurchase);

        ArrayList<Equation> availableEquations = new ArrayList<>(); // Mock equations
        PlayerScore currentPoints = new PlayerScore(0); // Mock score
        PlayerMoveState state = new PlayerMoveState(
                playerInventory,
                bankInventory,
                availableEquations,
                availableCards,
                new ArrayList<>(),
                new ArrayList<>(),
                currentPoints,
                new ArrayList<>()
        );

        // Action
        PlayerMoveState newState = state.executeFunctionalCardPurchase(cardToPurchase);

        // Assertions
        assertEquals(1, newState.getCardsBought().size());
        assertTrue(newState.getCardsBought().contains(cardToPurchase));
        assertFalse(newState.getAvailableCards().contains(cardToPurchase));
        assertNotEquals(state.getCurrentPlayerInventory(), newState.getCurrentPlayerInventory()); // Should be a new instance
        assertNotEquals(state.getCurrentBankInventory(), newState.getCurrentBankInventory()); // Should be a new instance
    }

    @Test
    public void testExecuteFunctionalEquationPurchase() {
        // Setup
        Inventory playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.RED))); // Mock pebbles
        Inventory bankInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.WHITE, Pebble.WHITE))); // Mock pebbles
        Equation equationToUse = new Equation(new ArrayList<>(Arrays.asList(Pebble.GREEN)), new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.WHITE))); // Mock equation
        ArrayList<Equation> availableEquations = new ArrayList<>();
        availableEquations.add(equationToUse);

        PlayerMoveState state = new PlayerMoveState(
                playerInventory,
                bankInventory,
                availableEquations,
                new ArrayList<>(),
                new ArrayList<>(),
                new ArrayList<>(),
                new PlayerScore(0),
                new ArrayList<>()
        );

        // Action
        PlayerMoveState newState = state.executeFunctionalEquationPurchase(equationToUse);

        // Assertions
        assertEquals(1, newState.getEquationsUsed().size());
        assertTrue(newState.getEquationsUsed().contains(equationToUse));
        assertNotEquals(state.getCurrentPlayerInventory(), newState.getCurrentPlayerInventory()); // Should be a new instance
        assertNotEquals(state.getCurrentBankInventory(), newState.getCurrentBankInventory()); // Should be a new instance
    }
}


