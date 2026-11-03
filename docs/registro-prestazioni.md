# Registro prestazioni

Strumento: Lighthouse 12 (CLI), modalità navigazione, **mobile** (throttling simulato 4× CPU, rete lenta 4G),
build di produzione servita in locale (`astro preview`). Data: 2026-11-03.
WebPageTest e test su dispositivi reali non erano eseguibili da questo ambiente: vanno ripetuti sull'anteprima Cloudflare (vedi in fondo).

## Prima dell'ottimizzazione delle animazioni (tutte le sezioni avviate al caricamento)

| Pagina | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Home | 76 | 92 | 100 | 100 | 1.1 s | 950 ms | 0 |

Cause: GSAP che inizializzava pin e SplitText di tutte le sezioni al load, 12 ScrollTrigger solo nell'hero, letture di stile forzate.

## Dopo (sezioni avviate quando si avvicinano, content-visibility con refresh via ResizeObserver, CSS inline)

| Pagina | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Home (animazioni attive) | 99 | 100 | 100 | 100 | 1.1 s | 110 ms | 0 |
| Scheda prodotto (moka-3-tazze) | 100 | 100 | 100 | 100 | 0.9 s | 40 ms | 0 |
| Reparti (scaffale) | 100 | 100 | 100 | 100 | 1.0 s | 40 ms | 0 |
| Reparto cucina | 100 | 100 | 100 | 100 | 0.9 s | 50 ms | 0 |
| Te lo troviamo | 100 | 100 | 100 | 100 | 0.9 s | 30 ms | 0 |
| Contatti / Negozio / Offerte | 100 | 100 | 100 | 100 | 0.9 s | ≤ 20 ms | 0 |
| Privacy / Cookie / Accessibilità | 100 | 100 | 100 | 100 | ≤ 1.0 s | ≤ 10 ms | 0 |

- **JS primo caricamento home**: 67.8 KB gzip (budget 100 KB). Flip, Draggable, Inertia si caricano solo nello scaffale/reparti.
- **Richieste a domini terzi prima di un'azione**: 0 (verificato intercettando la rete).
- **LCP**: l'H1 è testo visibile dal primo paint; la serranda (preloader) non ritarda l'LCP misurato (1.1 s con e senza).
- Font: 2 WOFF2 (41 KB + 30 KB), solo il display dell'H1 precaricato, `font-display: optional` con fallback metrico.

## Da fare sull'anteprima online
1. WebPageTest mobile (Moto G Power, 4G) su home e scheda prodotto, con e senza animazioni (`localStorage gc-motion=off`).
2. Android di fascia media reale, iPhone Safari, browser integrati di Instagram e Facebook.
3. Ripetere Lighthouse sull'URL pubblico (latenza reale + CDN).
