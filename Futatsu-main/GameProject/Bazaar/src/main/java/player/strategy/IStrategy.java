package player.strategy;

import common.Card;
import common.Equation;
import common.Inventory;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Optional;

public interface IStrategy {

    public Optional<Candidate> getBestCandidate(Boolean pickedPebble);
    public void updateStrategy(Inventory inventory, ArrayList<Card> cards, Inventory bankInventory);
    public void setEqs(ArrayList<Equation> eqs);

}