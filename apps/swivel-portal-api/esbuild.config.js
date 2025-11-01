const glob = require('glob');
const path = require('path');

const src = path.resolve('./apps/swivel-portal-api/src/functions');

/**
 * Extract all the ts files from the src directory
 * @returns Entries for esbuild
 */
const entries = () => {
  const files = glob.sync(`${src}/**/*`);

  return files.filter((file) => file.indexOf('.ts') > -1);
};

require('esbuild').build({
  entryPoints: entries(),
  bundle: true,
  outdir: './apps/swivel-portal-api/dist',
  platform: 'node',
  target: 'node22',
  minifyWhitespace: true,
  minifyIdentifiers: false,
  minifySyntax: true,
  external: ['mongoose'],
});
