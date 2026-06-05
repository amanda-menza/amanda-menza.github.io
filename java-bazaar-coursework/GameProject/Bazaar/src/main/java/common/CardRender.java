package common;

import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Polygon;

public class CardRender implements Renderable {
    private static final int CIRCLE_RADIUS=30;
    private static final int SMALL_CIRCLE_RADIUS = 15; // New smaller radius for game view

    private Card card;
    public CardRender(Card card) {
        this.card = card;
    }

    /**
     * sets 5 pebbles and an optional star for rendering
     * @return Pane serves as root for scene
     */
    public Pane render() {
        // Start the JavaFX application
        Pane root = new Pane();
        root.setStyle(
                "-fx-background-color: lightgray;" +       // Set background fill color
                        "-fx-border-color: black;" +               // Set border color
                        "-fx-border-width: 2px;" +                 // Set border width
                        "-fx-border-style: solid;"                 // Set border style
        );


        root.setPrefSize(400, 600);
        // Create circles with specified coordinates
        Circle circle0 = card.getPebbles().get(0).makeCircle(175,150,CIRCLE_RADIUS);

        Circle circle1 = card.getPebbles().get(1).makeCircle(50,300,CIRCLE_RADIUS);

        Circle circle2 = card.getPebbles().get(2).makeCircle(100,500,CIRCLE_RADIUS);

        Circle circle3 = card.getPebbles().get(3).makeCircle(250,500,CIRCLE_RADIUS);

        Circle circle4 = card.getPebbles().get(4).makeCircle(300,300,CIRCLE_RADIUS);

        if(card.getHasStar())
        {
            // Create a star shape using the Polygon class
            Polygon star = createStar(175, 350, 25, 50, 5);
            star.setFill(Color.GOLD);
            root.getChildren().add(star);
        }


        if(card.getCanBeBoughtByActivePlayer()){
            root.setStyle("-fx-background-color: lightgreen;"); // make the background of the cardPane green
        }

        // Add circles to the Pane
        root.getChildren().addAll(circle0, circle1, circle2, circle3,circle4);
        return root;
    }

    /**
     * Creates a star shape with the specified parameters
     * @param centerX x-coordinate of the center of the star
     * @param centerY y-coordinate of the center of the star
     * @param innerRadius radius of the inner points of the star
     * @param outerRadius radius of the outer points of the star
     * @param numPoints number of points on the star
     * @return Polygon representing the star
     */
    public Polygon createStar(double centerX, double centerY, double innerRadius, double outerRadius, int numPoints) {
        Polygon star = new Polygon();
        double angleStep = Math.PI / numPoints; // Angle between points
        for (int i = 0; i < 2 * numPoints; i++) {
            // Alternate between outer and inner radius
            double radius = (i % 2 == 0) ? outerRadius : innerRadius;

            // Calculate x and y position for each point
            double angle = i * angleStep;
            double x = centerX + Math.cos(angle) * radius;
            double y = centerY - Math.sin(angle) * radius;

            star.getPoints().addAll(x, y);
        }
        return star;
    }

    // New render method specifically for game view
    public Pane renderGameView() {
        Pane root = new Pane();
        root.setStyle(
                "-fx-background-color: #F5DEB3;" +
                        "-fx-border-color: black;" +
                        "-fx-border-width: 2px;" +
                        "-fx-border-style: solid;" +
                        "-fx-background-radius: 10px;" +
                        "-fx-border-radius: 10px;"
        );

        root.setPrefSize(110, 150);

        final int SMALL_CIRCLE_RADIUS = 10;

        // Center circle
        Circle circle0 = card.getPebbles().get(0).makeCircle(55, 40, SMALL_CIRCLE_RADIUS);

        // Left circle
        Circle circle1 = card.getPebbles().get(1).makeCircle(25, 75, SMALL_CIRCLE_RADIUS);

        // Bottom circles
        Circle circle2 = card.getPebbles().get(2).makeCircle(35, 110, SMALL_CIRCLE_RADIUS);
        Circle circle3 = card.getPebbles().get(3).makeCircle(75, 110, SMALL_CIRCLE_RADIUS);

        // Right circle
        Circle circle4 = card.getPebbles().get(4).makeCircle(85, 75, SMALL_CIRCLE_RADIUS);

        if(card.getHasStar()) {
            Polygon star = createStar(55, 75, 8, 15, 5);
            star.setFill(Color.GOLD);
            star.setStroke(Color.BLACK);
            star.setStrokeWidth(1);
            root.getChildren().add(star);
        }

        if(card.getCanBeBoughtByActivePlayer()) {
            root.setStyle(root.getStyle() + "-fx-background-color: lightgreen;");
        }

        root.getChildren().addAll(circle0, circle1, circle2, circle3, circle4);
        return root;
    }
}
