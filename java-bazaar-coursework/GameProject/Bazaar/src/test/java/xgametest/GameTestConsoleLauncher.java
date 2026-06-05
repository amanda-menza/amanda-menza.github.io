package xgametest;
import org.junit.platform.console.ConsoleLauncher;

public class GameTestConsoleLauncher {
    public static void main(String[] args) {
        System.setProperty("test.path", "Bazaar/");
        String[] launcherArgs = {
                "--select-class", "xgametest.GameTest"  // Specify the class to run
        };

        ConsoleLauncher.main(launcherArgs);
    }
}