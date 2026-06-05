package player.strategy;

import common.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import player.PlayerScore;
import player.strategy.MaxNumCardsStrategy;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class MaxNumCardsStrategyTest {

    private Inventory playerInventory;
    private Inventory bankInventory;
    private ArrayList<Equation> equations;
    private ArrayList<Card> cards;
    private MaxNumCardsStrategy maxNumCardsStrategy;

    @BeforeEach
    void setUp() {
        // Set up player inventory and bank inventory with sample pebbles
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.WHITE)));
        bankInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.YELLOW, Pebble.WHITE, Pebble.BLUE,Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.WHITE,Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.WHITE)));

        // Initialize some example equations
        equations = new ArrayList<>();
        equations.add(new Equation(new ArrayList<>(Arrays.asList(Pebble.WHITE)), new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.YELLOW))));
        equations.add(new Equation(new ArrayList<>(Arrays.asList(Pebble.GREEN)), new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.YELLOW, Pebble.BLUE, Pebble.BLUE))));

        // Initialize some example cards
        cards = new ArrayList<>();
        ArrayList<Pebble> card1Pebbles = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.GREEN, Pebble.YELLOW, Pebble.BLUE, Pebble.BLUE));
        ArrayList<Pebble> card2Pebbles = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.BLUE, Pebble.BLUE, Pebble.RED, Pebble.RED));
        cards.add(Card.initializeNonRandomCard(card1Pebbles, true));
        cards.add(Card.initializeNonRandomCard(card2Pebbles, false));

        // Create the MaxNumCardsStrategy instance
        maxNumCardsStrategy = new MaxNumCardsStrategy(equations);
        maxNumCardsStrategy.updateStrategy(playerInventory, cards, bankInventory);    }

    @Test
    void testMaxCardsStrategyWithEnoughPebbles() {
        // Player has enough pebbles to buy multiple cards
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED, Pebble.GREEN, Pebble.BLUE,Pebble.BLUE, Pebble.YELLOW,Pebble.RED, Pebble.GREEN, Pebble.YELLOW, Pebble.BLUE, Pebble.BLUE)));
        maxNumCardsStrategy = new MaxNumCardsStrategy(equations);
        maxNumCardsStrategy.updateStrategy(playerInventory, cards, bankInventory);

        // Get the best candidate based on max cards
        Optional<Candidate> bestCandidateOptional = maxNumCardsStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();

        // Verify that the best candidate purchased 2 cards (maximizing number of cards)
        int expectedCardsPurchased = 2;
        assertEquals(0, bestCandidate.getNumberOfTrades());
        assertEquals(expectedCardsPurchased, bestCandidate.getNumberOfCards(), "The best candidate should purchase the maximum number of cards");
    }

    @Test
    void testMaxCardsStrategyWithLimitedPebbles() {
        // Player has limited pebbles, enough for only one card
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.GREEN, Pebble.GREEN)));
        maxNumCardsStrategy = new MaxNumCardsStrategy(equations);
        maxNumCardsStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate based on max cards
        Optional<Candidate> bestCandidateOptional = maxNumCardsStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();

        // Verify that the best candidate purchased 1 card (maximizing number of cards with limited pebbles)
        int expectedCardsPurchased = 1;
        assertEquals(expectedCardsPurchased, bestCandidate.getNumberOfCards(), "The best candidate should purchase the maximum number of cards with the limited pebbles");
    }

    @Test
    void testMaxCardsStrategyWithNoCardsAvailable() {
        // Set up player inventory with no useful pebbles and no cards
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED)));
        cards.clear(); // No cards available to purchase

        maxNumCardsStrategy = new MaxNumCardsStrategy(equations);
        maxNumCardsStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxNumCardsStrategy.getBestCandidate(false);

        // Verify that no candidate is found due to lack of cards
        assertTrue(bestCandidateOptional.isEmpty(), "If no cards are available, no candidate should be found");
    }

    @Test
    void testMaxCardsStrategyWithNoPebbles() {
        // Set up player inventory with no pebbles
        playerInventory = new Inventory(new ArrayList<>());
        maxNumCardsStrategy = new MaxNumCardsStrategy(equations);
        maxNumCardsStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxNumCardsStrategy.getBestCandidate(false);

        // Verify that no cards are purchased since there are no pebbles
        assertTrue(bestCandidateOptional.isEmpty(), "No cards should be purchased if the player has no pebbles");
    }

    @Test
    void testMaxCardsStrategyWithMultipleTrades() {
        // Set up player inventory where trades are necessary to maximize cards
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.GREEN, Pebble.GREEN)));
        maxNumCardsStrategy = new MaxNumCardsStrategy(equations);
        maxNumCardsStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxNumCardsStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();

        // Verify the best candidate's number of cards and trades
        int expectedCardsPurchased = 1; // Based on the inventory and cards available, 1 card can be purchased
        int expectedTradesUsed = 1; // Assuming the strategy will trade pebbles to maximize card number
        assertEquals(expectedCardsPurchased, bestCandidate.getNumberOfCards(), "The best candidate should purchase the maximum number of cards");
        assertEquals(expectedTradesUsed, bestCandidate.getNumberOfTrades(), "The best candidate should have used 1 trade to maximize the number of cards");
    }
}

