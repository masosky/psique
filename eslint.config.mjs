// eslint-config-next ya exporta flat config nativa, así que no hace falta el
// shim FlatCompat de eslintrc (que además revienta con ESLint 9+).
import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...next,
  prettier,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "lib/generated/**",
    ],
  },
];

export default eslintConfig;
