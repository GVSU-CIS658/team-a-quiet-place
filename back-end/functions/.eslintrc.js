module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*",
    "/generated/**/*",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // style
    "quotes": ["error", "double"],
    "indent": "off",
    "object-curly-spacing": ["error", "always"],
    "eol-last": "off",

    // imports
    "import/no-unresolved": 0,

    // typescript tweaks
    "@typescript-eslint/no-unused-vars": "warn",
  },
};