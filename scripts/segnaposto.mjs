/**
 * Elenca tutti i segnaposto [IN_MAIUSCOLO] rimasti nel progetto, file per file,
 * e rigenera la sezione automatica di DA_COMPILARE.md.  Uso: npm run segnaposto
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const radice = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cartelle = ['src', 'astro.config.ts'];
const escludi = ['src/data/oggetti.ts'];
const RE = /\[[A-Z][A-Z0-9_:]*\]/g;
const file = [];
const visita = (p) => {
  const st = statSync(p);
  if (st.isDirectory()) readdirSync(p).forEach((f) => visita(path.join(p, f)));
  else if (/\.(ts|astro|md|json|mjs)$/.test(p)) file.push(p);
};
cartelle.forEach((c) => visita(path.join(radice, c)));

const righe = [];
let totale = 0;
for (const f of file.sort()) {
  const rel = path.relative(radice, f);
  if (escludi.includes(rel)) continue;
  const trovati = new Map();
  readFileSync(f, 'utf8')
    .split('\n')
    .forEach((riga, i) => {
      for (const m of riga.matchAll(RE)) {
        if (!trovati.has(m[0])) trovati.set(m[0], []);
        trovati.get(m[0]).push(i + 1);
      }
    });
  if (!trovati.size) continue;
  righe.push(`\n### \`${rel}\`\n`);
  for (const [s, linee] of [...trovati].sort()) {
    totale++;
    righe.push(`- \`${s}\` — righe ${linee.join(', ')}`);
  }
}
const intro = readFileSync(path.join(radice, 'DA_COMPILARE.md'), 'utf8').split(
  '<!-- ELENCO-AUTOMATICO -->',
)[0];
writeFileSync(
  path.join(radice, 'DA_COMPILARE.md'),
  `${intro}<!-- ELENCO-AUTOMATICO -->\n\n## Elenco automatico dei segnaposto (${totale} occorrenze per file)\n\nGenerato da \`npm run segnaposto\` il ${new Date().toISOString().slice(0, 10)}.\n${righe.join('\n')}\n`,
);
console.log(`Segnaposto trovati: ${totale}`);
