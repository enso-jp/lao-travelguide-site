// Fails if any Trip.com hotel link in dist carries a keyword= parameter (hand-built search).
// Scope: trip.com/hotels/ links only. Airport-transfer links (generated transfer map) are out of scope.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';


const re = /https?:\/\/(?:[a-z]+\.)?trip\.com\/hotels\/[^"'\s<>]*/gi;
const hits = new Map();
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|json|js|xml|txt)$/.test(f)) {
      for (const raw of readFileSync(p, 'utf8').match(re) || []) {
        const url = raw.replace(/&amp;/g, '&');
        if (!/[?&]keyword=/.test(url)) continue;
        hits.set(p, (hits.get(p) || 0) + 1);
      }
    }
  }
})('dist');
if (hits.size) {
  console.error(`check-trip-keyword failed: ${hits.size} files with Trip.com hotel keyword= links`);
  for (const [p, n] of [...hits].slice(0, 40)) console.error(`  ${p} (${n})`);
  process.exit(1);
}
console.log('check-trip-keyword ok (0 Trip.com hotel keyword= links)');
