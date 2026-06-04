package common;

import javafx.scene.layout.Pane;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.Text;

public class EquationRender implements Renderable{
    private static final int CIRCLE_RADIUS = 15;
    private static final int Y_COORD=25;
    private static final int X_INCREMENT=75;
    private static final int FONT_SIZE=60;

    private static final int SMALL_CIRCLE_RADIUS = 8;
    private static final int GAME_VIEW_Y_COORD = 15;
    private static final int GAME_VIEW_X_INCREMENT = 30;
    private static final int GAME_VIEW_FONT_SIZE = 30;

    private Equation equation;
    public EquationRender(Equation equation) {
        this.equation = equation;
    }
    /**
     * Renders the equation as a Pane with circles representing pebbles on each side
     * @return Pane
     */
    public Pane render() {
        Pane root = new Pane();//root for the rendering
        root.setStyle(
                "-fx-background-color: #e3c69b;" +
                        "-fx-border-color: black;" +
                        "-fx-border-width: 2px;" +
                        "-fx-border-style: solid;"
        );


        root.setPrefSize(1800, 150);
        int x=X_INCREMENT;
        for(int i=0;i<equation.getLeftSide().size();i++)//render each left side pebble
        {
            Circle circle = equation.getLeftSide().get(i).makeCircle(x,Y_COORD,CIRCLE_RADIUS);
            root.getChildren().add(circle);
            x+=X_INCREMENT;
        }
        Text textLabel = new Text("=");//render equal sign
        textLabel.setX(350);
        textLabel.setY(50);
        textLabel.setFont(new Font("Arial", FONT_SIZE));
        root.getChildren().add(textLabel);
        x=X_INCREMENT*6;
        for(int i=0;i<equation.getRightSide().size();i++)//render each right side pebble
        {
            Circle circle = equation.getRightSide().get(i).makeCircle(x,Y_COORD,CIRCLE_RADIUS);
            root.getChildren().add(circle);
            x+=X_INCREMENT;
        }

        if(equation.getCanBeUsedByActivePlayer()){
            root.setStyle("-fx-background-color: lightgreen;"); // make the background of the cardPane green
        }

        return root;

    }

    public Pane renderGameView() {
        Pane root = new Pane();
        root.setStyle(
                "-fx-background-color: #F5DEB3;" +
                        "-fx-border-color: black;" +
                        "-fx-border-width: 2px;" +
                        "-fx-border-style: solid;"
        );

        root.setPrefSize(280, 40);

        final int SMALL_CIRCLE_RADIUS = 8;
        final int Y_COORD = 20;
        final int X_START = 20;
        final int X_INCREMENT = 25;

        // Render left side
        int x = X_START;
        for(int i = 0; i < equation.getLeftSide().size(); i++) {
            Circle circle = equation.getLeftSide().get(i).makeCircle(x, Y_COORD, SMALL_CIRCLE_RADIUS);
            root.getChildren().add(circle);
            x += X_INCREMENT;
        }

        // Center the equals sign based on the pane width
        Text textLabel = new Text("=");
        textLabel.setFont(new Font("Arial", 20));
        textLabel.setX(140);  // Center of the 280px width
        textLabel.setY(27);   // Aligned with circles
        root.getChildren().add(textLabel);

        // Render right side
        x = 160;  // Start right side after equals sign
        for(int i = 0; i < equation.getRightSide().size(); i++) {
            Circle circle = equation.getRightSide().get(i).makeCircle(x, Y_COORD, SMALL_CIRCLE_RADIUS);
            root.getChildren().add(circle);
            x += X_INCREMENT;
        }

        if(equation.getCanBeUsedByActivePlayer()) {
            root.setStyle(root.getStyle() + "-fx-background-color: lightgreen;");
        }

        return root;
    }

}