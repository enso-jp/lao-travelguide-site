import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const require = createRequire(join(ROOT, 'package.json'));
const esbuild = await import(pathToFileURL(require.resolve('esbuild')).href);
const dir = mkdtempSync(join(tmpdir(), 'ttg-sent-'));
const outfile = join(dir, 'bundle.mjs');

try {
  await esbuild.build({
    entryPoints: [join(ROOT, 'src/lib/seo.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  const { splitSentences } = await import(pathToFileURL(outfile).href);
  const coast = splitSentences('Long coast. Next sentence.');
  const abb = splitSentences('Wat No. 5 is near St. Louis.');
  const errors = [];
  if (coast.length !== 2) {
    errors.push(`"Long coast. Next sentence." should split into 2, got ${coast.length}: ${JSON.stringify(coast)}`);
  }
  if (abb.length !== 1) {
    errors.push(`"Wat No. 5 is near St. Louis." should stay 1, got ${abb.length}: ${JSON.stringify(abb)}`);
  }
  if (errors.length) {
    console.error(`check:sentences failed (${errors.length})`);
    for (const err of errors) console.error(`  ${err}`);
    process.exit(1);
  }
  console.log('check:sentences ok (coast splits to 2, No./St. stay 1)');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
