package player.strategy;

import static common.Card.initializeNonRandomCard;
import static org.junit.jupiter.api.Assertions.*;

import common.Card;
import common.Equation;
import common.Pebble;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;

public class TieBreakerTest {

    private ArrayList<Candidate> candidates;
    ArrayList<Pebble> leftSide1 = new ArrayList<>(Arrays.asList(Pebble.RED));
    ArrayList<Pebble> rightSide1 = new ArrayList<>(Arrays.asList(Pebble.BLUE));

    ArrayList<Pebble> leftSide2 = new ArrayList<>(Arrays.asList(Pebble.BLUE));
    ArrayList<Pebble> rightSide2 = new ArrayList<>(Arrays.asList(Pebble.RED));

    Equation eq1 = new Equation(leftSide1, rightSide1);
    Equation eq2 = new Equation(leftSide2, rightSide2);
    Card card1 = initializeNonRandomCard(new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE,Pebble.BLUE,Pebble.BLUE,Pebble.GREEN)),true);
    Card card2 = initializeNonRandomCard(new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.BLUE,Pebble.YELLOW,Pebble.GREEN,Pebble.GREEN)),true);
    Card card3 = initializeNonRandomCard(new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.WHITE, Pebble.RED, Pebble.RED, Pebble.BLUE)),true);

    ArrayList<Card> cardList1 = new ArrayList<>(Arrays.asList(card1, card2));
    ArrayList<Card> cardList2 = new ArrayList<>(Arrays.asList(card2, card1));
    ArrayList<Card> cardList3 = new ArrayList<>(Arrays.asList(card2));

    ArrayList<Equation> equationList1 = new ArrayList<>(Arrays.asList(eq1,eq2));
    ArrayList<Equation> equationList2 = new ArrayList<>(Arrays.asList(eq2,eq1));
    ArrayList<Equation> equationList3 = new ArrayList<>(Arrays.asList(eq1));

    ArrayList<Pebble> inventoryList1 = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE,Pebble.BLUE,Pebble.BLUE,Pebble.GREEN));
    ArrayList<Pebble> inventoryList2 = new ArrayList<>(Arrays.asList(Pebble.GREEN, Pebble.BLUE,Pebble.YELLOW,Pebble.GREEN));
    ArrayList<Pebble> inventoryList3 = new ArrayList<>(Arrays.asList(Pebble.WHITE, Pebble.WHITE, Pebble.RED, Pebble.RED, Pebble.BLUE, Pebble.WHITE));

    Candidate candidate1= new Candidate(equationList1, cardList1, 3, inventoryList2, 2,2);
    Candidate candidate2= new Candidate(equationList3, cardList1, 3, inventoryList2, 1,2);
    Candidate candidate3= new Candidate(equationList1, cardList3, 3, inventoryList2, 1,1);
    Candidate candidate4= new Candidate(equationList1, cardList3, 5, inventoryList2, 1,1);//overall best candidate
    Candidate candidate5= new Candidate(equationList1, cardList3, 5, inventoryList1, 1,1);//overall best candidate
    Candidate candidate6= new Candidate(equationList1, cardList3, 5, inventoryList3, 1,1);//overall best candidate
    Candidate candidate7= new Candidate(equationList1, cardList2, 3, inventoryList2, 2,2);
    Candidate candidate8= new Candidate(equationList2, cardList1, 3, inventoryList2, 2,2);
    Candidate candidate9= new Candidate(new ArrayList<Equation>(), cardList1, 3, inventoryList2, 2,2);



    @Test
    public void testCardPurchaseTieBreaker1() {
        candidates = new ArrayList<>(Arrays.asList(candidate1,candidate3));
        ArrayList<Candidate> result = TieBreaker.cardPurchaseTieBreaker(candidates);

        // Example assertion, modify based on expected outcome
        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Verify that the candidate with max points is in the result
        assertTrue(result.get(0) == candidate1);
    }

    @Test
    public void testExchangeAndPurchaseTieBreaker1() {
        candidates = new ArrayList<>(Arrays.asList(candidate1,candidate2));
        ArrayList<Candidate> result = TieBreaker.exchangeAndPurchaseTieBreaker(candidates);

        // Example assertion
        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Verify that the result meets the expected condition, such as having smallest number of trades
        assertTrue(result.get(0) == candidate2);
    }

    @Test
    public void testExchangeAndPurchaseTieBreaker2() {
        candidates = new ArrayList<>(Arrays.asList(candidate9,candidate8));
        ArrayList<Candidate> result = TieBreaker.exchangeAndPurchaseTieBreaker(candidates);

        // Example assertion
        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Verify that the result meets the expected condition, such as having smallest number of trades
        assertTrue(result.get(0) == candidate9);
    }

    @Test
    public void testMaxPointTieBreakHelper() {
        candidates = new ArrayList<>(Arrays.asList(candidate3,candidate4));
        ArrayList<Candidate> result = TieBreaker.maxPointTieBreakHelper(candidates);

        assertNotNull(result);
        System.out.println(result.size());
        System.out.println(result.get(0).getTotalPoints());

        assertTrue(result.size() == 1);
        assertTrue(result.get(0)==candidate4);
    }

    @Test
    public void testMaxRemainingInventoryTieBreakHelper() {
        candidates = new ArrayList<>(Arrays.asList(candidate5,candidate4));
        ArrayList<Candidate> result = TieBreaker.maxRemainingInventoryTieBreakHelper(candidates);

        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Example assertion, modify based on expected condition
        assertTrue(result.get(0)==candidate5);
    }

    @Test
    public void testSmallestInventoryTieBreakHelper() {
        candidates = new ArrayList<>(Arrays.asList(candidate5,candidate6));

        ArrayList<Candidate> result = TieBreaker.smallestInventoryTieBreakHelper(candidates);

        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Check if the smallest inventory size candidate is at the front
        assertTrue(result.get(0)==candidate5);
    }

    @Test
    public void testSmallestCardListTieBreakHelper() {

        candidates = new ArrayList<>(Arrays.asList(candidate7,candidate1));

        ArrayList<Candidate> result = TieBreaker.smallestCardListTieBreakHelper(candidates);

        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Example assertion, modify based on expected condition
        assertTrue(result.get(0)==candidate1);
    }

    @Test
    public void testSmallestNumberOfExchangesTieBreakHelper() {
        candidates = new ArrayList<>(Arrays.asList(candidate1,candidate2));
        ArrayList<Candidate> result = TieBreaker.smallestNumberOfExchangesTieBreakHelper(candidates);

        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Verify smallest number of exchanges
        assertTrue(result.get(0)==candidate2);
    }

    @Test
    public void testSmallestEquationListTieBreakHelper() {
        candidates = new ArrayList<>(Arrays.asList(candidate1,candidate8));
        ArrayList<Candidate> result = TieBreaker.smallestEquationListTieBreakHelper(candidates);

        assertNotNull(result);
        assertTrue(result.size() == 1);
        // Check if the smallest equation list is at the front
        System.out.println(result.get(0).getEquationsUsed().get(0));

        assertTrue(result.get(0)==candidate8);
    }
}

