import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Three kinds of JavaScript live in this repo and they need different globals:
// the browser app under `src`, Node ESM tooling, and a couple of CommonJS
// generator scripts. Linting all three as browser code was the source of the
// long-standing `'process' is not defined` noise.

// Node ESM: `type: module`, run with `node`, no DOM.
const NODE_ESM = ['content-pipeline/**/*.js', 'api/**/*.js', 'scripts/**/*.js']

// CommonJS: `require`/`module.exports`.
const NODE_CJS = ['cv/**/*.js', '**/*.cjs']

export default defineConfig([
  globalIgnores([
    'dist',
    // Retired code kept for reference only.
    'src/_archive',
    // Vercel build output. Gitignored, but flat-config ESLint does not read
    // .gitignore, so it has to be excluded here too — it is generated bundles,
    // not source, and accounted for most of the repo's lint errors.
    '.vercel',
    // Vendored third-party skills. Not ours to fix; see CLAUDE.md.
    '.claude',
  ]),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  {
    files: NODE_ESM,
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
      ecmaVersion: 2023,
    },
    // React rules do not apply to command-line tooling.
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  {
    files: NODE_CJS,
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
      ecmaVersion: 2023,
    },
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
