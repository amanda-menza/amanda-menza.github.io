package edu.duke.futatsu.warmup2;

import org.w3c.dom.Node;

import java.util.*;

public class Tree {
    private APerson root;
    private ArrayList<APerson> descendants;

    /**
     * Initialize the list of descendants on instantiation
     */
    public Tree() {
        this.descendants = new ArrayList<>();
    }

    /**
     * @param newDescendant new descendant from in stream to be added to the list and as the root of the tree
     */
    public void addDescendant(APerson newDescendant) {
        descendants.add(newDescendant);
        root = newDescendant;
    }

    /**
     * @return List of all APersons in current tree
     */
    public ArrayList<APerson> getDescendants() {
        return descendants;
    }

    /**
     *
     * @return current root of tree
     */
    public APerson getRoot() {
        return root;
    }

    /**
     * Method to check if person exists in tree
     * @param name of an APerson trying to be found
     * @return boolean value representing if the person was found
     */
    public boolean checkDescendants(String name) {
        for (APerson descendant : descendants) {
            if (descendant.getName().equals(name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the path to arrive at a target descendant
     *
     * @param targetDescendant this is the descendant were trying to get to
     * @return pathToDescendant this is a string of a path to the descendant of the structure: "mother father mother ..."
     */
    public String findPathToDescendant(String targetDescendant) {
        ArrayList<String> path = new ArrayList<>();
        String finalPath;
        if (!checkDescendants(targetDescendant)) {
            return "#f";
        } else if (targetDescendant.equals(root.getName())) {
            return "()";
        } else {
            //call recursive method in APerson
            dfs(root, targetDescendant, path);
            finalPath = "("+String.join(", ", path)+")";

        }
        return finalPath;
    }

    /**
     * Depth-first search (DFS) to find the target descendant.
     *
     * @param current    The current node being visited.
     * @param targetName The name of the target node.
     * @param path       The list of roles (e.g., "mother", "father") on the path.
     * @return True if the target is found, otherwise false.
     */
    private boolean dfs(APerson current, String targetName, List<String> path) {
        if (current.getName().equals(targetName)) {
            return true;
        }
        for (APerson child : current.getChildren()) {
            // Add the role to the path (either "mother" or "father")
            path.add(current.toPathString());
            if (dfs(child, targetName, path)) {
                return true;
            }
            // Backtrack if the path is not correct
            path.remove(path.size() - 1);
        }
        return false;
    }

    /**
     * Method used for testing purposes to output tree contents
     * @return String of Person and children
     */
    @Override
    public String toString() {
        String output = "";
        for (APerson descendant : descendants) {
            output += descendant.getName() + " is " + descendant.toPathString() + " to: " + descendant.childrenToString() + "\n";
        }
        return output;
    }
}
