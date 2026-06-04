package xturn;
import org.junit.platform.console.ConsoleLauncher;

public class Turn_StateTestConsoleLauncher {
    public static void main(String[] args) {
        System.setProperty("test.path", "Bazaar/");
        String[] launcherArgs = {
                "--select-class", "xturn.Turn_StateTest"  // Specify the class to run
        };

        ConsoleLauncher.main(launcherArgs);
    }
}