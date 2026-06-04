package common;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.scene.layout.Pane;

import java.util.*;

import player.Player;
import referee.GameBoard;
import referee.Referee;

public class JavaFXApplication extends Application {

    //    private static Stage primaryStage;
    private BorderPane mainLayout;
    private HBox cardContainer;
    private VBox equationContainer;
    private Player player1;
    private Referee referee;

    // List of cards and equations
    private static List<Card> cards;
    private static List<Equation> equations;

    public static void setToRender(GameBoard gameBoard) {
        cards=gameBoard.visibleCards;
        equations= gameBoard.equations;
    }

    /**
     * called upon launch
     * @param stage
     */
    @Override
    public void start(Stage stage) {

        // Create main layout with buttons
        mainLayout = new BorderPane();

        // Create buttons to switch views
        Button viewCardsButton = new Button("View Cards");
        Button viewEquationsButton = new Button("View Equations");
        Button playerButton = new Button("Player");


        // Create an HBox for the buttons and place it at the top of the BorderPane
        HBox buttonBar = new HBox(10, viewCardsButton, viewEquationsButton, playerButton);
        mainLayout.setTop(buttonBar);

        // init the player and ref
        player1 = new Player("Player 1");
//        referee = new Referee();


        //initialize a starting view
        displayCards();

        Scene scene = new Scene(mainLayout, 1800, 1800);
        stage.setTitle("Card and Equation Viewer");
        stage.setScene(scene);
        stage.show();

        // Set up button event handlers
        viewCardsButton.setOnAction(e -> displayCards());
        viewEquationsButton.setOnAction(e -> displayEquations());
//        playerButton.setOnAction(e -> displayPlayer());

    }


    // we are going to need to refactor this later so that we just switch between scenes rather than
    // creating new panes each time
    private void displayCards() {
        // Create a new HBox to hold the cards side by side
        cardContainer = new HBox(20); // Spacing between cards

        // Populate the card container with the rendered cards
        for (Card card : cards) {
            CardRender cardRender = new CardRender(card);
            Pane cardPane = cardRender.render(); // Render each card into a Pane

            cardContainer.getChildren().add(cardPane);
        }



        // Set the card container as the center of the main layout
        mainLayout.setCenter(cardContainer);
    }

    /**
     * Displays the equation container with 10 equations.
     */
    private void displayEquations() {
        // Create a new VBox to hold the equations in a vertical list
        equationContainer = new VBox(20); // Spacing between equations

        // Populate the equation container with text nodes representing equations
        for (Equation equation : equations) {
            EquationRender equationRender = new EquationRender(equation);
            Pane eqnPane = equationRender.render(); // Render each card into a Pane

            equationContainer.getChildren().add(eqnPane);
        }

        // Set the equation container as the center of the main layout
        mainLayout.setCenter(equationContainer);
    }

////    private void displayPlayer(){
////        // Create a new Hbox that will display counter inputs for the different pebbles
////        HBox playerContainer = new HBox(20); // Spacing between cards
////
////        // make 5 fields that display the number of pebbles of each type from the record in the players inventory
////
////        Inventory playerInventory = player1.getInventory();
////        PebbleCountRecord pebbleCountRecord = playerInventory.getPebbleCountRecord();
////
////
////        // need to make this DRY later
////        // create a text field for each pebble type
////        Text redPebble = new Text("Red Pebbles: " + pebbleCountRecord.redPebbles());
////        Text bluePebble = new Text("Blue Pebbles: " + pebbleCountRecord.bluePebbles());
////        Text greenPebble = new Text("Green Pebbles: " + pebbleCountRecord.greenPebbles());
////        Text yellowPebble = new Text("Yellow Pebbles: " + pebbleCountRecord.yellowPebbles());
////        Text whitePebble = new Text("White Pebbles: " + pebbleCountRecord.whitePebbles());
////
//////        make incremental buttons for each pebble type
////        // not DRY, needs to be refactored
////        Button redButton = new Button("+");
////        redButton.setOnAction(e -> {
////            player1.addPebble(Pebble.RED);
////            PebbleCountRecord rec = playerInventory.getPebbleCountRecord();
////            redPebble.setText("Red Pebbles: " + rec.redPebbles());
////        });
////
////        Button blueButton = new Button("+");
////        blueButton.setOnAction(e -> {
////            player1.addPebble(Pebble.BLUE);
////            PebbleCountRecord rec = playerInventory.getPebbleCountRecord();
////            bluePebble.setText("Blue Pebbles: " + (rec.bluePebbles()));
////        });
////
////        Button greenButton = new Button("+");
////        greenButton.setOnAction(e -> {
////            player1.addPebble(Pebble.GREEN);
////            PebbleCountRecord rec = playerInventory.getPebbleCountRecord();
////            greenPebble.setText("Green Pebbles: " + (rec.greenPebbles()));
////        });
////
////        Button yellowButton = new Button("+");
////        yellowButton.setOnAction(e -> {
////            player1.addPebble(Pebble.YELLOW);
////            PebbleCountRecord rec = playerInventory.getPebbleCountRecord();
////            yellowPebble.setText("Yellow Pebbles: " + (rec.yellowPebbles()));
////        });
////
////        Button whiteButton = new Button("+");
////        whiteButton.setOnAction(e -> {
////            player1.addPebble(Pebble.WHITE);
////            PebbleCountRecord rec = playerInventory.getPebbleCountRecord();
////            whitePebble.setText("White Pebbles: " + (rec.whitePebbles()));
////        });
////
////
////
////
//
//
//
//        // add the text fields to the player container
//        playerContainer.getChildren().addAll(redPebble, redButton, bluePebble, blueButton, greenPebble, greenButton, yellowPebble, yellowButton, whitePebble, whiteButton);
//
//        // Set the player container as the center of the main layout
//        mainLayout.setCenter(playerContainer);
//
//    }

    public static void launchApp(GameBoard gameBoard) {
        setToRender(gameBoard);
        Application.launch(JavaFXApplication.class);
    }
}
