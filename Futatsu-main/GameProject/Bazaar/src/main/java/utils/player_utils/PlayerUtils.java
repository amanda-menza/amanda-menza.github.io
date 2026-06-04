package utils.player_utils;

import common.Inventory;
import common.Pebble;
import player.Player;
import player.PlayerScore;

import java.util.*;

import static common.Inventory.initializeInventoryWithList;
import static player.Player.initializePlayerWithScoreAndInventory;
import static utils.PebbleUtils.convertToPebbles;
import static utils.StringUtils.*;

public class PlayerUtils {

    /**
     * Used to iterate through a string and create player object list
     * @param str
     * @return
     */
    public static ArrayList<Player> convertToPlayerList(String str){
        String[] playerArr = trimCurlyBrackets(trimBrackets(str)).split("\\},\\{");
        ArrayList<Player> playerList = new ArrayList<>();
        for (String playerStr : playerArr) {
            Player player=convertToPlayer(playerStr.trim());
            playerList.add(player);
        }
        return playerList;
    }

    /**
     * Converts a string from STDIN into a Player object
     * @param str
     * @return
     */
    public static Player convertToPlayer(String str){
        int commaIndex = str.indexOf(',');
        String scoreStr="";
        String inventoryStrList="";
        // Check if a comma exists in the string
        if (commaIndex != -1) {
            // Split into two parts: before the first comma, and after
            scoreStr = str.substring(0, commaIndex);
            inventoryStrList = str.substring(commaIndex + 1);
        }
        int score = Integer.parseInt(scoreStr);
        ArrayList<Pebble> inventoryList= convertToPebbles(trimBrackets(inventoryStrList),",");
        Inventory inventory=initializeInventoryWithList(inventoryList);
        return initializePlayerWithScoreAndInventory("",score,inventory);

    }

    public static ArrayList<PlayerScore> convertToPlayerScoreList(String str){
        String trimmedStr = trimBrackets(str);
        if(trimmedStr.isEmpty()){
            return new ArrayList<>();
        }
        String[] playerScoreArr = trimmedStr.split(",");
        ArrayList<PlayerScore> playerScoreList = new ArrayList<>();
        for (String playerScoreStr : playerScoreArr) {
            playerScoreList.add(new PlayerScore(Integer.parseInt(playerScoreStr)));
        }
        return playerScoreList;
    }

    /**
     * Helper method to combine actor and game state player definitions
     * @param actorString
     * @param walletStr
     * @return
     */
    public static ArrayList<Player> convertToPlayerListWithActorInfo(String actorString, String walletStr){
        String [] actorArr = trimBrackets(trimBrackets(actorString)).split("\\],\\[");
        ArrayList<Player> playerList = convertToPlayerList(walletStr);
        for(int i=0;i<playerList.size();i++){
            String [] splitActor = actorArr[i].split(",");
            playerList.get(i).setName(splitActor[0]);
            playerList.get(i).setStrategyType(splitActor[1]);
            if(splitActor.length<3){
                playerList.get(i).setExn("");
            }
            else{
                playerList.get(i).setExn(splitActor[2]);
            }
        }
        return playerList;
    }
}
