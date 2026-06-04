import common.*;
import player.IPlayer;
import player.Player;
import referee.*;

import java.util.ArrayList;

public class main {
    public static void main(String[] args) {
        Card myCard = new Card();
        //myCard.displayCard();

        System.out.println(myCard);

        Equation myEquation = new Equation();

        System.out.println(myEquation);
        GameBoard game= new GameBoard();
//        JavaFXApplication.launchApp(game);


        // Create the GameState instance first
        Game_State gameState = new Game_State();

        // Now pass the GameState instance to the Referee
        Referee referee = new Referee(gameState);
        Referee refereeForView = new Referee(gameState);

        gameState.setReferee(referee);
        IPlayer player1=new Player("Player1");
        IPlayer player2=new Player("Player2");
        ArrayList<IPlayer> players=new ArrayList<>();
        players.add(player1);
        players.add(player2);

        // Launch the game view for visual rendering of turn state for player
        //GameView.launchApp(game,player1,refereeForView);
        //RefView.launchApp(game,player1,refereeForView);

        // Start the game using the referee
        referee.addInitialIPlayers(players);
        //referee.initGame(players);



       // myEquation.displayEqn();


    }
}
