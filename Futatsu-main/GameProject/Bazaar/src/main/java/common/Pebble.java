package common;

import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

public enum Pebble {
    //associate a color with each enum field
    BLUE(Color.BLUE),
    GREEN(Color.GREEN),
    RED(Color.RED),
    WHITE(Color.WHITE),
    YELLOW(Color.YELLOW);
//    RED(Color.RED),
//    BLUE(Color.BLUE),
//    GREEN(Color.GREEN),
//    YELLOW(Color.YELLOW),
//    WHITE(Color.WHITE);

    // A field to store the corresponding JavaFX Color for each Pebble
    private final Color color;

    // Constructor to initialize each enum instance with its Color
    Pebble(Color color) {
        this.color = color;
    }

    /**
     * Getter method to retrieve the corresponding JavaFX Color for a Pebble.
     * @return JavaFX Color associated with this Pebble.
     */
    public Color getColor() {
        return this.color;
    }

    /**
     * Method to render a pebble as a circle with a given radius
     * and coordinate location
     * @param x coordinate for render
     * @param y coordinate for render
     * @param radius of circle
     * @return created circle
     */
    public Circle makeCircle(int x, int y, int radius) {
        Circle circle = new Circle(radius,this.color);
        circle.setLayoutX(x);
        circle.setLayoutY(y);
        return circle;
    }

}


