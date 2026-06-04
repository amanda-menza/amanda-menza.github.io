package xeq;

public class EquationExchangeTestLauncher {
    public static void main(String[] args) {
        boolean allTestsPassed = true;
        System.setProperty("test.path", "Bazaar/");

        // Run test 0
        try {
            System.out.println("Running testEquationExchange0...");
            EquationExchangeTest test = new EquationExchangeTest();
            test.testEquationExchange0();
            System.out.println("testEquationExchange0 passed.");
        } catch (Exception e) {
            allTestsPassed = false;
            System.out.println("testEquationExchange0 failed: " + e.getMessage());
        }

        // Run test 1
        try {
            System.out.println("Running testEquationExchange1...");
            EquationExchangeTest test = new EquationExchangeTest();
            test.testEquationExchange1();
            System.out.println("testEquationExchange1 passed.");
        } catch (Exception e) {
            allTestsPassed = false;
            System.out.println("testEquationExchange1 failed: " + e.getMessage());
        }

        // Run test 2
        try {
            System.out.println("Running testEquationExchange2...");
            EquationExchangeTest test = new EquationExchangeTest();
            test.testEquationExchange2();
            System.out.println("testEquationExchange2 passed.");
        } catch (Exception e) {
            allTestsPassed = false;
            System.out.println("testEquationExchange2 failed: " + e.getMessage());
        }

        // Print overall result
        if (allTestsPassed) {
            System.out.println("All tests passed!");
        } else {
            System.out.println("Some tests failed.");
        }
    }
}
