package xturn;

public class Turn_StateTestLauncher {
    public static void main(String[] args) {
        boolean allTestsPassed = true;
        System.setProperty("test.path", "Bazaar/");

        // Run test 0
        try {
            System.out.println("Running testTurnState0...");
            Turn_StateTest test = new Turn_StateTest();
            test.testTurnState0();
            System.out.println("testTurnState0 passed.");
        } catch (Exception e) {
            allTestsPassed = false;
            System.out.println("testTurnState0 failed: " + e.getMessage());
        }

        // Run test 1
        try {
            System.out.println("Running testTurnState1...");
            Turn_StateTest test = new Turn_StateTest();
            test.testTurnState1();
            System.out.println("testTurnState1 passed.");
        } catch (Exception e) {
            allTestsPassed = false;
            System.out.println("testTurnState1 failed: " + e.getMessage());
        }

        // Run test 2
        try {
            System.out.println("Running testTurnState2...");
            Turn_StateTest test = new Turn_StateTest();
            test.testTurnState2();
            System.out.println("testTurnState2 passed.");
        } catch (Exception e) {
            allTestsPassed = false;
            System.out.println("testTurnState2 failed: " + e.getMessage());
        }

        // Print overall result
        if (allTestsPassed) {
            System.out.println("All tests passed!");
        } else {
            System.out.println("Some tests failed.");
        }
    }
}

