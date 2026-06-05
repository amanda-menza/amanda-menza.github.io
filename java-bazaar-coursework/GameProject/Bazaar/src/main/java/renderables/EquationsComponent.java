package renderables;

import common.Equation;
import common.EquationRender;
import javafx.scene.layout.VBox;
import javafx.scene.control.Label;
import javafx.scene.layout.Pane;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import java.util.List;
import java.util.function.Consumer;

public class EquationsComponent extends VBox {

    // Layout constants
    private static final double COMPONENT_SPACING = 5;
    private static final double PADDING = 10;
    private static final double PREFERRED_WIDTH = 300;
    private static final double EQUATIONS_LIST_SPACING = 2;
    private static final String SECTION_TITLE = "Equations";
    private static final String STYLE_CLASS = "section-title";
    private static final String TITLE_BACKGROUND_COLOR = "#F5DEB3";

    private VBox equationsList;
    private List<Equation> equations;
//make constructor more concise
    public EquationsComponent() {
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

        // Create equations list container
        equationsList = new VBox(EQUATIONS_LIST_SPACING);
        equationsList.setAlignment(Pos.TOP_CENTER);

        // Add to component
        this.getChildren().addAll(title, equationsList);
    }

    public void updateEquations(List<Equation> equations) {
        this.equations = equations;
        renderEquations();
    }



    private void renderEquations() {
        equationsList.getChildren().clear();

        for (Equation equation : equations) {
            EquationRender equationRender = new EquationRender(equation);
            Pane equationPane = equationRender.renderGameView();



            equationsList.getChildren().add(equationPane);
        }
    }
}