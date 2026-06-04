package referee;

import common.*;
import player.IPlayer;
import player.Mechanism;
import player.PlayerException;
import player.strategy.Candidate;
import common.transaction.CardTransaction;
import common.transaction.EquationTransaction;
import utils.RandomUtil;

import java.util.ArrayList;
import java.util.Optional;
import java.util.ResourceBundle;
import java.util.stream.Collectors;

/**
 * Abnormal player interactions that ref takes care of:
 *  - player tries to get pebble and make trades
 *  - submitted exchanges are invalid
 *  - submitted card purchases are invalid
 *  - catches and throws any exceptions found while player is submitting move
 */

public class Referee implements RefActionsForGameState {
    private static final ResourceBundle RNG_BUNDLE = ResourceBundle.getBundle("RNG/rng");



    private static final int MINIMUM_NUM_PLAYERS=Integer.parseInt(RNG_BUNDLE.getString("MINIMUM_NUM_PLAYERS"));
    private static final int MAXIMUM_NUM_PLAYERS=Integer.parseInt(RNG_BUNDLE.getString("MAXIMUM_NUM_PLAYERS"));

    private GameStateActionsForRef gameState;
    private IPlayer activePlayer;
    private Turn_State currentTurnState;
    private ArrayList<IPlayer> endGameReport;
    private Candidate refCurrentCandidate;
    private IRuleBook ruleBook;
    private boolean gavePebble;
    private Mechanism mechanism;
    private Pebble pebble;

    public Referee(GameStateActionsForRef gameState) {

        this.gameState=gameState;
        ruleBook = new RuleBook();
    }

    /**
     * initialize game by setting players and first turn with IPlayers
     * @param players
     */
    public void initGameActions(ArrayList<IPlayer> players) {
        this.addInitialIPlayers(players);
        setupPlayersWithEqs();
        gameState.setInitialActivePlayer();
    }

    /**
     * Initialize game when gamestate already has players
     */
    public void initGameActions() throws PlayerException {
        if(!ruleBook.validNumberOfPlayers(gameState.getPlayerRank().size())) {
            throw new PlayerException("invalid player number");
        }
        setupPlayersWithEqs();
        gameState.setInitialActivePlayer();
    }

    /**
     * start game loop and print winners & cheaters when game ends
     */
    public void runGame() {
        gameState.startGame();
        printWinnersAndCheaters();

    }

    /**
     * Notify game state to begin game
     */
    public void setupPlayersWithEqs() {
        ArrayList<IPlayer> players = new ArrayList<>(gameState.getPlayerRank());
        for(IPlayer p:players)
        {
            Mechanism m = new Mechanism(p);
            try {
                m.setup(gameState.getGameBoard().equations);
            }
            catch (Exception e) {
                gameState.removeIllegalPlayer(p);
                e.printStackTrace();
            }
        }

    }

    /**
     * Add starting players to game
     * @param players
     */
    public void addInitialIPlayers(ArrayList<IPlayer> players) {
        if(!ruleBook.validNumberOfPlayers(players.size())) {
            throw new IllegalArgumentException("Invalid number of players");
        }
        for (IPlayer player : players) {
            notifyAddPlayer(player);
        }

    }


    /**
     * Adds an Iplayer to the game by notifying game state
     */
    public void notifyAddPlayer(IPlayer player) {
        gameState.addPlayer(player);
    }

    /**
     * Game state changes turn and notifies ref to update player
     * @param player
     */
    public void updateActivePlayer(IPlayer player) {
        activePlayer=player;
        mechanism = new Mechanism(player);
        currentTurnState = gameState.getTurnState();
        refCurrentCandidate = new Candidate();
        if(gameState.isGameOver()){
            gameState.endGame();
        }
    }


    /**
     * Executes the first half of a player's turn by getting their request for a pebble or trades
     */
    public void getFirstPlayerRequest() {
        gavePebble = false;
        try {
            PebbleOrExchanges pOrE = mechanism.requestPebbleOrTrades(currentTurnState);
            if (pOrE.getReceivePebble()) {
                giveBankPebbleToActivePlayer();
                gavePebble = true;
            }
            refCurrentCandidate.setEquations(pOrE.getExchanges());
        }
        catch (Exception e) {
            gameState.removeIllegalPlayer();
            e.printStackTrace();
        }

    }

