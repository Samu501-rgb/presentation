/**
 * Genera public/oggetti.svg: lo sprite delle illustrazioni piatte degli oggetti.
 * Sono segnaposto onesti (non foto) disegnati nella palette del sito, finché
 * non arrivano gli scatti reali in negozio.
 *
 * Ogni simbolo usa due tinte personalizzabili dal CSS del <use>:
 *   --t1 (colore principale)  --t2 (colore secondario)
 * Uso:  node scripts/genera-sprite.mjs
 */
import { writeFileSync } from 'node:fs';

const INK = '#1F1A17';
const CARTA = '#F5EFE4';
const t1 = (d) => `fill:var(--t1,${d})`;
const t2 = (d) => `fill:var(--t2,${d})`;
const f = (c) => `fill:${c}`;
const ombra =
  '<ellipse cx="100" cy="188" rx="62" ry="7" style="fill:#1F1A17;opacity:.12;stroke:none"/>';

/** Ogni oggetto: [id, titolo, markup]. Tratto inchiostro 5px applicato dal gruppo. */
const oggetti = [
  [
    'moka',
    'Moka',
    `${ombra}
    <path d="M66 112h68l-10 -64h-48z" style="${t1('#D9411E')}"/>
    <path d="M70 120h60l12 64H58z" style="${t1('#D9411E')}"/>
    <rect x="72" y="110" width="56" height="12" rx="3" style="${f(INK)}"/>
    <path d="M74 48h52l-8 -14H82z" style="${t2('#F3C548')}"/>
    <circle cx="100" cy="26" r="7" style="${f(INK)}"/>
    <path d="M70 52l-22 -8l14 26z" style="${t1('#D9411E')}"/>
    <path d="M128 58c30 2 32 44 4 48" style="fill:none;stroke-width:12"/>
    <path d="M86 70v28" style="fill:none;stroke:${CARTA};stroke-width:6;opacity:.7"/>`,
  ],
  [
    'piatto',
    'Piatto',
    `${ombra}
    <circle cx="100" cy="100" r="82" style="${f(CARTA)}"/>
    <circle cx="100" cy="100" r="58" style="${t1('#9CCFD8')}"/>
    <circle cx="100" cy="100" r="34" style="${f(CARTA)};stroke-dasharray:6 8"/>
    <path d="M52 64a58 58 0 0 1 30 -20" style="fill:none;stroke:${CARTA};stroke-width:7"/>`,
  ],
  [
    'tazza',
    'Tazza',
    `${ombra}
    <ellipse cx="100" cy="176" rx="74" ry="12" style="${t2('#F3C548')}"/>
    <path d="M48 92h104l-10 74H58z" style="${t1('#D9411E')}"/>
    <path d="M150 104c30 -4 30 40 -6 44" style="fill:none;stroke-width:11"/>
    <ellipse cx="100" cy="92" rx="52" ry="9" style="${f('#5E3A26')}"/>
    <path d="M84 60c-8 -10 8 -16 0 -28M112 62c-8 -10 8 -16 0 -28" style="fill:none;stroke-width:5"/>
    <path d="M66 110v34" style="fill:none;stroke:${CARTA};stroke-width:6;opacity:.7"/>`,
  ],
  [
    'pentola',
    'Pentola',
    `${ombra}
    <rect x="40" y="84" width="120" height="96" rx="14" style="${t1('#24594B')}"/>
    <path d="M40 104H18M160 104h22" style="fill:none;stroke-width:12"/>
    <path d="M34 84c0 -18 132 -18 132 0z" style="${t2('#F3C548')}"/>
    <rect x="88" y="54" width="24" height="14" rx="6" style="${f(INK)}"/>
    <path d="M56 106v52" style="fill:none;stroke:${CARTA};stroke-width:6;opacity:.6"/>`,
  ],
  [
    'bicchiere',
    'Bicchiere',
    `${ombra}
    <path d="M58 36h84l-12 146H70z" style="${f('#FFFFFF')};opacity:.9"/>
    <path d="M64 92h72l-7 90H71z" style="${t1('#9CCFD8')}"/>
    <path d="M58 36h84l-12 146H70z" style="fill:none"/>
    <path d="M76 52l4 100" style="fill:none;stroke:${CARTA};stroke-width:6"/>`,
  ],
  [
    'barattolo',
    'Barattolo',
    `${ombra}
    <rect x="50" y="56" width="100" height="128" rx="22" style="${t1('#9CCFD8')}"/>
    <rect x="44" y="32" width="112" height="30" rx="8" style="${t2('#D9411E')}"/>
    <rect x="66" y="96" width="68" height="44" rx="6" style="${f(CARTA)}"/>
    <path d="M78 112h44M78 126h28" style="fill:none;stroke-width:4"/>`,
  ],
  [
    'candela',
    'Candela',
    `${ombra}
    <path d="M100 18c18 22 14 44 0 44s-18 -22 0 -44z" style="${t2('#F3C548')}"/>
    <path d="M100 38c6 8 5 16 0 16s-6 -8 0 -16z" style="${f('#D9411E')};stroke:none"/>
    <path d="M100 62v12" style="fill:none"/>
    <rect x="72" y="74" width="56" height="96" rx="6" style="${f(CARTA)}"/>
    <path d="M128 92c-10 0 -10 18 0 18" style="${t1('#D9411E')}"/>
    <ellipse cx="100" cy="176" rx="58" ry="12" style="${t1('#D9411E')}"/>`,
  ],
  [
    'cestino',
    'Cestino',
    `${ombra}
    <path d="M58 96c0 -64 84 -64 84 0" style="fill:none;stroke-width:10"/>
    <path d="M30 92h140l-18 90H48z" style="${t1('#F3C548')}"/>
    <path d="M42 120h116M38 146h124M48 92l14 90M80 92l4 90M120 92l-4 90M152 92l-14 90" style="fill:none;stroke-width:4"/>`,
  ],
  [
    'lampadina',
    'Lampadina',
    `${ombra}
    <path d="M100 20a52 52 0 0 1 30 94c-6 6 -8 14 -8 22H78c0 -8 -2 -16 -8 -22a52 52 0 0 1 30 -94z" style="${t1('#F3C548')}"/>
    <rect x="76" y="136" width="48" height="34" rx="6" style="${t2('#E9DCC8')}"/>
    <path d="M76 148h48M76 160h48" style="fill:none;stroke-width:4"/>
    <path d="M92 170h16v12H92z" style="${f(INK)}"/>
    <path d="M88 104l12 -24l12 24" style="fill:none;stroke-width:4"/>
    <path d="M72 58a32 32 0 0 1 18 -18" style="fill:none;stroke:${CARTA};stroke-width:7"/>`,
  ],
  [
    'strofinaccio',
    'Strofinaccio',
    `${ombra}
    <path d="M90 14a10 10 0 1 1 20 0" style="fill:none;stroke-width:5"/>
    <path d="M54 22h92l6 158H48z" style="${f(CARTA)}"/>
    <path d="M52 52h96M52 64h96M50 150h100M50 162h100" style="fill:none;stroke:var(--t1,#D9411E);stroke-width:7"/>
    <path d="M54 22h92l6 158H48z" style="fill:none"/>`,
  ],
  [
    'spugna',
    'Spugna',
    `${ombra}
    <rect x="34" y="96" width="132" height="74" rx="16" style="${t1('#F3C548')}"/>
    <path d="M34 112c0 -14 8 -22 22 -22h88c14 0 22 8 22 22v6H34z" style="${t2('#24594B')}"/>
    <circle cx="66" cy="140" r="5" style="${f(INK)};stroke:none;opacity:.35"/>
    <circle cx="98" cy="150" r="4" style="${f(INK)};stroke:none;opacity:.35"/>
    <circle cx="132" cy="136" r="6" style="${f(INK)};stroke:none;opacity:.35"/>
    <circle cx="144" cy="66" r="10" style="${f('#FFFFFF')};opacity:.8"/>
    <circle cx="160" cy="44" r="6" style="${f('#FFFFFF')};opacity:.8"/>`,
  ],
  [
    'flacone',
    'Flacone',
    `${ombra}
    <path d="M80 30h40v26H80z" style="${t2('#D9411E')}"/>
    <path d="M120 38h22v10h-22" style="${t2('#D9411E')}"/>
    <path d="M66 56h68c10 0 16 8 16 18v100c0 6 -4 10 -10 10H60c-6 0 -10 -4 -10 -10V74c0 -10 6 -18 16 -18z" style="${t1('#9CCFD8')}"/>
    <rect x="66" y="94" width="68" height="56" rx="8" style="${f(CARTA)}"/>
    <path d="M86 122c8 -16 20 -16 28 0" style="fill:none;stroke-width:4"/>`,
  ],
  [
    'presa',
    'Presa multipla',
    `${ombra}
    <path d="M18 150c-14 0 -14 -28 4 -30" style="fill:none;stroke-width:6"/>
    <rect x="22" y="104" width="160" height="58" rx="18" style="${f(CARTA)}"/>
    <circle cx="62" cy="133" r="14" style="${t1('#F3C548')}"/>
    <circle cx="102" cy="133" r="14" style="${t1('#F3C548')}"/>
    <circle cx="142" cy="133" r="14" style="${t1('#F3C548')}"/>
    <path d="M57 133h1M66 133h1M97 133h1M106 133h1M137 133h1M146 133h1" style="fill:none;stroke-width:5"/>
    <rect x="160" y="120" width="14" height="10" rx="3" style="${t2('#D9411E')}"/>`,
  ],
  [
    'cacciavite',
    'Cacciavite',
    `${ombra}
    <path d="M58 168l-14 -14l40 -40l14 14z" style="${t1('#F3C548')}"/>
    <path d="M66 122l12 12M76 112l12 12" style="fill:none;stroke-width:4"/>
    <path d="M94 104l64 -64" style="fill:none;stroke-width:9"/>
    <path d="M152 34l14 -6l-6 14z" style="${f(INK)}"/>
    <path d="M84 112l16 16l-6 6l-16 -16z" style="${t2('#1F1A17')}"/>`,
  ],
  [
    'regalo',
    'Pacco regalo',
    `${ombra}
    <rect x="36" y="86" width="128" height="96" rx="8" style="${t1('#D9411E')}"/>
    <rect x="28" y="66" width="144" height="28" rx="6" style="${t1('#D9411E')}"/>
    <path d="M90 66h20v116H90z" style="${t2('#F3C548')}"/>
    <path d="M100 66c-20 -34 -54 -20 -38 0zM100 66c20 -34 54 -20 38 0z" style="${t2('#F3C548')}"/>`,
  ],
  [
    'asciugamani',
    'Asciugamani',
    `${ombra}
    <rect x="30" y="140" width="140" height="40" rx="14" style="${t1('#24594B')}"/>
    <rect x="38" y="104" width="124" height="38" rx="14" style="${t2('#9CCFD8')}"/>
    <rect x="46" y="70" width="108" height="36" rx="14" style="${f(CARTA)}"/>
    <path d="M58 92h84M50 126h100M42 162h116" style="fill:none;stroke-width:3;stroke-dasharray:4 6"/>`,
  ],
  [
    'dispenser',
    'Dispenser sapone',
    `${ombra}
    <path d="M90 22h44v10h-44z" style="${f(INK)}"/>
    <path d="M90 32h20v28H90z" style="${t2('#E9DCC8')}"/>
    <rect x="80" y="58" width="40" height="18" rx="4" style="${t2('#E9DCC8')}"/>
    <path d="M62 76h76c8 0 12 6 12 14v80c0 8 -6 14 -14 14H64c-8 0 -14 -6 -14 -14V90c0 -8 4 -14 12 -14z" style="${t1('#F3C548')}"/>
    <path d="M70 100v54" style="fill:none;stroke:${CARTA};stroke-width:7;opacity:.8"/>`,
  ],
  [
    'pallina',
    'Pallina di Natale',
    `${ombra}
    <path d="M92 26a8 8 0 1 1 16 0" style="fill:none;stroke-width:5"/>
    <rect x="86" y="30" width="28" height="18" rx="4" style="${t2('#F3C548')}"/>
    <circle cx="100" cy="112" r="68" style="${t1('#D9411E')}"/>
    <path d="M34 100c40 18 92 18 132 0M38 132c40 18 84 18 124 0" style="fill:none;stroke:var(--t2,#F3C548);stroke-width:9"/>
    <path d="M60 78a48 48 0 0 1 22 -20" style="fill:none;stroke:${CARTA};stroke-width:8"/>`,
  ],
  [
    'contenitore',
    'Contenitore',
    `${ombra}
    <rect x="30" y="92" width="140" height="88" rx="14" style="${f('#FFFFFF')};opacity:.85"/>
    <rect x="38" y="122" width="124" height="52" rx="8" style="${t2('#F3C548')}"/>
    <rect x="24" y="76" width="152" height="24" rx="8" style="${t1('#24594B')}"/>
    <path d="M30 88h-10v20h12M170 88h10v20h-12" style="fill:none;stroke-width:5"/>
    <rect x="30" y="92" width="140" height="88" rx="14" style="fill:none"/>`,
  ],
  [
    'mestolo',
    'Mestolo',
    `${ombra}
    <path d="M150 22l-58 104" style="fill:none;stroke-width:12"/>
    <path d="M150 22l-58 104" style="fill:none;stroke:var(--t1,#D9411E);stroke-width:4"/>
    <path d="M44 128c0 34 26 52 52 52s40 -24 40 -40c0 -8 -6 -12 -14 -12z" style="${t2('#E9DCC8')}"/>
    <circle cx="150" cy="22" r="8" style="${f(INK)}"/>`,
  ],
  [
    'vaso',
    'Vaso con fiori',
    `${ombra}
    <path d="M100 116V40M100 116c-6 -30 -30 -40 -44 -42M100 116c8 -26 30 -32 44 -32" style="fill:none;stroke:#24594B;stroke-width:6"/>
    <circle cx="100" cy="34" r="14" style="${t2('#D9411E')}"/>
    <circle cx="54" cy="72" r="12" style="${t2('#F3C548')}"/>
    <circle cx="146" cy="82" r="12" style="${t2('#F3C548')}"/>
    <path d="M70 116h60c4 22 14 30 14 46c0 14 -10 22 -22 22H78c-12 0 -22 -8 -22 -22c0 -16 10 -24 14 -46z" style="${t1('#9CCFD8')}"/>`,
  ],
  [
    'secchiello',
    'Secchiello da mare',
    `${ombra}
    <path d="M52 86c0 -60 96 -60 96 0" style="fill:none;stroke-width:7"/>
    <path d="M40 86h120l-14 96H54z" style="${t1('#9CCFD8')}"/>
    <path d="M44 110h112" style="fill:none;stroke:var(--t2,#F3C548);stroke-width:10"/>
    <path d="M150 150l26 -54l10 4l-20 56" style="${t2('#D9411E')}"/>`,
  ],
];

const simboli = oggetti
  .map(
    ([id, titolo, corpo]) =>
      `<symbol id="${id}" viewBox="0 0 200 200"><title>${titolo}</title><g style="stroke:${INK};stroke-width:5;stroke-linejoin:round;stroke-linecap:round">${corpo.replace(/\n\s+/g, '')}</g></symbol>`,
  )
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg">\n<!-- Generato da scripts/genera-sprite.mjs: illustrazioni segnaposto di Gino Casa -->\n${simboli}\n</svg>\n`;

writeFileSync(new URL('../public/oggetti.svg', import.meta.url), svg);
writeFileSync(
  new URL('../src/data/oggetti.ts', import.meta.url),
  `// Generato da scripts/genera-sprite.mjs — non modificare a mano.\nexport const OGGETTI = ${JSON.stringify(
    oggetti.map(([id]) => id),
  )} as const;\nexport type NomeOggetto = (typeof OGGETTI)[number];\nexport const TITOLI_OGGETTI: Record<NomeOggetto, string> = ${JSON.stringify(
    Object.fromEntries(oggetti.map(([id, t]) => [id, t])),
    null,
    2,
  )};\n`,
);
console.log(`Sprite generato: ${oggetti.length} oggetti.`);
