import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts', // Cambia aquí si tu entrypoint es otro
  output: {
    file: 'dist/httplazy.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })],
  external: [], // Puedes agregar dependencias externas aquí si no quieres incluirlas en el bundle
};
