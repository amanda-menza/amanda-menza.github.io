package renderables;

import common.*;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import player.Player;
import referee.GameBoard;
import referee.Referee;

import java.util.List;
import java.util.Map;

public class GameView extends Application {

    public static final int BACKGROUND_WIDTH = 1200;
    public static final int BACKGROUND_HEIGHT = 800;
    public static final String BACKGROUND_PATH = "/media/background.png";
    public static final String STAGE_TITLE = "Bazzaar";
    private static final int SCENE_WIDTH = 1200;
    private static final int SCENE_HEIGHT = 800;
    private static final int POINTS_FOR_CARD = 5;

    private BorderPane mainLayout;
    private EquationsComponent equationsComponent;
    private CardsComponent cardsComponent;
    private PlayerStatusComponent playerStatusComponent;
    private static List<Card> cards;
    private static List<Equation> equations;
    private static Player player;
    private static Referee referee;

    public static void setToRender(GameBoard gameBoard, Player currentPlayer, Referee gameReferee) {
        cards = gameBoard.visibleCards;
        equations = gameBoard.equations;
        player = currentPlayer;
        referee = gameReferee;
    }

    /**
     * Update the game state
     * just filters for now
     */
    private void updateGameState() {
        // Update what the player can use in terms of equations and cards
        // this will need to be refactored out of this class
        for (Equation equation : equations) {
            //equation.setCanBeUsedByActivePlayer(referee.canUseEquationSimple(equation, player));
        }

        for (Card card : cards) {
            card.setCanBeBoughtByActivePlayer(referee.getRuleBook().canBuyCard(card, player.getInventory()));
        }


        // Update all components
        equationsComponent.updateEquations(equations);
        cardsComponent.updateCards(cards);
        Map<Pebble, Integer> pebbleCounts = player.getInventory().getPebbleCounts();
        playerStatusComponent.updateStatus(player.getName(), player.getScore(), pebbleCounts);
    }


    /**
     * Handle card click event
     * @param card
     */
    private void handleCardClick(Card card) {
        if (card.getCanBeBoughtByActivePlayer()) {
            // Remove the card from the game board
            cards.remove(card);
            // Award points to the player
            player.updateScore(POINTS_FOR_CARD);
            // Update the display
            updateGameState();
        }
    }

    /**
     * Start the game view
     * @param stage
     */
    @Override
    public void start(Stage stage) {
        // Create a StackPane to layer the background and content
        StackPane root = new StackPane();

        // Load background image from resources
        Image backgroundImage = new Image(getClass().getResourceAsStream(BACKGROUND_PATH));
        ImageView background = new ImageView(backgroundImage);

        // Make background image fill the window
        background.setFitWidth(BACKGROUND_WIDTH);
        background.setFitHeight(BACKGROUND_HEIGHT);
        background.setPreserveRatio(true);

        // Initialize main layout
        mainLayout = new BorderPane();

        // Initialize components with callbacks
        equationsComponent = new EquationsComponent();

        cardsComponent = new CardsComponent();
        cardsComponent.setOnCardClick(this::handleCardClick);

        playerStatusComponent = new PlayerStatusComponent(
                player,
                this::updateGameState  // Pass update callback
        );

        // Add components to mainLayout
        mainLayout.setLeft(equationsComponent);
        mainLayout.setRight(cardsComponent);
        mainLayout.setBottom(playerStatusComponent);

        // Initial update of game state
        updateGameState();

        // Add background and main layout to root StackPane
        root.getChildren().addAll(background, mainLayout);

        // Create the main scene
        Scene scene = new Scene(root, SCENE_WIDTH, SCENE_HEIGHT);

        // Configure and show the stage
        stage.setTitle(STAGE_TITLE);
        stage.setScene(scene);
        stage.show();
    }

    /**
     * Launch the game view
     * @param gameBoard
     * @param player
     * @param referee
     */
    public static void launchApp(GameBoard gameBoard, Player player, Referee referee) {
        setToRender(gameBoard, player, referee);
        launch(GameView.class);
    }
}