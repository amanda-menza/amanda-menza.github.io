package edu.duke.futatsu.warmup2;

import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(new InputStreamReader(System.in));
        Tree descendantTree = new Tree();
        Command command = new Command(descendantTree);
        System.out.println("Enter your text(CTRL+D when finished):");
        ArrayList<String> commands = new ArrayList<>();
        while (scanner.hasNext()) {
            String line = scanner.nextLine();
            commands.add(line);
        }
        scanner.close();
        for(String inputLine: commands)
        {
            command.classifyCommand(inputLine);
        }

    }
}
