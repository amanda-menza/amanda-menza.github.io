package xrules;
import org.junit.platform.console.ConsoleLauncher;

public class RuleValidationTestConsoleLauncher {
    public static void main(String[] args) {
        System.setProperty("test.path", "Bazaar/");
        String[] launcherArgs = {
                "--select-class", "xrules.RuleValidationTest"  // Specify the class to run
        };

        ConsoleLauncher.main(launcherArgs);
    }
}