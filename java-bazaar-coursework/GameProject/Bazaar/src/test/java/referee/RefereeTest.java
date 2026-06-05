package referee;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.InjectMocks;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import common.*;
import player.IPlayer;

import java.util.ArrayList;
import java.util.Arrays;

public class RefereeTest {

    @Mock
    private GameStateActionsForRef gameState;

    @Mock
    private IPlayer player1;

    @Mock
    private IPlayer player2;

    @Mock
    private Turn_State turnState;

    @InjectMocks
    private Referee referee;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        referee = new Referee(gameState);
    }

    @Test
    public void testInitGameWithInvalidPlayerCount() {
        ArrayList<IPlayer> players = new ArrayList<>(Arrays.asList(player1));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            referee.addInitialIPlayers(players);
        });

        assertEquals("Invalid number of players", exception.getMessage());
    }

    @Test
    public void testNotifyAddPlayer() {
        referee.notifyAddPlayer(player1);
        verify(gameState, times(1)).addPlayer(player1);
    }

    @Test
    public void testUpdateActivePlayer() {
        referee.updateActivePlayer(player1);
        assertEquals(player1, referee.getActivePlayer());
    }


    @Test
    public void testCanUseEquation() {
        Inventory playerInventory = mock(Inventory.class);
        Inventory bankInventory = mock(Inventory.class);
        Equation equation = mock(Equation.class);
        System.out.println(referee.getActivePlayer());
        referee.setCurrentTurnState(turnState);

        when(player1.getInventory()).thenReturn(playerInventory);
        when(turnState.getBankInventory()).thenReturn(bankInventory);
        when(equation.playerCanUseLeftSide(playerInventory.getPebbles(), bankInventory.getPebbles())).thenReturn(true);

        Boolean result = referee.getRuleBook().canUseEquation(equation, player1.getInventory(),turnState.getBankInventory());

        assertTrue(result);
        verify(equation, times(1)).playerCanUseLeftSide(any(), any());
    }

    @Test
    public void testCanBuyCard() {
        Inventory inventory = mock(Inventory.class);
        Card card = mock(Card.class);

        when(player1.getInventory()).thenReturn(inventory);
        when(card.canBuyCard(inventory.getPebbles())).thenReturn(true);

        Boolean result = referee.getRuleBook().canBuyCard(card, player1.getInventory());

        assertTrue(result);
        verify(card, times(1)).canBuyCard(any());
    }

    @Test
    public void testFilterEqSet() {
        ArrayList<Pebble> playerWallet = new ArrayList<>(Arrays.asList(Pebble.RED, Pebble.GREEN));
        ArrayList<Pebble> bank = new ArrayList<>(Arrays.asList(Pebble.BLUE, Pebble.WHITE));
        Equation equation1 = mock(Equation.class);
        Equation equation2 = mock(Equation.class);
        Equation equation3 = mock(Equation.class);
        ArrayList<Equation> equations = new ArrayList<>(Arrays.asList(equation1, equation2));

        when(equation1.playerCanUseLeftSide(playerWallet, bank)).thenReturn(true);
        when(equation2.playerCanUseLeftSide(playerWallet, bank)).thenReturn(false);
        when(equation1.flipEquation()).thenReturn(equation2);
        when(equation2.flipEquation()).thenReturn(equation3);

        ArrayList<Equation> filteredEquations = referee.getRuleBook().filterEqSet(playerWallet, bank, equations);

        assertEquals(1, filteredEquations.size());
        System.out.println(filteredEquations);

        assertTrue(filteredEquations.contains(equation1));
        assertFalse(filteredEquations.contains(equation2));
    }
}
