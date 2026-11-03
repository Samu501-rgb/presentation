/**
 * Genera le immagini Open Graph (1200×630) di ogni pagina in public/og/, più le
 * tre immagini del JSON-LD (negozio-1x1, 4x3, 16x9) finché non arrivano le foto reali.
 * Usa Chromium (Playwright) con i font self-hosted del sito: nessuna rete.
 *
 * Uso: npm run og   (rilanciare dopo aver aggiunto reparti o prodotti)
 */
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Serve Playwright: npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(radice, 'public/og');
mkdirSync(out, { recursive: true });
// Font incorporati in base64: setContent non può leggere file:// locali.
const font = (f) =>
  `data:font/woff2;base64,${readFileSync(path.join(radice, 'src/assets/fonts', f)).toString('base64')}`;
const sprite = readFileSync(path.join(radice, 'public/oggetti.svg'), 'utf8').replace(
  '<svg',
  '<svg style="display:none"',
);

const COLORI = {
  limone: '#F3C548',
  pomodoro: '#D9411E',
  mare: '#9CCFD8',
  bonifica: '#24594B',
  argilla: '#E9DCC8',
};
const TINTE = {
  rosso: '#D9411E',
  giallo: '#F3C548',
  azzurro: '#9CCFD8',
  verde: '#24594B',
  bianco: '#F5EFE4',
};

const frontmatter = (testo) => {
  const fm = testo.split('---')[1];
  const get = (k) =>
    fm
      .match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]
      ?.trim()
      .replace(/^"|"$/g, '');
  return {
    titolo: get('titolo'),
    colore: get('colore'),
    oggetti: get('oggetti')
      ?.replace(/[[\]]/g, '')
      .split(',')
      .map((s) => s.trim()),
  };
};

const reparti = readdirSync(path.join(radice, 'src/content/reparti')).map((f) => ({
  slug: f.replace('.md', ''),
  ...frontmatter(readFileSync(path.join(radice, 'src/content/reparti', f), 'utf8')),
}));
const prodotti = readdirSync(path.join(radice, 'src/content/prodotti')).map((f) => ({
  slug: f.replace('.json', ''),
  ...JSON.parse(readFileSync(path.join(radice, 'src/content/prodotti', f), 'utf8')),
}));

const pagine = [
  {
    chiave: 'home',
    titolo: 'Tutto per la casa. A due passi.',
    sfondo: 'limone',
    oggetti: [
      ['moka', 'rosso'],
      ['piatto', 'azzurro'],
      ['lampadina', 'giallo'],
    ],
  },
  {
    chiave: 'reparti',
    titolo: 'Lo scaffale infinito.',
    sfondo: 'mare',
    oggetti: [
      ['pentola', 'verde'],
      ['cestino', 'giallo'],
      ['tazza', 'rosso'],
    ],
  },
  {
    chiave: 'te-lo-troviamo',
    titolo: 'Lo cerchi? Te lo troviamo.',
    sfondo: 'mare',
    oggetti: [
      ['regalo', 'rosso'],
      ['lampadina', 'giallo'],
      ['barattolo', 'verde'],
    ],
  },
  {
    chiave: 'offerte',
    titolo: 'Questo mese in negozio.',
    sfondo: 'limone',
    oggetti: [
      ['spugna', 'giallo'],
      ['strofinaccio', 'rosso'],
      ['piatto', 'azzurro'],
    ],
  },
  {
    chiave: 'negozio',
    titolo: 'Il bazar sotto casa.',
    sfondo: 'bonifica',
    oggetti: [
      ['cestino', 'giallo'],
      ['moka', 'rosso'],
      ['vaso', 'azzurro'],
    ],
  },
  {
    chiave: 'contatti',
    titolo: 'Scrivici, chiamaci, passa.',
    sfondo: 'argilla',
    oggetti: [
      ['tazza', 'rosso'],
      ['candela', 'azzurro'],
      ['presa', 'giallo'],
    ],
  },
  ...reparti.map((r) => ({
    chiave: `reparto-${r.slug}`,
    titolo: `${r.titolo} a Latina`,
    sfondo: r.colore,
    oggetti: r.oggetti.slice(0, 3).map((o, i) => [o, ['rosso', 'giallo', 'azzurro'][i]]),
  })),
  ...prodotti.map((p) => ({
    chiave: `prodotto-${p.slug}`,
    titolo: p.nome,
    sfondo: p.colore === 'giallo' ? 'mare' : 'limone',
    oggetti: [[p.illustrazione, p.colore]],
  })),
];

