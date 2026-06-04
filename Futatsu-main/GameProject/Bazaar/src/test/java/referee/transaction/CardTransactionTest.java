package referee.transaction;

import common.Card;
import common.Inventory;
import common.Pebble;
import common.transaction.CardTransaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import player.PlayerScore;
import player.strategy.AwardPoints;

import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class CardTransactionTest {
    private Card card;
    private Inventory playerInventory;
    private Inventory bankInventory;
    private PlayerScore playerScore;
    private ArrayList<Card> playerCards;

    @BeforeEach
    void setUp() {
        ArrayList<Pebble> cardPebbles = new ArrayList<>();
        cardPebbles.add(Pebble.RED);
        cardPebbles.add(Pebble.BLUE);
        cardPebbles.add(Pebble.YELLOW);
        cardPebbles.add(Pebble.BLUE);
        cardPebbles.add(Pebble.GREEN);
        card = new Card(cardPebbles, false);

        ArrayList<Pebble> playerPebbles = new ArrayList<>(cardPebbles);
        playerInventory = new Inventory(playerPebbles);

        ArrayList<Pebble> bankPebbles = new ArrayList<>();
        bankPebbles.add(Pebble.GREEN);
        bankPebbles.add(Pebble.YELLOW);
        bankInventory = new Inventory(bankPebbles);

        playerScore = new PlayerScore(0);
        playerCards = new ArrayList<>();
    }

    @Test
    void testExecuteSuccess() {
        CardTransaction transaction = new CardTransaction(card, playerInventory, bankInventory, playerCards, playerScore,new ArrayList<>(Arrays.asList(card)));

        assertTrue(transaction.execute());
        assertTrue(playerCards.contains(card));
        assertEquals(0, playerInventory.getPebbleCount());
        assertEquals(7, bankInventory.getPebbleCount());
        assertEquals(AwardPoints.calculatePoints(playerInventory, card), playerScore.getScore());
    }

    @Test
    void testExecuteFailure() {
        playerInventory = new Inventory(); // Empty inventory
        CardTransaction transaction = new CardTransaction(card, playerInventory, bankInventory, playerCards, playerScore,new ArrayList<>(Arrays.asList(card)));

        assertFalse(transaction.execute());
        assertFalse(playerCards.contains(card));
        assertEquals(0, playerInventory.getPebbleCount());
        assertEquals(2, bankInventory.getPebbleCount());
        assertEquals(0, playerScore.getScore());
    }

    @Test
    void testUndoExecuteSuccess() {
        CardTransaction transaction = new CardTransaction(card, playerInventory, bankInventory, playerCards, playerScore,new ArrayList<>());
        transaction.execute(); // Execute the transaction first

        assertTrue(transaction.undoExecute());
        assertFalse(playerCards.contains(card));
        assertEquals(5, playerInventory.getPebbleCount());
        assertEquals(2, bankInventory.getPebbleCount());
        assertEquals(0, playerScore.getScore());
    }

    @Test
    void testUndoExecuteFailure() {
        CardTransaction transaction = new CardTransaction(card, playerInventory, bankInventory, playerCards, playerScore,new ArrayList<>());

        assertFalse(transaction.undoExecute());
        assertFalse(playerCards.contains(card));
        assertEquals(5, playerInventory.getPebbleCount());
        assertEquals(2, bankInventory.getPebbleCount());
        assertEquals(0, playerScore.getScore());
    }
}
