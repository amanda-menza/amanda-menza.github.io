package referee;

import common.*;
import player.IPlayer;
import player.Player;
import player.PlayerScore;
import utils.player_utils.PlayerScoreComparator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.stream.Collectors;

import static referee.GameBoard.initializeGameBoardWithCardLists;
import static referee.GameBoard.initializeGameBoardWithCardListsAndEquations;

public class Game_State implements GameStateActionsForRef {

    public enum State {
        SETUP {
            @Override
            public State nextState() {
                return FIRST_REQUEST;
            }
            @Override
            public void performStateAction(Game_State gameState){
                gameState.setInitialActivePlayer();
            }

        },
        FIRST_REQUEST {
            @Override
            public State nextState() {
                return SECOND_REQUEST;
            }
            @Override
            public void performStateAction(Game_State gameState){
                gameState.notifyFirstRequest();
            }
        },
        SECOND_REQUEST {
            @Override
            public State nextState() {
                return EVALUATE_MOVE;
            }
            @Override
            public void performStateAction(Game_State gameState){
               gameState.notifySecondRequest();
            }
        },
        EVALUATE_MOVE {
            @Override
            public State nextState() {
                return EXECUTE_MOVE;
            }
            @Override
            public void performStateAction(Game_State gameState){
                gameState.notifyEvaluateMove();
            }
        },
        EXECUTE_MOVE {
            @Override
            public State nextState() {
                return NEXT_PLAYER_TURN;
            }
            @Override
            public void performStateAction(Game_State gameState){
                gameState.notifyExecuteMove();
            }
        },
        NEXT_PLAYER_TURN {
            @Override
            public State nextState() {
                return FIRST_REQUEST;
            }
            @Override
            public void performStateAction(Game_State gameState){
                gameState.updateActivePlayerTurn();
            }
        },
        GAME_OVER{
            @Override
            public State nextState() {
                return GAME_OVER;//where should this go? should it just remain in game over?
            }
            @Override
            public void performStateAction(Game_State gameState){
                gameState.endGame();
            }
        };


        // Abstract method that transitions to the next state
        public abstract State nextState();
        public abstract void performStateAction(Game_State gameState);
    }

    private Bank bank;
    private Player activePlayer;
    private ArrayList<Player> players;
    private ArrayList<Player> badPlayers;
    private int activePlayerIndex;
    private State currentState;
    private GameBoard gameBoard;
    private RefActionsForGameState referee;
    private boolean checkLastRound=false;
    private int checkLastRoundCards;
    private ArrayList<PlayerScore> playerScores;
    private PlayerScore activePlayerScore;
    private int playerTurnCount=0;


    /**
     * Constructor for the Game_State class
     */
    public Game_State(){

        currentState = State.SETUP;
        bank=new Bank();
        gameBoard=new GameBoard();
        players=new ArrayList<>();
        activePlayerIndex=0;
        playerScores=new ArrayList<>();
        badPlayers=new ArrayList<>();
    }

    public Game_State(Bank bank, ArrayList<Card> invisibleCards,ArrayList<Card> visibleCards){
        currentState=State.SETUP;
        this.bank=bank;
        players=new ArrayList<>();
        activePlayerIndex=0;
        gameBoard=initializeGameBoardWithCardLists(invisibleCards, visibleCards);
        playerScores=new ArrayList<>();
        badPlayers=new ArrayList<>();

    }

    public Game_State(Bank bank, ArrayList<Card> invisibleCards,ArrayList<Card> visibleCards,ArrayList<Player> playerList, ArrayList<Equation> eqs){
        currentState=State.SETUP;
        this.bank=bank;
        players=playerList;
        activePlayerIndex=0;
        gameBoard=initializeGameBoardWithCardListsAndEquations(invisibleCards, visibleCards,eqs);
        playerScores=new ArrayList<>();
        for (Player p:players){
            playerScores.add(p.getPlayerScore());
        }
        badPlayers=new ArrayList<>();

    }

