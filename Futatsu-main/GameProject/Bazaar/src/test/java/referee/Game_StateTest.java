package referee;

import common.Inventory;
import common.Pebble;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import player.IPlayer;
import player.Player;

import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class Game_StateTest {
    private Game_State gameState;
    private IPlayer player1;
    private IPlayer player2;
    private Referee referee;


    @BeforeEach
    public void setUp() {

        player1=new Player("p1",6,new Inventory(new ArrayList<Pebble>(Arrays.asList(Pebble.BLUE,Pebble.RED,Pebble.GREEN))));

        player2=new Player("p2",5,new Inventory(new ArrayList<Pebble>(Arrays.asList(Pebble.BLUE,Pebble.GREEN))));

        gameState=new Game_State();
        referee = new Referee(gameState);
        ArrayList<IPlayer>players=new ArrayList<>(Arrays.asList(player1,player2));
        gameState.setReferee(referee);
        referee.addInitialIPlayers(players);
    }

    @Test
    public void testInitialStateIsSetup() {
        assertEquals(Game_State.State.SETUP, gameState.getCurrentState());
    }


    @Test
    public void testStateTransitions() {

        Game_State.State state1 = gameState.getCurrentState();
        Game_State.State state2 = state1.nextState();
        Game_State.State state3 = state2.nextState();
        Game_State.State state4 = state3.nextState();
        Game_State.State state5 = state4.nextState();
        Game_State.State state6 = state5.nextState();
        Game_State.State state7 = state6.nextState();


        assertEquals(Game_State.State.SETUP, state1);
        assertEquals(Game_State.State.FIRST_REQUEST, state2);
        assertEquals(Game_State.State.SECOND_REQUEST, state3);

        assertEquals(Game_State.State.EVALUATE_MOVE, state4);
        assertEquals(Game_State.State.EXECUTE_MOVE, state5);
        assertEquals(Game_State.State.NEXT_PLAYER_TURN, state6);
        assertEquals(Game_State.State.FIRST_REQUEST, state7);


    }

    @Test
    public void testSetupGame() {

        assertNotNull(gameState.getGameBoard());
        assertNotNull(gameState.getPlayerRank());
        assertNotNull(gameState.getBankInventory());
    }

    @Test
    public void testNotifyGetPlayerMove() {
        gameState.setInitialActivePlayer();
        gameState.updateActivePlayerTurn();

        assertEquals(gameState.getActivePlayerIndex(), 1);
        assertTrue(gameState.getActivePlayer().equals(player2));
    }


    @Test
    public void testGameOverTransition() {
        gameState.endGame();

        assertEquals(Game_State.State.GAME_OVER, gameState.getCurrentState());
    }

}