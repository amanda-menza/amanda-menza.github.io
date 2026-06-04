import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Keep critical code style rules
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      
      // Disable all TypeScript warnings
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      
      // TypeScript specific rules
      "@typescript-eslint/explicit-function-return-type": "off", // Too verbose
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React specific rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "warn", // Downgraded from error
      "react-hooks/exhaustive-deps": "off", // Disabled dependency warnings
      
      // Disable other common warnings
      "no-unused-vars": "off",
      "no-console": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;

