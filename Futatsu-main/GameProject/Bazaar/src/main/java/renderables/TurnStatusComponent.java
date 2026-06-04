package renderables;

import common.*;
import javafx.scene.layout.HBox;
import javafx.scene.control.Label;
import javafx.scene.shape.Circle;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import player.Player;

import java.util.Map;

public class TurnStatusComponent extends HBox {

    private static final double COMPONENT_SPACING = 15;
    private static final double PADDING = 10;
    private static final String BACKGROUND_COLOR = "#F5DEB3";
    private static final int CIRCLE_RADIUS = 8;
    private static final double SECTION_WIDTH = 600;

    private PlayerStatusComponent playerSection;
    private HBox bankSection;

    /**
     * Constructor for TurnStatusComponent
     *
     * @param player
     * @param bankInventory
     * @param onPebbleAdded
     */
    public TurnStatusComponent(Player player, Inventory bankInventory, Runnable onPebbleAdded) {
        // Configure main component
        this.setPadding(new Insets(PADDING));
        this.setAlignment(Pos.CENTER);
        this.setStyle(
                "-fx-background-color: " + BACKGROUND_COLOR + ";" +
                        "-fx-border-color: black;" +
                        "-fx-border-width: 2px;" +
                        "-fx-border-style: solid;"
        );

        // Create left side (player status)
        playerSection = new PlayerStatusComponent(player, onPebbleAdded);
        playerSection.setPrefWidth(SECTION_WIDTH);

        // Create right side (bank status)
        bankSection = new HBox(COMPONENT_SPACING);
        bankSection.setAlignment(Pos.CENTER);  // Changed to CENTER
        bankSection.setPadding(new Insets(PADDING));
        bankSection.setPrefWidth(SECTION_WIDTH);
        bankSection.setMinWidth(SECTION_WIDTH);  // Ensure minimum width

        // Label for "Bank:"
        Label bankLabel = new Label("Bank:");
        bankLabel.setStyle("-fx-font-weight: bold;");
        bankSection.getChildren().add(bankLabel);

        Map<Pebble, Integer> bankCounts = bankInventory.getPebbleCounts();
        for (Pebble pebbleType : Pebble.values()) {
            HBox pebbleGroup = new HBox(10);  // Increased spacing between circle and number
            pebbleGroup.setPadding(new Insets(0, 10, 0, 10));  // Add padding around each group
            pebbleGroup.setAlignment(Pos.CENTER);

            Circle pebbleCircle = pebbleType.makeCircle(0, 0, CIRCLE_RADIUS);
            Label countLabel = new Label(bankCounts.getOrDefault(pebbleType, 0).toString());
            countLabel.setMinWidth(20);  // Give the label minimum width, fixes the problem with ..., not enough space

            pebbleGroup.getChildren().addAll(pebbleCircle, countLabel);
            bankSection.getChildren().add(pebbleGroup);
        }

        // Add both sections
        this.getChildren().addAll(playerSection, bankSection);
    }

    /**
     * Update the status of the component
     *
     * @param player
     * @param bankInventory
     */
    public void updateStatus(Player player, Inventory bankInventory) {
        // Update player side
        Map<Pebble, Integer> playerCounts = player.getInventory().getPebbleCounts();
        playerSection.updateStatus(player.getName(), player.getPlayerScore().getScore(), playerCounts);

        // Update bank side
        Map<Pebble, Integer> bankCounts = bankInventory.getPebbleCounts();
        int index = 1;  // Start at 1 to skip the "Bank:" label
        for (Pebble pebbleType : Pebble.values()) {
            HBox pebbleGroup = (HBox) bankSection.getChildren().get(index);
            Label countLabel = (Label) pebbleGroup.getChildren().get(1);
            countLabel.setText(bankCounts.getOrDefault(pebbleType, 0).toString());
            index++;
        }
    }
}