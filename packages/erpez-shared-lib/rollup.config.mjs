import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import dts from 'rollup-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const aliasConfig = {
  entries: [
    { find: '@', replacement: path.resolve(__dirname, 'src') }
  ]
};

export default [
  // Main build for JS
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/erpez-shared-lib.cjs.js",
        format: "cjs",
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: "dist/erpez-shared-lib.esm.js",
        format: "esm",
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      alias(aliasConfig),
      nodeResolve(),
      commonjs(),
      typescript({
        declaration: false, // Disable inline declarations
        rootDir: './src',
      }),
      terser()
    ],
    external: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "axios",
    ],
  },
  // Separate build for type declarations
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [
      alias(aliasConfig),
      dts()
    ],
    external: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "axios",
      "@tanstack/react-table",
    ],
  }
];
