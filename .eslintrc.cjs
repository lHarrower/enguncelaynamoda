/* eslint-env node */
module.exports = {
  root: true,
  env: { es2023: true, node: true, jest: true, 'react-native/react-native': true, browser: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.app.json", "./tsconfig.test.json", "./tsconfig.json"],
    noWarnOnMultipleProjects: true
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "react-native",
    "import",
    "unused-imports",
    "simple-import-sort",
    "prettier"
  ],
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { project: ["./tsconfig.app.json", "./tsconfig.test.json", "./tsconfig.json"] }
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    // react-native plugin does not provide a "recommended" config in our version; rely on explicit rule tuning below
    // "plugin:react-native/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "warn",
    "@typescript-eslint/no-unused-vars": "off",

    // Import plugin adjustments for TS monorepo + path aliases
    "import/no-unresolved": "off",
    "import/named": "off",

    // keep autofixable but do not fail builds
    "unused-imports/no-unused-imports": "warn",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    // ensure prettier reports do not fail builds
    "prettier/prettier": "warn",

    // keep unsafe-* as warnings for visibility without breaking builds
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-explicit-any": "warn",

    // demote noisy errors to warnings for initial cleanup phase
    "@typescript-eslint/no-var-requires": "warn",
    "no-empty": ["warn", { "allowEmptyCatch": true }],
    "@typescript-eslint/ban-ts-comment": [
      "warn",
      { "ts-expect-error": "allow-with-description", "minimumDescriptionLength": 3 }
    ],
    "no-useless-catch": "warn",
    "no-case-declarations": "warn",

    // Treat hooks violations as errors and include Reanimated hooks
    "react-hooks/rules-of-hooks": [
      "error",
      {
        additionalHooks:
          "(useAnimatedStyle|useDerivedValue|useAnimatedReaction|useAnimatedScrollHandler|useAnimatedRef|useAnimatedGestureHandler|useSharedValue)"
      }
    ],
    // Validate dependencies for custom effect-like hooks from Reanimated
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "(useAnimatedStyle|useDerivedValue|useAnimatedReaction)"
      }
    ],

    // relax some noisy react-native rules
    "react-native/no-unused-styles": "off",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",

    // common project-wide policies
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-void": "warn",
    "react/no-unstable-nested-components": "warn",
    "import/no-named-as-default-member": "warn"
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "__tests__/**"],
      rules: {
        "react-native/no-unused-styles": "off",
        "react-native/split-platform-components": "off",
        "no-console": "off"
      }
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        // allow TS overload signatures without triggering core rule
        "no-dupe-class-members": "off"
      }
    },
    {
      files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
      parser: "espree",
      parserOptions: { 
        project: null,
        ecmaVersion: "latest",
        sourceType: "module"
      },
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/ban-ts-comment": "off"
      }
    }
  ],
  ignorePatterns: [
    "supabase/functions/**",
    "_screens_legacy/**",
    "jest.env.js",
    "lighthouserc.js",
    "ops/scripts/**",
    "scripts/**/*.js",
    "scripts/**/*.ts",
    "scripts/audit/**",
    "node_modules/**",
    "dist/**",
    "build/**",
    "components/**",
    "__mocks__/**",
    "@types/**"
  ]
};
