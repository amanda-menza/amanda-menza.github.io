package xgametest;

import common.Equation;
import player.PlayerException;
import referee.Game_State;
import referee.Referee;
import utils.EquationUtils;
import utils.GameStateUtils;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;

public class GameTestMain {
    public static void main(String[] args) throws PlayerException {
        Game_State gameState= readGameStateFromStdIn();
        Referee ref = new Referee(gameState);
        gameState.setReferee(ref);
        ref.initGameActions();
        ref.runGame();

    }

    public static Game_State readGameStateFromStdIn(){
        Scanner scanner = new Scanner(new InputStreamReader(System.in));
        ArrayList<String> commands = new ArrayList<>();
        while (scanner.hasNext()) {
            String line = scanner.nextLine();
            commands.add(line);
        }
        String actorListString = commands.get(0);

        int eqIndex = -1;
        ArrayList<String> equationStrings = new ArrayList<>();
        for(int i=2;i<commands.size();i++){
            if(commands.get(i).isBlank()){
                eqIndex=i;
                break;
            }
            equationStrings.add(commands.get(i));
        }
        ArrayList<Equation> eqs = EquationUtils.convertFrom2DArrayListToEquationList(equationStrings);
        String gameStateString="";
        for(int i=eqIndex+1;i<commands.size();i++){
            gameStateString+=commands.get(i).trim();
        }
        return GameStateUtils.convertStdInToGameStateWithActors(gameStateString,actorListString,eqs);

    }
}
