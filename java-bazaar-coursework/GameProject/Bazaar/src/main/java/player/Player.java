package player;

import common.*;
import player.strategy.Candidate;
import player.strategy.IStrategy;
import player.strategy.MaxNumCardsStrategy;
import player.strategy.MaxScoreStrategy;
import utils.EquationComparator;

import java.util.ArrayList;
import java.util.*;
import java.util.Optional;

import static utils.PebbleUtils.convertPebbleListToString;

public class Player implements IPlayer  {

    private static final int ZERO = 0;
    public String name;
    public ArrayList<Equation> eqs;
    private IStrategy strategy;
    private PlayerScore playerScore;
    private Inventory myInventory;
    private ArrayList<Card> myCards;
    boolean pickedPebble;
    ArrayList<Equation> filteredEquations;
    private ArrayList<IPlayer> endGameReport;
    private boolean wonGame;
    private Candidate currentCandidate;
    private IRuleBook ruleBook;
    private String myExn;

    public Player(String name) {
        this.name = name;
        this.playerScore = new PlayerScore(ZERO);
        this.myInventory = new Inventory();
        this.myCards = new ArrayList<>();
        this.ruleBook= new RuleBook();
        myExn="";
    }


    /**
     * Constructor to help initialize player from STDIN user input
     * @param score
     * @param inventory
     * @param name
     */
    public Player(String name,int score, Inventory inventory){
        this.name = name;
        this.playerScore = new PlayerScore(score);
        this.myInventory = inventory;
        this.myCards = new ArrayList<>();
        this.ruleBook= new RuleBook();
        myExn="";

    }


    /**
     * Method calls constructor that takes in score and inventory
     * @param score
     * @param inventory
     * @param name
     * @return
     */
    public static Player initializePlayerWithScoreAndInventory(String name,int score, Inventory inventory){
        return new Player(name,score, inventory);
    }


    /**
     * Part of player API
     * setup by ref
     * @param eqs
     */
    public void setup(ArrayList<Equation> eqs) throws PlayerException {
        if(myExn.equals("setup"))
        {
            throw new PlayerException(name+" failed during setup");
        }
        this.eqs = eqs;
        strategy.setEqs(eqs);
    }

    public void setStrategyType(String stratString) {
        if(stratString.equals("purchase-points")){
            this.strategy = new MaxScoreStrategy(eqs);
        }
        else if(stratString.equals("purchase-size")){
            this.strategy = new MaxNumCardsStrategy(eqs);
        }

    }

    public void setName(String name){
        this.name = name;
    }

    public void setExn(String exn){
        this.myExn = exn;
    }

    /**
     * Satisfy player API logic to request pebble or trades
     *
     * @param s
     * @return
     */
    public PebbleOrExchanges requestPebbleOrTrades(Turn_State s) throws PlayerException {
        ArrayList<Equation> requestedExchanges;
        if(myExn.equals("request-pebble-or-trades")){
            throw new PlayerException(name+" failed during requestPebbleOrTrades");
        }
        filteredEquations= ruleBook.filterEqSet(myInventory.getPebbles(),s.getBankInventory().getPebbles(), eqs);
        if(filteredEquations.isEmpty()){
            pickedPebble=true;
            requestedExchanges = new ArrayList<>();
        }
        else{
            pickedPebble=false;
            findCurrentCandidate(pickedPebble,s);
            requestedExchanges = currentCandidate.getEquationsUsed();
        }

        return new PebbleOrExchanges(pickedPebble,requestedExchanges);
    }

    public SequenceOfCards requestCards(Turn_State s) throws PlayerException {
        if(myExn.equals("request-cards")){
            throw new PlayerException(name+" failed during request Cards");
        }
        if(pickedPebble || currentCandidate == null){
            findCurrentCandidate(pickedPebble,s);
        }
        return new SequenceOfCards(currentCandidate.getCardsBought(), currentCandidate.getTotalPoints(), currentCandidate.getRemainingInventory());

    }

    /**
     * Decide if player should get a pebble or not and then pick best candidate using strategy
     * @return
     */
    public Candidate findCurrentCandidate(boolean pickedPebble, Turn_State s){
        updateStrategyForTurn(s);
        Optional<Candidate> bestCandidateOptional = strategy.getBestCandidate(pickedPebble);
        if(bestCandidateOptional.isEmpty()){
            currentCandidate=new Candidate(new ArrayList<Equation>(),new ArrayList<Card>(),0,myInventory.getPebbles(),0,0);
        }
        else{
            currentCandidate = bestCandidateOptional.get();
        }
        return currentCandidate;
    }

    /**
     * gives strategy updated turn state
     * @param turnState
     */
    public void updateStrategyForTurn(Turn_State turnState) {
        // Create a copy of the visible cards
        ArrayList<Card> cards = new ArrayList<>(turnState.getVisibleCards());

        // Create a deep copy of the bank inventory
        Inventory bank = new Inventory(turnState.getBankInventory().getPebbles());

        // Create a deep copy of my inventory
        Inventory myInventoryCopy = new Inventory(myInventory.getPebbles());

        // Update the strategy with the copies
        strategy.updateStrategy(myInventoryCopy, cards, bank);
    }



    public Inventory getInventory() {
        return myInventory;
    }

    public String getName() {
        return name;
    }

    public ArrayList<Card> getMyCards() {

        return myCards;
    }

    public void setEndGameReport(ArrayList<IPlayer> rank)
    {
        endGameReport = rank;
    }

    public void win(boolean b) throws PlayerException {
        if(myExn.equals("win"))
        {
            throw new PlayerException(name+" failed during win");
        }
        wonGame=b;
    }

    public PlayerScore getPlayerScore() {return playerScore;}

    public void updateScore(int points){
        int intScore= playerScore.getScore();
        playerScore.updateScore(intScore +points);
    }

    public String toString(){
        String playerInventoryString = convertPebbleListToString(myInventory.getPebbles());
        return playerScore.getScore() +","+playerInventoryString;
    }

    public int getScore(){
        return playerScore.getScore();
    }

    public boolean isPickedPebble(){
        return pickedPebble;
    }
    public Candidate getCurrentCandidate(){
        return currentCandidate;
    }

    public boolean equals(IPlayer p){
        return this.name.equals(p.getName());
    }

}