    /**
     * Executes second half of player turn by getting car request and completing the candidate
     */
    public void getSecondPlayerRequest() {
        try {
            SequenceOfCards seqCards = mechanism.requestCards(currentTurnState);
            refCurrentCandidate.setCardsBought(seqCards.getCardsBought());
            refCurrentCandidate.setTotalPoints(seqCards.getPointsFromBuyingCards());
            refCurrentCandidate.setRemainingInventory(seqCards.getRemainingInventoryAfterBuyingCards());
        }
        catch (Exception e) {
            gameState.removeIllegalPlayer();
            e.printStackTrace();
        }
    }

    public void giveBankPebbleToActivePlayer() {
        Optional<Pebble> p=ruleBook.getDeterministicPebble(currentTurnState);
        if(p.isPresent())
        {
            pebble = p.get();
            activePlayer.getInventory().addPebble(p.get());
        }

    }

    /**
     * Random implementation that does not use ruleBook
     */
    public void giveRandomBankPebbleToActivePlayer(){
        if(currentTurnState.getBankInventory().getPebbles().size()==0)
        {
            return;
        }
        int rand = RandomUtil.getRandom(currentTurnState.getBankInventory().getPebbles().size());
        Pebble p= currentTurnState.getBankInventory().getPebbles().remove(rand);
        activePlayer.getInventory().addPebble(p);
    }


    /**
     * Game state in EVALUATE_MOVE
     * Ref validates the players proposed move and kick player out if necessary
     *
     * @return
     */
    public boolean evaluateMove(){
        boolean valid= ruleBook.isValidTurn(refCurrentCandidate,currentTurnState,gavePebble);
        if(!valid)
        {
            gameState.removeIllegalPlayer();
            return false;
        }
        return true;
    }


    /**
     * Game state in EXECUTE_MOVE
     * Ref performs player's desired transaction
     * Checks if any game ending conditions met after turn completion
     */
    public void executeMove(){
        for(Equation eq: refCurrentCandidate.getEquationsUsed()){
            EquationTransaction eqT=new EquationTransaction(eq,activePlayer.getInventory(),currentTurnState.getBankInventory());
            eqT.execute();
        }
        //replace a bought card with an invisible and throw out an additional invisible card
        for(Card c: refCurrentCandidate.getCardsBought())
        {
            CardTransaction cardT= new CardTransaction(c,activePlayer.getInventory(),currentTurnState.getBankInventory(),activePlayer.getMyCards(),activePlayer.getPlayerScore(),gameState.getGameBoard().visibleCards);
            cardT.execute();
            if(gameState.getGameBoard().getInvisibleCards().size()>=2){
                Card newCard =gameState.getGameBoard().getInvisibleCards().remove(0);
                gameState.getGameBoard().visibleCards.add(newCard);
                gameState.getGameBoard().getInvisibleCards().remove(0);
            }

        }
        gameState.updateActivePlayerScore(refCurrentCandidate.getTotalPoints());
        if(gameState.isGameOver()) {
            gameState.endGame();
        }
    }

    /**
     * If game state is GAME_OVER it calls this method to notify ref
     * @param rank
     */
    public void notifyGameOver(ArrayList<IPlayer> rank) {
        endGameReport = rank;
        if (rank.isEmpty()) {
            return; // Handle the case where the rank list is empty
        }
        int topScore = rank.get(0).getScore();
        for (IPlayer player : rank) {
            Mechanism m = new Mechanism(player);
            try {
                if (player.getScore() == topScore) {
                    m.win(true); // Mark the player as a winner if their score equals the top score
                } else {
                    m.win(false); // Otherwise, mark them as not a winner
                }
                m.setEndGameReport(rank); // Provide the end-game report to all players
            }
            catch (Exception e) {
                e.printStackTrace();
                gameState.removeIllegalPlayer(player);
            }
        }
    }

    public void printWinnersAndCheaters(){
        ArrayList<ArrayList<String>> wAc = gameState.getWinnersAndCheaters();
        System.out.println("["+wAc.get(0).stream().collect(Collectors.joining(","))+"]");
        System.out.println();
        System.out.print("["+wAc.get(1).stream().collect(Collectors.joining(","))+"]");
    }

    public IPlayer getActivePlayer() {
        return activePlayer;
    }

    public Turn_State getCurrentTurnState() {
        return currentTurnState;
    }

    public void setCurrentTurnState(Turn_State currentTurnState) {
        this.currentTurnState = currentTurnState;
        activePlayer=currentTurnState.getActivePlayer();
    }

    public Candidate getRefCurrentCandidate() {
        return refCurrentCandidate;
    }

    public IRuleBook getRuleBook() {
        return ruleBook;
    }



}
