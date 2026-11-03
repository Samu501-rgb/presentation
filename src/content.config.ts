/**
 * Content Collections di Gino Casa.
 * Per aggiornare il catalogo basta modificare/aggiungere un file in src/content/
 * e rifare il deploy (vedi README). Lo schema Zod blocca la build se un campo è sbagliato.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { OGGETTI } from './data/oggetti';

/** Colori del sito utilizzabili come "colore" di un reparto. */
const coloreSito = z.enum(['limone', 'pomodoro', 'mare', 'bonifica', 'argilla']);

/** Illustrazione piatta usata finché non c'è la foto reale. */
const illustrazione = z.enum(OGGETTI);

/** Colore dell'oggetto, usato dal filtro "colore" dello scaffale. */
export const COLORI_PRODOTTO = ['rosso', 'giallo', 'azzurro', 'verde', 'bianco'] as const;

const reparti = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reparti' }),
  schema: ({ image }) =>
    z.object({
      titolo: z.string(),
      /** Titolo breve per card e filtri. */
      breve: z.string().optional(),
      colore: coloreSito,
      descrizione: z.string(),
      ordine: z.number().int(),
      /** Foto ambientata del reparto (4:5). Facoltativa: senza, si usa il segnaposto. */
      immagine: image().optional(),
      immagineAlt: z.string().optional(),
      /** Descrizione dello scatto da fare, mostrata nel segnaposto. */
      segnapostoFoto: z.string(),
      /** Oggetti illustrati che rappresentano il reparto. */
      oggetti: z.array(illustrazione).min(1),
      /** Idee per il mini-lookbook orizzontale. */
      idee: z.array(z.object({ titolo: z.string(), segnaposto: z.string() })).default([]),
      correlati: z.array(reference('reparti')).default([]),
    }),
});

const prodotti = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/prodotti' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      reparto: reference('reparti'),
      descrizione: z.string().optional(),
      /** Prezzo in euro. Assente = "Chiedi in negozio". */
      prezzo: z.number().positive().optional(),
      codice: z.string().optional(),
      colore: z.enum(COLORI_PRODOTTO),
      illustrazione,
      immagini: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      disponibile: z.boolean().default(true),
      nuovo: z.boolean().default(false),
      inOfferta: z.boolean().default(false),
      /** true = prodotto di esempio da sostituire con il catalogo reale. */
      esempio: z.boolean().default(false),
    }),
});

const offerte = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/offerte' }),
  schema: ({ image }) =>
    z
      .object({
        titolo: z.string(),
        sottotitolo: z.string().optional(),
        /** Date ISO "AAAA-MM-GG", estremi inclusi. */
        validaDal: z.coerce.date(),
        validaFino: z.coerce.date(),
        /** PDF del volantino in public/volantini (es. "/volantini/novembre.pdf"). */
        pdf: z.string().optional(),
        pagine: z
          .array(
            z.object({
              src: image().optional(),
              alt: z.string(),
              segnaposto: z.string().optional(),
            }),
          )
          .default([]),
        articoli: z
          .array(
            z.object({
              nome: z.string(),
              prodotto: reference('prodotti').optional(),
              /** Prezzi come testo, così restano segnaposto finché non confermati. */
              prezzo: z.string().optional(),
              prezzoPrima: z.string().optional(),
              nota: z.string().optional(),
              illustrazione,
              colore: z.enum(COLORI_PRODOTTO).default('rosso'),
            }),
          )
          .default([]),
        esempio: z.boolean().default(false),
      })
      .refine((o) => o.validaFino >= o.validaDal, {
        message: 'validaFino deve essere successiva a validaDal',
      }),
});

export const collections = { reparti, prodotti, offerte };
