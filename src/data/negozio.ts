/**
 * UNICA FONTE DI VERITÀ per i dati di Gino Casa.
 *
 * Da qui leggono: header, footer, pagina contatti, pagina negozio, JSON-LD,
 * link WhatsApp, link telefono, mappa e orari "aperto ora".
 *
 * REGOLA: nessun dato inventato. Ogni valore non confermato dal cliente resta
 * un segnaposto in MAIUSCOLO tra parentesi quadre, es. "[TELEFONO]".
 * Il comando `npm run segnaposto` elenca tutti i segnaposto rimasti nel progetto.
 *
 * Quando il cliente conferma un dato, sostituisci il segnaposto qui e basta:
 * tutto il sito si aggiorna alla build successiva.
 */

/** Vero se il valore contiene ancora un segnaposto tipo [QUALCOSA]. */
export function èSegnaposto(valore: unknown): boolean {
  return typeof valore === 'string' && /\[[A-Z0-9_:]+\]/.test(valore);
}

/** Restituisce il valore se confermato, altrimenti `undefined`. */
export function confermato<T>(valore: T): T | undefined {
  return èSegnaposto(valore) ? undefined : valore;
}

/** Fascia oraria nel formato 24h "HH:MM". */
export interface Fascia {
  apre: string;
  chiude: string;
}

export interface GiornoOrario {
  /** 0 = domenica … 6 = sabato (come Date.getDay()). */
  indice: number;
  nome: string;
  /** Nome inglese per schema.org (dayOfWeek). */
  schema: string;
  /** Vuoto = chiuso. Per gli orari spezzati usa due fasce (mattina e pomeriggio). */
  fasce: Fascia[];
}

const fasciaDaConfermare: Fascia = { apre: '[HH:MM]', chiude: '[HH:MM]' };