    /**
     * Method to call constructor for STDIN with user settings
     * @param bank
     * @param invisibleCards
     * @param visibleCards
     * @return
     */
    public static Game_State initializeGameWithSTDIN(Bank bank, ArrayList<Card> invisibleCards,ArrayList<Card> visibleCards){
        return new Game_State(bank,invisibleCards,visibleCards);
    }

    /**
     * Method to call constructor with STDIN info
     * @param bank
     * @param invisibleCards
     * @param visibleCards
     * @param playerList
     * @return
     */
    public static Game_State initializeGameWithPlayers(Bank bank, ArrayList<Card> invisibleCards,ArrayList<Card> visibleCards,ArrayList<Player> playerList,ArrayList<Equation> eqs){
        return new Game_State(bank,invisibleCards,visibleCards,playerList,eqs);
    }

    /**
     * Assigns ref for game state
     * @param referee
     */
    public void setReferee(RefActionsForGameState referee){
        this.referee = referee;
    }


    /**
     * Starts the game by transitioning through the states until GAME_OVER is reached
     * This is meant to be called from the main/GameBoard class.
     */
    public void startGame(){
        if(players.isEmpty())
        {
            throw new IllegalStateException("No players added yet");
        }
        while(currentState != State.GAME_OVER){
            currentState = currentState.nextState();
            currentState.performStateAction(this);
        }
    }

    /**
     * Method to set first active player.
     * Action of the SETUP state
     */
    public void setInitialActivePlayer(){
        activePlayer=players.get(activePlayerIndex);
        activePlayerScore=playerScores.get(activePlayerIndex);
        referee.updateActivePlayer(activePlayer);
    }


    /**
     * Changes turn of player.
     * Action of the NEXT_PLAYER_TURN state.
     */
    public void updateActivePlayerTurn(){
        this.activePlayerIndex=activePlayerIndex+1;
        if(this.activePlayerIndex==players.size()){
            this.activePlayerIndex=0;
        }
        this.activePlayer=players.get(activePlayerIndex);
        this.activePlayerScore=playerScores.get(activePlayerIndex);
        referee.updateActivePlayer(activePlayer);
        //activePlayer.updateScore(playerScores.get(activePlayerIndex).getScore());
    }

    public void notifyFirstRequest(){
       referee.getFirstPlayerRequest();
    }

    public void notifySecondRequest(){
        referee.getSecondPlayerRequest();
    }

    /**
     * Tells ref to validate the player's proposed move
     * Action of EVALUATE_MOVE state.
     */
    public void notifyEvaluateMove(){
        referee.evaluateMove();
    }

    /**
     * Method called once valid move is approved by ref.
     * Initiates transaction for player
     */
    public void notifyExecuteMove(){
        referee.executeMove();
    }

    /**
     * Method called to finish game according to guidelines
     */
    public void endGame(){
        currentState=State.GAME_OVER;
        ArrayList<Player> rank =getPlayerRank();
        ArrayList<IPlayer> IRank = new ArrayList<>(rank);
        referee.notifyGameOver(IRank);

    }

    /**
     * Called after each move is executed to check if game is over
     * @return true if end game conditions met
     */
    public boolean isGameOver(){
        if(players.isEmpty()|| gameBoard.visibleCards.isEmpty()  || (playerScores.get(activePlayerIndex).getScore()>=20) || (checkLastRound && playerTurnCount==players.size() && checkLastRoundCards==gameBoard.getInvisibleCards().size())){
            return true;
        }
        // this.gameBoard.getInvisibleCards().isEmpty()
        if(checkLastRound && playerTurnCount==players.size() && checkLastRoundCards!=gameBoard.getInvisibleCards().size()){
            playerTurnCount=0;
            checkLastRoundCards = gameBoard.getInvisibleCards().size();
        }
        if(bank.isEmpty())
        {
            if(checkLastRound)
            {
                playerTurnCount++;
            }
            else {
                checkLastRound = true;
                checkLastRoundCards = gameBoard.getInvisibleCards().size();
            }
        }
        return false;
    }

