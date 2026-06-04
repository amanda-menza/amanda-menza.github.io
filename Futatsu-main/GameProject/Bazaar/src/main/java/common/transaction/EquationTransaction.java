package common.transaction;

import common.Equation;
import common.Inventory;

public class EquationTransaction implements ITransaction {

    private Equation eq;
    private Inventory sender;
    private Inventory receiver;


    /**
     * sender will send the left side of the equation to the reciever, and the reciever will send the right side of the equation to the sender
     * @param eq
     * @param sender
     * @param receiver
     */
    public EquationTransaction(Equation eq, Inventory sender, Inventory receiver){
        this.eq = eq;
        this.sender = sender;
        this.receiver = receiver;
    }


    public Boolean execute() {

        if (eq.playerCanUseLeftSide(sender.getPebbles(),receiver.getPebbles())){
            sender.removePebbles(eq.getLeftSide());
            receiver.addPebbles(eq.getLeftSide());
            receiver.removePebbles(eq.getRightSide());
            sender.addPebbles(eq.getRightSide());
            return true;
        }else {
            return false;
        }
    }

}
