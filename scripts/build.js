import path from 'path';
import esbuild from 'esbuild';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

esbuild.build({
  entryPoints: [path.join(__dirname, '../src/index.js')],
  format: 'esm',
  bundle: true,
  platform: 'node',
  outfile: path.join(__dirname, '../dist/esm/index.js'),
  external: ['@fastify/busboy'],
});

esbuild.build({
  entryPoints: [path.join(__dirname, '../src/index.js')],
  format: 'cjs',
  bundle: true,
  platform: 'node',
  outfile: path.join(__dirname, '../dist/cjs/index.js'),
  external: ['@fastify/busboy'],
});
