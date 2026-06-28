import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/artifacts/**",
      "**/archive/**",
      "**/.turbo/**",
      "**/graphify-out/**",
      "test-browser.*",
      "apps/test-app/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "prefer-const": "off",
      "no-useless-assignment": "off",
      "no-empty": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-expressions": "off"
    }
  }
);
