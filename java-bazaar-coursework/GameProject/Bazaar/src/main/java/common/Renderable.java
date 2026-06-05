package common;

import javafx.scene.layout.Pane;
public interface Renderable {
    /**
     * method implemented by classes that can be visually rendered
     * @return Pane that serves as the root for the scene
     */
    Pane render(); // Each class must implement this method
}