    /**
     * Remove player if referee determines they cheat or disobey rules.
     */
    public void removeIllegalPlayer(IPlayer player) {
        int index = -1;
        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).equals(player)) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            Player badPlayer = players.remove(index);
            badPlayers.add(badPlayer);
            playerScores.remove(index);
        } else {
            System.out.println("Player not found in the list.");
        }
    }


    /**
     * removes active player if they cheat or misbehave
     */
    public void removeIllegalPlayer(){

        players.remove(activePlayerIndex);
        badPlayers.add(activePlayer);
        playerScores.remove(activePlayerIndex);
        activePlayerIndex=activePlayerIndex-1;
        currentState=State.NEXT_PLAYER_TURN;
        currentState.performStateAction(this);
    }

    /**
     * Method to give ref a turn state for active player
     * @return
     */
    public Turn_State getTurnState() {
        Inventory bankPebbles =bank.getBankInventory();
        ArrayList<PlayerScore> scores=getNonActivePlayerScores();
        return new Turn_State(bankPebbles,activePlayer,scores,gameBoard.visibleCards);
    }

    /**
     * Method to obtain current player scores not including the active player
     * @return Array List of scores
     */
    public ArrayList<PlayerScore> getNonActivePlayerScores()
    {
        ArrayList<PlayerScore> scores=new ArrayList<>();
        for(int i=0;i<players.size();i++)
        {
            if(i!=activePlayerIndex)
            {
                scores.add(playerScores.get(i));
            }
        }
        return scores;
    }

    /**
     * Ends the game by sorting the players by score and returning the list of players
     * @return ArrayList<Player> - the list of players sorted by score
     */
    public ArrayList<Player> getPlayerRank(){
        Collections.sort(players, new PlayerScoreComparator());
        return players;
    }

    /**
     * Add player when told to by ref
     */
    public void addPlayer(IPlayer Iplayer){
        Player p = new Player(Iplayer.getName(), Iplayer.getScore(), Iplayer.getInventory());
        players.add(p);
        playerScores.add(p.getPlayerScore());
    }


    public GameBoard getGameBoard(){
        return gameBoard;
    }

    public Player getActivePlayer() {
        return activePlayer;
    }

    public Inventory getBankInventory(){
        return bank.getBankInventory();
    }

    public void updateActivePlayerScore(int points){
        int currentScore=playerScores.get(activePlayerIndex).getScore();
        playerScores.get(activePlayerIndex).updateScore(currentScore+points);
    }

    public ArrayList<Player> getPlayers(){
        return players;
    }

    public State getCurrentState(){
        return currentState;
    }

    public int getActivePlayerIndex(){
        return activePlayerIndex;
    }

    public void setCurrentTurnState(Turn_State s){
        bank=Bank.initializeBankWithPebbleList(s.getBankInventory().getPebbles());
        IPlayer activeIPlayer = s.getActivePlayer();
        activePlayer= Player.initializePlayerWithScoreAndInventory("",activeIPlayer.getScore(),activeIPlayer.getInventory());
        activePlayerIndex=0;
        playerScores.add(activePlayer.getPlayerScore());
        for(PlayerScore score: s.getOtherPlayerScores())
        {
            playerScores.add(score);
        }
        gameBoard=initializeGameBoardWithCardLists(new ArrayList<>(),s.getVisibleCards());


    }

    public ArrayList<ArrayList<String>> getWinnersAndCheaters(){
        ArrayList<ArrayList<String>> winnersAndCheaters = new ArrayList<>();
        ArrayList<Player> rank = getPlayerRank();
        int highestScore = rank.get(0).getScore();
        ArrayList<String> winners = getPlayerRank().stream()
                .filter(player -> player.getScore() == highestScore)
                .map(Player::getName)
                .sorted()
                .collect((Collectors.toCollection(ArrayList::new)));
        ArrayList<String> cheaters = new ArrayList<>();
        badPlayers.stream()
                .sorted(Comparator.comparing(Player::getName))
                .map(Player::getName)
                .forEach(cheaters::add);
        winnersAndCheaters.add(winners);
        winnersAndCheaters.add(cheaters);
        return winnersAndCheaters;
    }

}
