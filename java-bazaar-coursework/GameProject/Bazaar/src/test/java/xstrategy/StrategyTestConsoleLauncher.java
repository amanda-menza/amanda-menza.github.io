package xstrategy;

import org.junit.platform.console.ConsoleLauncher;

public class StrategyTestConsoleLauncher {
    public static void main(String[] args) {
        System.setProperty("test.path", "Bazaar/");
        String[] launcherArgs = {
                "--select-class", "xstrategy.StrategyTest"  // Specify the class to run
        };

        ConsoleLauncher.main(launcherArgs);
    }
}
