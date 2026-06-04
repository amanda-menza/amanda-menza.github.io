package player.strategy;

import common.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import player.PlayerScore;
import player.strategy.MaxScoreStrategy;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class MaxScoreStrategyTest {

    private Inventory playerInventory;
    private Inventory bankInventory;
    private ArrayList<Equation> equations;
    private ArrayList<Card> cards;
    private MaxScoreStrategy maxScoreStrategy;

    @BeforeEach
    void setUp() {
        // Set up player inventory and bank inventory with sample pebbles
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.WHITE)));
        bankInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.YELLOW, Pebble.WHITE, Pebble.BLUE, Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.WHITE, Pebble.BLUE,Pebble.BLUE,Pebble.RED,Pebble.RED)));

        // Initialize some example equations
        equations = new ArrayList<>();
        equations.add(new Equation(new ArrayList<>(Arrays.asList(Pebble.WHITE)), new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.YELLOW))));
        equations.add(new Equation(new ArrayList<>(Arrays.asList(Pebble.GREEN)), new ArrayList<>(Arrays.asList(Pebble.WHITE))));
        equations.add(new Equation(new ArrayList<>(Arrays.asList(Pebble.BLUE,Pebble.BLUE,Pebble.RED,Pebble.RED)), new ArrayList<>(Arrays.asList(Pebble.YELLOW))));


        // Initialize some example cards
        cards = new ArrayList<>();
        ArrayList<Pebble> card1Pebbles = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.GREEN, Pebble.YELLOW, Pebble.BLUE, Pebble.BLUE));
        ArrayList<Pebble> card2Pebbles = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.BLUE, Pebble.BLUE, Pebble.RED, Pebble.RED));
        cards.add(Card.initializeNonRandomCard(card1Pebbles, true));
        cards.add(Card.initializeNonRandomCard(card2Pebbles, false));

        // Create the MaxScoreStrategy instance
        maxScoreStrategy = new MaxScoreStrategy(equations);
        maxScoreStrategy.updateStrategy(playerInventory, cards, bankInventory);
    }

    @Test
    void testBestCandidateCalculation1() {
        Optional<Candidate> bestCandidateOptional = maxScoreStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();
        //System.out.println(bestCandidate);

        // Verify the best candidate's score and inventory
        int expectedScore = 8;
        assertEquals(expectedScore, bestCandidate.getTotalPoints(), "The best candidate should have the correct score");

        // Verify that the best candidate has the expected number of trades and card purchases
        int expectedTradesUsed = 1;
        int expectedCardsPurchased = 1;
        assertEquals(expectedTradesUsed, bestCandidate.getNumberOfTrades(), "Trades used should match expected value");
        assertEquals(expectedCardsPurchased, bestCandidate.getNumberOfCards(), "Cards purchased should match expected value");
    }

    @Test
    void testBestCandidateCalculationWithNoTrades() {
        // Set up player with enough resources to not need any trades
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED, Pebble.BLUE, Pebble.GREEN, Pebble.BLUE, Pebble.YELLOW)));
        maxScoreStrategy = new MaxScoreStrategy(equations);
        maxScoreStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxScoreStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();
        //System.out.println(bestCandidate);

        // Verify that no trades are needed
        assertEquals(0, bestCandidate.getNumberOfTrades(), "No trades should be used when the player has enough pebbles");

        // Verify the expected score
        int expectedScore = 5; // Based on current inventory, the player can purchase cards directly
        assertEquals(expectedScore, bestCandidate.getTotalPoints(), "The best candidate should have the correct score without trades");
    }

    @Test
    void testBestCandidateCalculationWithMultipleCardPurchases() {
        // Set up player inventory with more pebbles to buy more cards
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED, Pebble.GREEN, Pebble.GREEN, Pebble.BLUE, Pebble.BLUE, Pebble.YELLOW,Pebble.GREEN, Pebble.BLUE, Pebble.BLUE, Pebble.RED, Pebble.RED)));
        maxScoreStrategy = new MaxScoreStrategy(equations);
        maxScoreStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxScoreStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();
        System.out.println(bestCandidate);

        // Verify the best candidate's score and the number of cards purchased
        int expectedScore = 4; // The score may increase with more cards purchased
        assertEquals(expectedScore, bestCandidate.getTotalPoints(), "The best candidate should have the correct score with multiple cards purchased");
        assertEquals(0, bestCandidate.getNumberOfTrades());
        int expectedCardsPurchased = 2; // Assuming the player can buy two cards
        assertEquals(expectedCardsPurchased, bestCandidate.getNumberOfCards(), "The best candidate should have purchased the expected number of cards");
    }

    @Test
    void testBestCandidateCalculationWithMultipleTrades() {
        // Set up player inventory where trades are necessary
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.WHITE)));
        maxScoreStrategy = new MaxScoreStrategy(equations);
        maxScoreStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxScoreStrategy.getBestCandidate(false);
        Candidate bestCandidate = bestCandidateOptional.get();
        System.out.println(bestCandidate);

        // Verify the best candidate's score and the number of trades
        int expectedScore = 3; // Based on the inventory and equations, this is the score
        assertEquals(expectedScore, bestCandidate.getTotalPoints(), "The best candidate should have the correct score with trades");

//        int expectedTradesUsed = 2; // One trade is expected to exchange resources for additional pebbles
//        assertEquals(expectedTradesUsed, bestCandidate.getNumberOfTrades(), "The best candidate should have used the correct number of trades");
    }

    @Test
    void testBestCandidateCalculationWithNoCardsAvailable() {
        // Set up player inventory with no useful pebbles and no cards
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.RED)));
        cards.clear(); // No cards available to purchase

        maxScoreStrategy = new MaxScoreStrategy(equations);
        maxScoreStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxScoreStrategy.getBestCandidate(false);

        // Verify that no candidate is found due to lack of cards
        assertTrue(bestCandidateOptional.isEmpty(), "If no cards are available, no candidate should be found");
    }

    @Test
    void testBestCandidateCalculationWithInsufficientPebbles() {
        // Set up player inventory with not enough pebbles to make a trade
        playerInventory = new Inventory(new ArrayList<>(Arrays.asList(Pebble.RED)));
        maxScoreStrategy = new MaxScoreStrategy(equations);
        maxScoreStrategy.updateStrategy(playerInventory, cards, bankInventory);
        // Get the best candidate
        Optional<Candidate> bestCandidateOptional = maxScoreStrategy.getBestCandidate(false);
        assertTrue(bestCandidateOptional.isEmpty(), "If no cards are available, no candidate should be found");
    }
}
