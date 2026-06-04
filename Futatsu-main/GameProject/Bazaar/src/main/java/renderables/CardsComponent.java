package renderables;

import common.Card;
import common.CardRender;
import common.Equation;
import javafx.scene.layout.VBox;
import javafx.scene.layout.GridPane;
import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import java.util.List;
import java.util.function.Consumer;

public class CardsComponent extends VBox {
    // Layout constants
    private static final double COMPONENT_SPACING = 10;
    private static final double PADDING = 10;
    private static final double PREFERRED_WIDTH = 250;
    private static final double GRID_GAP = 5;
    private static final String SECTION_TITLE = "Cards";
    private static final String STYLE_CLASS = "section-title";
    private static final double CARD_WIDTH = 110;
    private static final double CARD_HEIGHT = 150;
    private static final int MAX_CARDS_PER_ROW = 2;
    private static final String TITLE_BACKGROUND_COLOR = "#F5DEB3";

    private GridPane cardsGrid;
    private List<Card> cards;
    private Consumer<Card> onCardClick;

    //make constructor more concise
    public CardsComponent() {
        // Configure this component
        this.setSpacing(COMPONENT_SPACING);
        this.setPadding(new Insets(PADDING));
        this.setPrefWidth(PREFERRED_WIDTH);
        this.setAlignment(Pos.CENTER);

        // Create and style title
        Label title = new Label(SECTION_TITLE);
        title.setStyle(
                "-fx-background-color: " + TITLE_BACKGROUND_COLOR + ";" +
                        "-fx-border-color: black;" +
                        "-fx-border-width: 2px;" +
                        "-fx-border-style: solid;" +
                        "-fx-background-radius: 10px;" +
                        "-fx-border-radius: 10px;"+
                        "-fx-font-size: 20px;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 5px 10px;"
        );
        title.setMaxWidth(Double.MAX_VALUE);
        title.setAlignment(Pos.CENTER);

        // Create cards grid
        cardsGrid = new GridPane();
        cardsGrid.setHgap(GRID_GAP);
        cardsGrid.setVgap(GRID_GAP);
        cardsGrid.setAlignment(Pos.CENTER);

        // Add to component
        this.getChildren().addAll(title, cardsGrid);
    }

    public void setOnCardClick(Consumer<Card> handler) {
        this.onCardClick = handler;
    }

    public void updateCards(List<Card> cards) {
        this.cards = cards;
        renderCards();
    }

    private void renderCards() {
        cardsGrid.getChildren().clear();
        int col = 0;
        int row = 0;

        for (Card card : cards) {
            CardRender cardRender = new CardRender(card);
            Pane cardPane = cardRender.renderGameView();

            // Add click handler if equation can be used
            if (card.getCanBeBoughtByActivePlayer()) {
                cardPane.setOnMouseClicked(e -> {
                    if (onCardClick != null) {
                        onCardClick.accept(card);
                    }
                });
                cardPane.setOnMouseEntered(e ->
                        cardPane.setStyle(cardPane.getStyle() + "-fx-cursor: hand;"));
            }

            cardsGrid.add(cardPane, col, row);

            col++;
            if (col >= MAX_CARDS_PER_ROW) {
                col = 0;
                row++;
            }


        }
    }
}