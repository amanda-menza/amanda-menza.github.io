package referee.transaction;

import common.Equation;
import common.Inventory;
import common.Pebble;
import common.transaction.EquationTransaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EquationTransactionTest {

    private Inventory sender;
    private Inventory receiver;

    @BeforeEach
    void setUp() {
        // Mocking Inventory objects
        sender = mock(Inventory.class);
        receiver = mock(Inventory.class);
    }

    @Test
    void testExecuteSuccess() {
        // Arrange
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Collections.singletonList(Pebble.GREEN));

        Equation eq = new Equation(leftSide, rightSide);

        // Setting up sender inventory to have leftSide pebbles
        when(sender.getPebbles()).thenReturn(new ArrayList<>(leftSide));
        // Setting up receiver inventory to have rightSide pebbles
        when(receiver.getPebbles()).thenReturn(new ArrayList<>(rightSide));

        // Creating EquationTransaction with sender, receiver, and equation
        EquationTransaction transaction = new EquationTransaction(eq, sender, receiver);

        // Act
        boolean result = transaction.execute();

        // Assert
        assertTrue(result, "The transaction should be successful");
        verify(sender).removePebbles(leftSide);
        verify(receiver).addPebbles(leftSide);
        verify(receiver).removePebbles(rightSide);
        verify(sender).addPebbles(rightSide);
    }

    @Test
    void testExecuteFailureDueToSenderPebbles() {
        // Arrange
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Collections.singletonList(Pebble.GREEN));

        Equation eq = new Equation(leftSide, rightSide);

        // Setting up sender inventory without necessary leftSide pebbles
        when(sender.getPebbles()).thenReturn(new ArrayList<>(Collections.singletonList(Pebble.YELLOW)));
        // Setting up receiver inventory with rightSide pebbles
        when(receiver.getPebbles()).thenReturn(new ArrayList<>(rightSide));

        EquationTransaction transaction = new EquationTransaction(eq, sender, receiver);

        // Act
        boolean result = transaction.execute();

        // Assert
        assertFalse(result, "The transaction should fail due to sender missing required pebbles");
        verify(sender, never()).removePebbles(leftSide);
        verify(receiver, never()).addPebbles(leftSide);
    }

    @Test
    void testExecuteFailureDueToReceiverPebbles() {
        // Arrange
        ArrayList<Pebble> leftSide = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.BLUE));
        ArrayList<Pebble> rightSide = new ArrayList<>(Collections.singletonList(Pebble.GREEN));

        Equation eq = new Equation(leftSide, rightSide);

        // Setting up sender inventory to have leftSide pebbles
        when(sender.getPebbles()).thenReturn(new ArrayList<>(leftSide));
        // Setting up receiver inventory without rightSide pebbles
        when(receiver.getPebbles()).thenReturn(new ArrayList<>(Collections.singletonList(Pebble.YELLOW)));

        EquationTransaction transaction = new EquationTransaction(eq, sender, receiver);

        // Act
        boolean result = transaction.execute();

        // Assert
        assertFalse(result, "The transaction should fail due to receiver missing required pebbles");
        verify(sender, never()).removePebbles(leftSide);
        verify(receiver, never()).addPebbles(leftSide);
    }

    @Test
    void testExecuteWithEmptyEquation() {
        // Arrange
        ArrayList<Pebble> emptyList = new ArrayList<>();
        Equation eq = new Equation(emptyList, emptyList);

        // Setting up sender and receiver inventories with any pebbles
        when(sender.getPebbles()).thenReturn(new ArrayList<>(Collections.singletonList(Pebble.RED)));
        when(receiver.getPebbles()).thenReturn(new ArrayList<>(Collections.singletonList(Pebble.GREEN)));

        EquationTransaction transaction = new EquationTransaction(eq, sender, receiver);

        // Act
        boolean result = transaction.execute();

        // Assert
        assertTrue(result, "The transaction should succeed for an empty equation");
    }
}

