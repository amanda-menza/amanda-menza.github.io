package referee;

import common.Card;
import common.Equation;
import utils.CardComparator;
import utils.EquationComparator;

import java.util.*;

public class GameBoard {

    private static final ResourceBundle RNG_BUNDLE = ResourceBundle.getBundle("RNG/rng");


    private final int ZERO = Integer.parseInt(RNG_BUNDLE.getString("ZERO"));
    private final int NUM_VISIBLE_CARDS=Integer.parseInt(RNG_BUNDLE.getString("NUM_VISIBLE_CARDS"));
    private final int NUM_TOTAL_CARDS=Integer.parseInt(RNG_BUNDLE.getString("NUM_TOTAL_CARDS"));
    private final int NUM_EQUATIONS=10;

    public ArrayList<Equation> equations;
    private ArrayList<Card> cards;
    private ArrayList<Card> invisibleCards;
    public ArrayList<Card> visibleCards;

    public GameBoard() {
        equations = initializeEquations();
        cards = initializeCards();
        visibleCards = new ArrayList<>(cards.subList(ZERO,NUM_VISIBLE_CARDS));
        invisibleCards = new ArrayList<>(cards.subList(NUM_VISIBLE_CARDS,NUM_TOTAL_CARDS));
    }

    /**
     * Constructor made for xturn tests to simulate game board from user input
     * @param invisibleCardList
     * @param visibleCardList
     */
    public GameBoard(ArrayList<Card> invisibleCardList, ArrayList<Card> visibleCardList) {
        equations = initializeEquations();
        visibleCards = visibleCardList;
        invisibleCards=invisibleCardList;
        cards = new ArrayList<>(visibleCardList);
        cards.addAll(invisibleCardList);
    }

    /**
     * Constructor used in GameTest
     * @param invisibleCardList
     * @param visibleCardList
     * @param equations
     */
    public GameBoard(ArrayList<Card> invisibleCardList, ArrayList<Card> visibleCardList, ArrayList<Equation> equations) {
        this.equations = equations;
        visibleCards = visibleCardList;
        invisibleCards=invisibleCardList;
        cards = new ArrayList<>(visibleCardList);
        cards.addAll(invisibleCardList);
    }

    /**
     * Method to call constructor for xturn STDIN with initial cards
     * @param invisibleCardList
     * @param visibleCardList
     * @return
     */
    public static GameBoard initializeGameBoardWithCardLists(ArrayList<Card> invisibleCardList, ArrayList<Card> visibleCardList){
        return new GameBoard(invisibleCardList, visibleCardList);
    }

    /**
     * initialize gameboard with cards and eqs
     * @param invisibleCardList
     * @param visibleCardList
     * @return
     */
    public static GameBoard initializeGameBoardWithCardListsAndEquations(ArrayList<Card> invisibleCardList, ArrayList<Card> visibleCardList, ArrayList<Equation> equations){
        return new GameBoard(invisibleCardList, visibleCardList,equations);
    }

    /**
     * Initializes the equations for the game
     * @return ArrayList of equations
     */
    public ArrayList<Equation> initializeEquations() {
        ArrayList<Equation> equations = new ArrayList<>();
        EquationComparator equationComparator = new EquationComparator();
        for(int i=0;i<NUM_EQUATIONS;i++)
        {
            Equation equation = new Equation();
            if(equations.stream().anyMatch(existingCard -> equationComparator.compare(existingCard, equation) == 0))
            {
                i--;
            }
            else{
                equations.add(equation);
            }
        }

        return equations;
    }

    /**
     * Initializes the invisible cards for the game
     * @return ArrayList of invisible cards
     */
    public ArrayList<Card> initializeCards() {
        ArrayList<Card> cards = new ArrayList<>();
        CardComparator cardComparator = new CardComparator();
        for(int i=0;i<NUM_TOTAL_CARDS;i++)
        {
            Card card = new Card();
            if(cards.stream().anyMatch(existingCard -> cardComparator.compare(existingCard, card) == 0))
            {
                i--;
            }
            else{
                cards.add(card);
            }
        }
        return cards;
    }

    public ArrayList<Card> getInvisibleCards() {
        return invisibleCards;
    }

}
