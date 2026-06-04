import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true, // Enables global variables (like expect)
    setupFiles: "./setupTests.ts",
    reporters: "verbose", // ensures more detailed output
    // Ensure logs are captured
    onConsoleLog(log) {
      console.log(log);
    },
  },
});
