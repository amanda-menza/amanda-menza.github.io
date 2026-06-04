package renderables;

import common.Card;
import common.Equation;
import referee.GameBoard;
import player.Player;
import referee.Bank;
import referee.Referee;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import java.util.List;

public class RefView extends Application {

    public static final int BACKGROUND_WIDTH = 1200;
    public static final int BACKGROUND_HEIGHT = 800;
    public static final String BACKGROUND_PATH = "/media/background.png";
    public static final String STAGE_TITLE = "Bazzaar";
    private static final int SCENE_WIDTH = 1200;
    private static final int SCENE_HEIGHT = 800;
    private static final int POINTS_FOR_EQUATION = 5;

    private BorderPane mainLayout;
    private EquationsComponent equationsComponent;
    private CardsComponent cardsComponent;
    private TurnStatusComponent turnStatusComponent;
    private static List<Card> cards;
    private static List<Equation> equations;
    private static Player player;
    private static Referee referee;
    private static Bank bank = new Bank();


    public static void setToRender(GameBoard gameBoard, Player currentPlayer, Referee gameReferee) {
        cards = gameBoard.visibleCards;
        equations = gameBoard.equations;
        player = currentPlayer;
        referee = gameReferee;
    }

    /**
     * Update the game state
     * for now just filters cards and equations
     */
    private void updateGameState() {
        // Update what the player can use in terms of equations and cards
        // this will need to be refactored out of this class
        for (Equation equation : equations) {
           // equation.setCanBeUsedByActivePlayer(referee.canUseEquationSimple(equation, player));
        }

        for (Card card : cards) {
            card.setCanBeBoughtByActivePlayer(referee.getRuleBook().canBuyCard(card, player.getInventory()));
        }

        // Update all components
        equationsComponent.updateEquations(equations);
        cardsComponent.updateCards(cards);
        turnStatusComponent.updateStatus(player, bank.getBankInventory());
    }

    /**
     * Handle a card click event
     * remove it and give a hard coded 5 points for now, needs to be updated @TODO
     * @param card
     */
    private void handleCardClick(Card card) {
        if (card.getCanBeBoughtByActivePlayer()) {
            // Remove the card from the game board
            cards.remove(card);
            // Award points to the player
            player.updateScore(POINTS_FOR_EQUATION);
            // Update the display
            updateGameState();
        }
    }

    /**
     * Start the application
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

        turnStatusComponent = new TurnStatusComponent(
                player,
                bank.getBankInventory(),
                this::updateGameState
        );

        // Add components to mainLayout
        mainLayout.setLeft(equationsComponent);
        mainLayout.setRight(cardsComponent);
        mainLayout.setBottom(turnStatusComponent);

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
     * Launch the application
     * @param gameBoard
     * @param player
     * @param referee
     */
    public static void launchApp(GameBoard gameBoard, Player player, Referee referee) {
        setToRender(gameBoard, player, referee);
        launch(RefView.class);
    }
}