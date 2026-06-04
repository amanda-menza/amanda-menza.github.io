package renderables;

import common.Pebble;
import player.Player;
import javafx.scene.layout.HBox;
import javafx.scene.control.Label;
import javafx.scene.shape.Circle;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import java.util.Map;

import static renderables.GameView.BACKGROUND_WIDTH;

public class PlayerStatusComponent extends HBox {

    // Layout constants
    private static final double COMPONENT_SPACING = 25;
    private static final double PADDING = 10;
    private static final String BACKGROUND_COLOR = "#F5DEB3";
    private static final int PEBBLE_RADIUS = 8;

    // Create three sections for layout
    private HBox playerSection;
    private HBox scoreSection;
    private HBox pebbleSection;

    private Player player;
    private Runnable onPebbleAdded;  // Callback for when pebbles are added

    public PlayerStatusComponent(Player player, Runnable onPebbleAdded) {
        // Configure main component
        this.setPadding(new Insets(PADDING));
        this.setAlignment(Pos.CENTER);  // Center all content
        this.setStyle(
                "-fx-background-color: " + BACKGROUND_COLOR + ";" +
                        "-fx-border-color: black;" +
                        "-fx-border-width: 2px 2px 2px 2px;" +
                        "-fx-border-style: solid;"
        );

        this.player = player;
        this.onPebbleAdded = onPebbleAdded;

        // Create three main sections
        playerSection = new HBox();
        playerSection.setAlignment(Pos.CENTER_LEFT);
        playerSection.setPrefWidth(BACKGROUND_WIDTH / 3);

        scoreSection = new HBox();
        scoreSection.setAlignment(Pos.CENTER);
        scoreSection.setPrefWidth(BACKGROUND_WIDTH / 3);

        pebbleSection = new HBox(COMPONENT_SPACING);
        pebbleSection.setAlignment(Pos.CENTER_RIGHT);
        pebbleSection.setPrefWidth(BACKGROUND_WIDTH / 3);

        // Initialize with empty values
        Label nameLabel = new Label("Player 1");
        nameLabel.setStyle("-fx-font-weight: bold;");
        playerSection.getChildren().add(nameLabel);

        Label scoreLabel = new Label("0pts");
        scoreSection.getChildren().add(scoreLabel);

        // Initialize pebble displays with 0 counts
        for (Pebble pebbleType : Pebble.values()) {
            HBox pebbleGroup = new HBox(5);
            pebbleGroup.setAlignment(Pos.CENTER);

            Circle pebbleCircle = pebbleType.makeCircle(0, 0, PEBBLE_RADIUS);
            Label countLabel = new Label("0");

            // Make the whole group clickable
            pebbleGroup.setOnMouseClicked(e -> {
                player.getInventory().addPebble(pebbleType);
                onPebbleAdded.run();  // Trigger update of view
            });

            // Add hover effect
            pebbleGroup.setOnMouseEntered(e ->
                    pebbleGroup.setStyle("-fx-cursor: hand;"));

            pebbleGroup.getChildren().addAll(pebbleCircle, countLabel);
            pebbleSection.getChildren().add(pebbleGroup);
        }

        // Add all sections to main component
        this.getChildren().addAll(playerSection, scoreSection, pebbleSection);
    }

    public void updateStatus(String playerName, int points, Map<Pebble, Integer> pebbleCounts) {
        // Update player name
        Label nameLabel = (Label) playerSection.getChildren().get(0);
        nameLabel.setText(playerName);

        // Update score
        Label scoreLabel = (Label) scoreSection.getChildren().get(0);
        scoreLabel.setText(points + "pts");

        // Update pebble counts
        int pebbleGroupIndex = 0;
        for (Pebble pebbleType : Pebble.values()) {
            HBox pebbleGroup = (HBox) pebbleSection.getChildren().get(pebbleGroupIndex);
            Label countLabel = (Label) pebbleGroup.getChildren().get(1);
            countLabel.setText(pebbleCounts.getOrDefault(pebbleType, 0).toString());
            pebbleGroupIndex++;
        }
    }
}