import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["game/dist/**", "game/node_modules/**", "node_modules/**", "output/**", "test-artifacts/**", "tmp/**"]
  },
  js.configs.recommended,
  {
    files: ["scripts/**/*.{js,mjs}", "tests/**/*.{js,mjs}", "game/vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2024 }
    },
    rules: {
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
    }
  },
  {
    files: ["game/src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2024 }
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-empty": ["error", { "allowEmptyCatch": true }],
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
    }
  },
  {
    files: ["tests/floating-entry.test.mjs", "tests/i18n.test.mjs"],
    rules: { "no-control-regex": "off" }
  }
];