const html = (p, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url(${font('bricolage-grotesque-latin-wght-normal.woff2')});font-weight:200 800}
@font-face{font-family:I;src:url(${font('instrument-sans-latin-wght-normal.woff2')});font-weight:400 700}
*{margin:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;background:#F5EFE4;color:#1F1A17;font-family:I,sans-serif;position:relative;overflow:hidden}
.t{position:absolute;left:64px;top:72px;width:${Math.round(w * 0.56)}px;font-family:B;font-weight:800;font-size:${w > h * 1.5 ? 92 : 104}px;line-height:.9;letter-spacing:-.045em}
.s{position:absolute;left:64px;bottom:118px;font-size:28px;font-weight:600}
.l{position:absolute;left:64px;bottom:52px;font-family:B;font-weight:800;font-size:44px;letter-spacing:-.04em}
.l i{display:inline-block;width:12px;height:12px;border-radius:50%;background:#D9411E;margin:0 4px 6px}
.c{position:absolute;right:-${Math.round(h * 0.12)}px;top:50%;transform:translateY(-50%);width:${Math.round(h * 0.95)}px;height:${Math.round(h * 0.95)}px;border-radius:50%;background:${COLORI[p.sfondo] ?? COLORI.limone}}
.o{position:absolute;width:${Math.round(h * 0.42)}px;height:${Math.round(h * 0.42)}px}
.r{position:absolute;right:56px;top:48px;font-weight:700;font-size:20px;letter-spacing:.08em;text-transform:uppercase}
</style></head><body>${sprite}
<div class="c"></div>
${p.oggetti
  .map(([o, c], i) => {
    const pos =
      p.oggetti.length === 1
        ? `right:${Math.round(h * 0.18)}px;top:${Math.round(h * 0.2)}px;width:${Math.round(h * 0.6)}px;height:${Math.round(h * 0.6)}px`
        : [
            `right:${Math.round(h * 0.32)}px;top:${Math.round(h * 0.36)}px`,
            `right:${Math.round(h * 0.05)}px;top:${Math.round(h * 0.12)}px;transform:rotate(10deg)`,
            `right:${Math.round(h * 0.1)}px;top:${Math.round(h * 0.52)}px;transform:rotate(-8deg)`,
          ][i];
    return `<svg class="o" viewBox="0 0 200 200" style="${pos};--t1:${TINTE[c] ?? c}"><use href="#${o}"/></svg>`;
  })
  .join('')}
<div class="t">${p.titolo}</div>
<div class="s">Bazar e casalinghi a Latina Est · di fronte alla farmacia</div>
<div class="l">Gino<i></i>Casa</div>
</body></html>`;

const browser = await chromium.launch();
const pagina = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of pagine) {
  await pagina.setContent(html(p, 1200, 630), { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(out, `${p.chiave}.jpg`), type: 'jpeg', quality: 82 });
}
// Immagini per il JSON-LD: segnaposto finché non ci sono foto reali del negozio.
for (const [nome, w, h] of [
  ['negozio-1x1', 1200, 1200],
  ['negozio-4x3', 1200, 900],
  ['negozio-16x9', 1200, 675],
]) {
  await pagina.setViewportSize({ width: w, height: h });
  await pagina.setContent(html(pagine[0], w, h), { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: path.join(out, `${nome}.jpg`), type: 'jpeg', quality: 82 });
}
await browser.close();
console.log(`Immagini OG generate: ${pagine.length + 3}`);
