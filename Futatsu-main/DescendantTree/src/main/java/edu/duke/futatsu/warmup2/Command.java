package edu.duke.futatsu.warmup2;
import java.util.*;

public class Command {
    private Tree descendantTree;

    /**
     * Constructs Command object with a Tree object field
     * @param descendantTree
     */
    public Command(Tree descendantTree) {
        this.descendantTree = descendantTree;
    }

    /**
     * Decides if a node is being created or found
     * @param line from system.in
     */
    public void classifyCommand(String line)
    {
        String[] input = line.split(" ");
        String command = input[0];
        if(command.equals("mother") || command.equals("father")){
            createNode(line);
        }
        if(command.equals("find")){
            findNode(input[1]);
        }
    }

    /**
     *Creates a new node using the given name and defined role. A helper method is called to find the children as an APerson list
     * @param line from system.in
     * @return the new person that was just created
     */
    public APerson createNode(String line) {
        String[] input = line.split(" ");
        String role = input[0];
        String name = input[1];
        ArrayList<APerson> childrenDescendants = getChildrenList(input);
        APerson newDescendant;
        if (role.equals("mother")) {
            newDescendant = new Mother(name, childrenDescendants);
        } else {
            newDescendant = new Father(name, childrenDescendants);
        }
        this.descendantTree.addDescendant(newDescendant);
        return newDescendant;

    }

    /**
     * Calls a helper method to find path from root to target and print the results
     * @param targetName of who is being found
     */
    public void findNode(String targetName) {
        String path=this.descendantTree.findPathToDescendant(targetName);
        System.out.println("path from \"" + descendantTree.getRoot().getName() + "\" to \"" + targetName + "\" is "+path);
    }

    /**
     * Finds the children APerson objects that have already been added to the descendent tree
     * @param input array holding arguments from system.in line
     * @return APerson list of children
     */
    public ArrayList<APerson> getChildrenList(String[] input) {
        ArrayList<APerson> treeDescendants = this.descendantTree.getDescendants();
        ArrayList<APerson> childrenDescendants = new ArrayList<>();
        for (int i = 2; i < input.length; i++) {
            for (int j = treeDescendants.size() - 1; j >= 0; j--) {
                if (treeDescendants.get(j).getName().equals(input[i])) {
                    childrenDescendants.add(treeDescendants.get(j));
                }
            }
        }
        return childrenDescendants;
    }
}