module.exports = {
  root: true,
  extends: [
    "@react-native/eslint-config/strict",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  env: {
    browser: true,
    es2021: true,
    "react-native/react-native": true,
  },
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  rules: {
    "react/react-in-jsx-scope": "off", // Not needed with new jsx transform
    "react-hooks/exhaustive-deps": "warn",
  },
}; 