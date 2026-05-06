/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier",
  ],
  overrides: [
    {
      files: ["cypress/e2e/**.{cy,spec}.{js,ts,jsx,tsx}"],
      extends: ["plugin:cypress/recommended"],
      rules: {
        "cypress/no-unnecessary-waiting": "off",
        "cypress/unsafe-to-chain-command": "off",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
};
