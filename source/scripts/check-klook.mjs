// Fails the build if any hand-built Klook URL (tp.media redirect to klook.com, or a raw klook.com search) is in dist.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const bad = /tp\.media\/r\?[^"'\s<]*trs=588978|https?:\/\/www\.klook\.com\/[^"'\s<]*search/;
const hits = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|json|js|xml|txt)$/.test(f) && bad.test(readFileSync(p, 'utf8'))) hits.push(p);
  }
})('dist');
if (hits.length) {
  console.error(`check-klook failed: ${hits.length} files with hand-built Klook URLs`);
  for (const h of hits.slice(0, 60)) console.error('  ' + h);
  process.exit(1);
}
console.log('check-klook ok (0 hand-built Klook URLs)');
