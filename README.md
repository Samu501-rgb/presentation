# Gino Casa — sito vetrina

Bazar e casalinghi a Latina Est, di fronte alla farmacia. Sito statico fatto a mano
(Astro 7 + Tailwind 4 + GSAP 3.15 + Lenis), concept "Lo scaffale infinito".

## Sviluppo

Richiede **Node ≥ 22.23.4** (requisito di Astro 7.4, vedi `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # sito statico in dist/
npm run preview    # serve dist/
npm run verifica   # astro check + eslint + build
npm run segnaposto # aggiorna DA_COMPILARE.md con i segnaposto rimasti
npm run og         # rigenera le immagini Open Graph (richiede Playwright)
npm run sprite     # rigenera public/oggetti.svg (illustrazioni degli oggetti)
```

## Dove si modificano le cose

| Cosa | File |
|---|---|
| Nome, indirizzo, telefono, WhatsApp, email, P.IVA, orari, social, dominio, flag opzionali | `src/data/negozio.ts` (**unica fonte di verità**: footer, contatti, JSON-LD e link WhatsApp leggono da qui) |
| Reparti | `src/content/reparti/*.md` (titolo, colore, descrizione, ordine, oggetti, idee, correlati) |
| Prodotti | `src/content/prodotti/*.json` (nome, reparto, prezzo?, codice?, colore, illustrazione, immagini, disponibile, nuovo, inOfferta) |
| Offerte e volantino | `src/content/offerte/*.json` (titolo, validaDal, validaFino, pagine, pdf, articoli). PDF in `public/volantini/` |
| Testi legali | `src/pages/privacy-policy.astro`, `cookie-policy.astro`, `accessibilita.astro` |

Lo schema Zod (`src/content.config.ts`) blocca la build se un campo è sbagliato.

**Aggiungere un prodotto**: copia un JSON in `src/content/prodotti/`, cambia nome file (= URL), `nome`, `reparto`,
togli `"esempio": true`. Per la foto: metti l'immagine in `src/assets/prodotti/` e aggiungi
`"immagini": [{ "src": "../../assets/prodotti/moka.jpg", "alt": "Moka in alluminio, 3 tazze" }]`
(Astro genera AVIF/WebP/JPG responsive). Poi `npm run og` e deploy.

**Offerte**: le offerte fuori dalle date spariscono alla build (e lato client). Il workflow
`.github/workflows/rebuild-giornaliero.yml` chiama ogni notte il deploy hook di Cloudflare (secret `CF_DEPLOY_HOOK`).

**Orari**: in `negozio.orari`, una fascia per mattina e una per pomeriggio se l'orario è spezzato, `fasce: []` = chiuso.
Si aggiornano tabella, "Oggi aperto fino alle…" e JSON-LD.

**Flag** (`negozio.flag`): `listeRegalo` (genera `/liste-regalo` e la voce di menu), `newsletter`, `mostraPrezzi`.

## Deploy su Cloudflare Pages

1. Cloudflare → Pages → Collega il repository. Build command `npm run build`, output `dist`, variabile `NODE_VERSION=22.23.4`.
2. Facoltativo: `SITE_URL=https://dominio.it` (altrimenti si usa `[DOMINIO]` di negozio.ts o `gino-casa.pages.dev`).
3. Settings → Builds → Deploy hooks → crea un hook e salvalo come secret `CF_DEPLOY_HOOK` nel repository GitHub.
4. `public/_headers` imposta header di sicurezza (CSP) e cache.

> L'anteprima online non è stata pubblicata da questo ambiente (nessun accesso all'account Cloudflare): va collegata dal cliente/Daniele con i passi sopra.

## Architettura

- `src/layouts/Base.astro`: head, SEO, OG, JSON-LD `HomeGoodsStore` (da `src/data/seo.ts`), skip link, header, footer, FAB, preloader.
- `src/sections/home/*`: le 10 sezioni della home. `src/components/*`: componenti riusabili.
- `src/scripts/motion/setup.ts`: carica GSAP/ScrollTrigger/SplitText/Lenis **solo se le animazioni sono attive**, registro
  dei moduli (`init`/`destroy`, `gsap.matchMedia`, revert), avvio "subito/idle/vicino", toggle Animazioni, compensazione dello
  scroll quando una sezione con pin si attiva sopra il viewport.
- Ogni modulo in `src/scripts/motion/` è commentato in italiano e fa cleanup completo.
- Funzioni non decorative (filtri, lista, form, orari, mappa) funzionano anche con animazioni off; senza JS il sito è completo.
- `content-visibility: auto` sulle sezioni basse della home (`.cv-auto`): un ResizeObserver fa `ScrollTrigger.refresh()`
  quando cambiano altezza, così le posizioni dei trigger restano corrette.
- Nessun cookie, nessun tracker, nessuna richiesta a terzi prima di un clic (mappa click-to-load). Analytics: nessuna.

## Shot list per il servizio fotografico

1. 30–60 oggetti iconici scontornati (PNG/AVIF con trasparenza), frontali o 3/4, ombra morbida coerente.
2. Un "eroe" per reparto ambientato (4:5 e 16:9). 3. Mani in azione. 4. Negozio: insegna, vetrina, corsie, cassa, personale
(con liberatoria). 5. Macro di ceramica, tessuto, metallo. 6. Scaffale pieno frontale + composizione dall'alto di 20–30 oggetti.
7. Esterno con la via riconoscibile, senza l'insegna della farmacia in primo piano.
Master 2400px, nomi file descrittivi in italiano (es. `moka-alluminio-3-tazze.jpg`), alt scritto al caricamento.
Ogni segnaposto nel sito indica già soggetto e rapporto: sostituirlo non genera CLS.

## Documenti

- `DA_COMPILARE.md` — tutti i segnaposto rimasti, file per file.
- `docs/registro-prestazioni.md` — Lighthouse prima/dopo le ottimizzazioni delle animazioni.
- `docs/checklist-accessibilita.md` — checklist WCAG 2.1 AA compilata.
- `docs/esempi/cloudflare-function-richiesta.js` — invio form via email (opzionale).
