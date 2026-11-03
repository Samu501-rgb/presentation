# DA COMPILARE — dati da confermare con il cliente

Nessun dato del negozio è stato inventato. Tutto ciò che non è confermato è un
segnaposto `[IN_MAIUSCOLO]`. Quasi tutto si compila in **un solo file**:
`src/data/negozio.ts`. Poi `npm run build` e deploy.

## Priorità alta (prima di pubblicare)

| Segnaposto | Dove | Note |
|---|---|---|
| `[RAGIONE_SOCIALE]` | negozio.ts | Presunta "GINO CASA DI YANG CUN": verificare con visura |
| `[PIVA]` | negozio.ts | Presunta 03046580597: verificare. Obbligatoria nel footer (art. 35 DPR 633/1972) |
| `[INDIRIZZO]` `[CAP]` `[CITTA]` | negozio.ts | Via e civico non verificati. NAP identico al Google Business Profile |
| `[LAT]` `[LNG]` | negozio.ts | 5 decimali; abilitano geo nel JSON-LD e le indicazioni precise |
| `[TELEFONO]` `[WHATSAPP]` `[EMAIL]` | negozio.ts | Finché manca `[WHATSAPP]` i link usano `wa.me/?text=…` (l'utente sceglie il contatto) |
| `[HH:MM]` / `[ORARI]` `[GIORNO_CHIUSURA]` | negozio.ts → `orari` | Orari spezzati = due fasce. Abilitano "Oggi aperto fino alle…" e il JSON-LD |
| `[GIORNI_E_ORARI_SINTETICI]` | negozio.ts | Bollino in home, es. "Lun–Sab 9–13 / 16–20" |
| `[PARCHEGGIO]` | negozio.ts | Compare in marquee, negozio, contatti, footer |
| `[DOMINIO]` | negozio.ts | Finché manca, canonical/sitemap usano `https://gino-casa.pages.dev` (o la variabile `SITE_URL`) |
| `[URL_GOOGLE_MAPS]` `[URL_RECENSIONE_GOOGLE]` | negozio.ts | Senza URL recensione il pulsante apre la ricerca su Maps |
| `[URL_FACEBOOK]` `[URL_INSTAGRAM]` | negozio.ts | Se non confermati non compaiono (né nel footer né nel sameAs) |

## Contenuti

- **Catalogo**: i 40 prodotti in `src/content/prodotti/` sono **di esempio** (`"esempio": true`), senza prezzi né codici. Sostituirli col catalogo reale; `[REPARTI]` = elenco reale dei reparti (ora i 9 di default in `src/content/reparti/`).
- **Offerta di esempio**: `src/content/offerte/esempio-novembre.json` ha date di esempio e prezzi `[PREZZO]` / `[PREZZO_PRIMA]`. Sostituire con il volantino reale (immagini + PDF in `public/volantini/`).
- `[STORIA]`: se il cliente non la fornisce resta il manifesto (nessun anno o fondatore inventato; "Gino Casa" è un marchio, non una persona).
- `[SLOGAN_CLIENTE]` `[MARCHI]` `[SERVIZI]` (confezione regalo? consegna?) `[TEMPI]` `[CONDIZIONI]` (FAQ "Te lo troviamo").
- `[LOGO]`: file del logo (`negozio.logo`); intanto logotipo testuale. Se l'insegna ha colori propri, adattare la palette e ricontrollare i contrasti.
- **Foto**: tutte le immagini sono illustrazioni SVG o segnaposto argilla con descrizione dello scatto (vedi shot list nel README). Le immagini `public/og/negozio-*.jpg` del JSON-LD vanno sostituite con foto reali.
- `[ENDPOINT_FORM]` + `[SERVIZIO_INVIO_EMAIL]`: invio alternativo via email (esempio in `docs/esempi/`). Senza, il form invia solo via WhatsApp.
- `[SERVIZIO_NEWSLETTER]`: solo se si attiva `flag.newsletter`.

## Legale (da far validare a un consulente / iubenda)

`[DATA_AGGIORNAMENTO]`, `[TEMPO_CONSERVAZIONE_RICHIESTE]`, `[TEMPO_CONSERVAZIONE_LOG]`,
`[STATO_CONFORMITA]`, `[DATA_VERIFICA]` nelle pagine privacy, cookie e accessibilità.

<!-- ELENCO-AUTOMATICO -->

## Elenco automatico dei segnaposto (44 occorrenze per file)

Generato da `npm run segnaposto` il 2026-11-03.

### `src/components/FormRichiesta.astro`

- `[ENDPOINT_FORM]` — righe 5
- `[WHATSAPP]` — righe 4

### `src/components/Logotipo.astro`

- `[LOGO]` — righe 2

### `src/content/offerte/esempio-novembre.json`

- `[PREZZO]` — righe 20, 28, 36, 44
- `[PREZZO_PRIMA]` — righe 21, 29, 37, 45

### `src/data/negozio.ts`

- `[CAP]` — righe 60
- `[CITTA]` — righe 62
- `[CONDIZIONI]` — righe 116
- `[DOMINIO]` — righe 104
- `[EMAIL]` — righe 73
- `[ENDPOINT_FORM]` — righe 106
- `[GIORNI_E_ORARI_SINTETICI]` — righe 76
- `[GIORNO_CHIUSURA]` — righe 77
- `[HH:MM]` — righe 41, 41, 81
- `[INDIRIZZO]` — righe 59
- `[LAT]` — righe 68
- `[LNG]` — righe 68
- `[LOGO]` — righe 118
- `[MARCHI]` — righe 110
- `[ORARI]` — righe 82, 94
- `[PARCHEGGIO]` — righe 78
- `[PIVA]` — righe 55
- `[QUALCOSA]` — righe 15
- `[RAGIONE_SOCIALE]` — righe 53
- `[REPARTI]` — righe 109
- `[SERVIZIO_NEWSLETTER]` — righe 128, 130
- `[SERVIZI]` — righe 111
- `[SLOGAN_CLIENTE]` — righe 113
- `[STORIA]` — righe 112
- `[TELEFONO]` — righe 8, 71
- `[TEMPI]` — righe 115
- `[URL_FACEBOOK]` — righe 97
- `[URL_GOOGLE_MAPS]` — righe 99
- `[URL_INSTAGRAM]` — righe 98
- `[URL_RECENSIONE_GOOGLE]` — righe 100
- `[WHATSAPP]` — righe 72, 185

### `src/layouts/Legale.astro`

- `[DATA_AGGIORNAMENTO]` — righe 23

### `src/pages/accessibilita.astro`

- `[DATA_VERIFICA]` — righe 39
- `[STATO_CONFORMITA]` — righe 38

### `src/pages/negozio.astro`

- `[STORIA]` — righe 3

### `src/pages/privacy-policy.astro`

- `[SERVIZIO_INVIO_EMAIL]` — righe 63, 77
- `[TEMPO_CONSERVAZIONE_LOG]` — righe 70
- `[TEMPO_CONSERVAZIONE_RICHIESTE]` — righe 69

### `src/scripts/richiesta.ts`

- `[ENDPOINT_FORM]` — righe 4