export const negozio = {
  /** Marchio commerciale. NON è il nome di un fondatore. */
  nome: 'Gino Casa',
  categoria: 'Bazar e casalinghi',
  descrizione: 'Bazar e casalinghi a Latina Est, di fronte alla farmacia',
  zona: 'Latina Est',
  riferimento: 'di fronte alla farmacia di Latina Est',
  areaServita: 'Latina',

  /** Presunta: "GINO CASA DI YANG CUN" — da confermare con visura. */
  ragioneSociale: '[RAGIONE_SOCIALE]',
  /** Presunta: 03046580597 — da confermare. Solo le 11 cifre, senza "IT". */
  piva: '[PIVA]',

  indirizzo: {
    /** Via e civico non verificati. */
    via: '[INDIRIZZO]',
    cap: '[CAP]',
    /** Presumibilmente "Latina": da confermare. */
    citta: '[CITTA]',
    provincia: 'LT',
    nazione: 'IT',
  },

  /** Coordinate con 5 decimali, es. 41.46789 / 12.91234. */
  geo: { lat: '[LAT]', lng: '[LNG]' },

  /** Numeri senza +39 e senza spazi, es. "3331234567". */
  telefono: '[TELEFONO]',
  whatsapp: '[WHATSAPP]',
  email: '[EMAIL]',

  /** Riassunto per il bollino in home, es. "Lun–Sab 9–13 / 16–20". */
  orariSintetici: '[GIORNI_E_ORARI_SINTETICI]',
  giornoChiusura: '[GIORNO_CHIUSURA]',
  parcheggio: '[PARCHEGGIO]',

  /**
   * Orari settimanali. Finché le fasce contengono "[HH:MM]" la tabella mostra
   * "[ORARI]" e il calcolo "aperto ora" resta spento.
   */
  orari: [
    { indice: 1, nome: 'Lunedì', schema: 'Monday', fasce: [fasciaDaConfermare] },
    { indice: 2, nome: 'Martedì', schema: 'Tuesday', fasce: [fasciaDaConfermare] },
    { indice: 3, nome: 'Mercoledì', schema: 'Wednesday', fasce: [fasciaDaConfermare] },
    { indice: 4, nome: 'Giovedì', schema: 'Thursday', fasce: [fasciaDaConfermare] },
    { indice: 5, nome: 'Venerdì', schema: 'Friday', fasce: [fasciaDaConfermare] },
    { indice: 6, nome: 'Sabato', schema: 'Saturday', fasce: [fasciaDaConfermare] },
    { indice: 0, nome: 'Domenica', schema: 'Sunday', fasce: [fasciaDaConfermare] },
  ] as GiornoOrario[],
  /** Testo libero mostrato finché gli orari non sono confermati. */
  orariTesto: '[ORARI]',

  social: {
    facebook: '[URL_FACEBOOK]',
    instagram: '[URL_INSTAGRAM]',
    googleMaps: '[URL_GOOGLE_MAPS]',
    recensioneGoogle: '[URL_RECENSIONE_GOOGLE]',
  },

  /** Dominio definitivo senza https://, es. "ginocasa.it". */
  dominio: '[DOMINIO]',
  /** URL del servizio che riceve il form "Te lo troviamo" (es. /api/richiesta). */
  endpointForm: '[ENDPOINT_FORM]',

  /** Elenco reale dei reparti: finché manca, si usa l'elenco di default in src/content/reparti. */
  reparti: '[REPARTI]',
  marchi: '[MARCHI]',
  servizi: '[SERVIZI]',
  storia: '[STORIA]',
  slogan: '[SLOGAN_CLIENTE]',
  /** Tempi e condizioni del servizio "Te lo troviamo" (FAQ). */
  tempiRicerca: '[TEMPI]',
  condizioniRicerca: '[CONDIZIONI]',

  /** Percorso del logo in src/assets (es. "logo.svg"). null = logotipo testuale. [LOGO] */
  logo: null as string | null,

  /** Credit del footer. */
  credit: { nome: 'Next Tech', url: '' },

  /** Interruttori delle funzioni opzionali. */
  flag: {
    /** Pagina /liste-regalo (casa nuova, matrimonio, compleanno). */
    listeRegalo: false,
    /** Iscrizione newsletter: richiede [SERVIZIO_NEWSLETTER] e doppio opt-in. */
    newsletter: false,
    servizioNewsletter: '[SERVIZIO_NEWSLETTER]',
    /** Mostra i prezzi nelle schede (se il prodotto ne ha uno). */
    mostraPrezzi: true,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Derivati                                                            */
/* ------------------------------------------------------------------ */

/** URL di anteprima usato finché manca il dominio definitivo. */
export const URL_ANTEPRIMA = 'https://gino-casa.pages.dev';

export function urlSito(): string {
  const d = confermato(negozio.dominio);
  return d ? `https://${d.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : URL_ANTEPRIMA;
}

/** Indirizzo su una riga, identico carattere per carattere ovunque (NAP). */
export function indirizzoCompleto(): string {
  const i = negozio.indirizzo;
  return `${i.via}, ${i.cap} ${i.citta} (${i.provincia})`;
}

/** Riga legale del footer: ragione sociale – indirizzo – P.IVA – telefono – email. */
export function rigaLegale(): string {
  return [
    negozio.ragioneSociale,
    indirizzoCompleto(),
    `P.IVA ${negozio.piva}`,
    `Tel. ${telefonoLeggibile()}`,
    negozio.email,
  ].join(' – ');
}

/** Telefono formattato per la lettura, es. "333 123 4567". */
export function telefonoLeggibile(numero: string = negozio.telefono): string {
  if (èSegnaposto(numero)) return numero;
  const n = numero.replace(/\D/g, '');
  return n.replace(/^(\d{3})(\d{3})(\d+)$/, '$1 $2 $3');
}

/** href "tel:" oppure undefined se il numero non è confermato. */
export function hrefTelefono(): string | undefined {
  const n = confermato(negozio.telefono);
  return n ? `tel:+39${n.replace(/\D/g, '')}` : undefined;
}

export function hrefEmail(): string | undefined {
  const e = confermato(negozio.email);
  return e ? `mailto:${e}` : undefined;
}

/**
 * Link WhatsApp con testo precompilato e codificato.
 * Finché [WHATSAPP] non è confermato si usa wa.me/?text=… (WhatsApp chiede a chi inviarlo):
 * il messaggio resta corretto, ma va inserito il numero prima della pubblicazione.
 */
export function linkWhatsApp(testo = 'Ciao Gino Casa! '): string {
  const numero = confermato(negozio.whatsapp);
  const base = numero
    ? `https://wa.me/39${numero.replace(/\D/g, '').replace(/^39/, '')}`
    : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(testo)}`;
}

/** Messaggio di prenotazione di un singolo prodotto. */
export function messaggioPrenotazione(nome: string, codice?: string): string {
  const etichetta = codice ? `${nome} (${codice})` : nome;
  return `Ciao Gino Casa! Vorrei prenotare: ${etichetta}. Passo a ritirarlo [quando]. Grazie!`;
}

/** Link "Indicazioni" su Google Maps. */
export function linkIndicazioni(): string {
  const { lat, lng } = negozio.geo;
  if (!èSegnaposto(lat) && !èSegnaposto(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const maps = confermato(negozio.social.googleMaps);
  if (maps) return maps;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Gino Casa Latina Est')}`;
}

/** URL dell'iframe Google Maps (caricato SOLO dopo il clic dell'utente). */
export function urlMappaEmbed(): string {
  const { lat, lng } = negozio.geo;
  const q = !èSegnaposto(lat) && !èSegnaposto(lng) ? `${lat},${lng}` : 'Gino Casa, Latina Est';
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=17&output=embed`;
}

export const orariConfermati = (): boolean =>
  negozio.orari.every((g) => g.fasce.every((f) => !èSegnaposto(f.apre) && !èSegnaposto(f.chiude)));

/** "9:00–13:00 · 16:00–20:00" oppure "Chiuso". */
export function fasceTesto(g: GiornoOrario): string {
  if (!orariConfermati()) return negozio.orariTesto;
  if (g.fasce.length === 0) return 'Chiuso';
  return g.fasce.map((f) => `${f.apre}–${f.chiude}`).join(' · ');
}

/** Link social confermati (per footer e sameAs). */
export function socialConfermati(): { nome: string; url: string; icona: string }[] {
  const s = negozio.social;
  return [
    { nome: 'Facebook', url: s.facebook, icona: 'lucide:facebook' },
    { nome: 'Instagram', url: s.instagram, icona: 'lucide:instagram' },
  ].filter((x) => !èSegnaposto(x.url));
}
