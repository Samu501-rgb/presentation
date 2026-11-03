/**
 * Accesso al catalogo (Content Collections) con ordinamenti e derivati comuni.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Reparto = CollectionEntry<'reparti'>;
export type Prodotto = CollectionEntry<'prodotti'>;
export type Offerta = CollectionEntry<'offerte'>;

/** Tinte (variabili --t1/--t2 dello sprite) per ogni colore prodotto. */
export const TINTE: Record<string, { t1: string; t2: string; nome: string; campione: string }> = {
  rosso: { t1: '#D9411E', t2: '#F3C548', nome: 'Rosso', campione: '#D9411E' },
  giallo: { t1: '#F3C548', t2: '#D9411E', nome: 'Giallo', campione: '#F3C548' },
  azzurro: { t1: '#9CCFD8', t2: '#F3C548', nome: 'Azzurro', campione: '#9CCFD8' },
  verde: { t1: '#24594B', t2: '#F3C548', nome: 'Verde', campione: '#24594B' },
  bianco: { t1: '#F5EFE4', t2: '#9CCFD8', nome: 'Bianco', campione: '#FFFFFF' },
};

/** Classi di sfondo/testo per il colore di un reparto (contrasti verificati). */
export const SFONDI_REPARTO: Record<
  string,
  { bg: string; testo: string; scuro: boolean; hex: string }
> = {
  limone: { bg: 'bg-limone', testo: 'text-inchiostro', scuro: false, hex: '#F3C548' },
  // Il pomodoro #D9411E non regge il testo piccolo: per gli sfondi con testo si usa il 700 (5.2:1 con carta).
  pomodoro: { bg: 'bg-pomodoro-700', testo: 'text-carta', scuro: true, hex: '#B8331A' },
  mare: { bg: 'bg-mare', testo: 'text-inchiostro', scuro: false, hex: '#9CCFD8' },
  bonifica: { bg: 'bg-bonifica', testo: 'text-carta', scuro: true, hex: '#24594B' },
  argilla: { bg: 'bg-argilla', testo: 'text-inchiostro', scuro: false, hex: '#E9DCC8' },
};

export async function reparti(): Promise<Reparto[]> {
  return (await getCollection('reparti')).sort((a, b) => a.data.ordine - b.data.ordine);
}

export async function prodotti(): Promise<Prodotto[]> {
  const tutti = await getCollection('prodotti');
  const ordine = new Map((await reparti()).map((r, i) => [r.id, i]));
  return tutti.sort(
    (a, b) =>
      (ordine.get(a.data.reparto.id) ?? 99) - (ordine.get(b.data.reparto.id) ?? 99) ||
      a.data.nome.localeCompare(b.data.nome, 'it'),
  );
}

export async function prodottiDelReparto(id: string): Promise<Prodotto[]> {
  return (await prodotti()).filter((p) => p.data.reparto.id === id);
}

/** Fine giornata di validità (23:59:59 ora italiana, approssimata in UTC+1). */
export function fineValidità(d: Date): Date {
  const f = new Date(d);
  f.setUTCHours(22, 59, 59, 0);
  return f;
}

/** Offerte valide alla data della build (le scadute spariscono). */
export async function offerteValide(oggi = new Date()): Promise<Offerta[]> {
  return (await getCollection('offerte'))
    .filter((o) => o.data.validaDal <= oggi && fineValidità(o.data.validaFino) >= oggi)
    .sort((a, b) => a.data.validaFino.getTime() - b.data.validaFino.getTime());
}

export function giorniRimasti(fino: Date, oggi = new Date()): number {
  return Math.max(0, Math.ceil((fineValidità(fino).getTime() - oggi.getTime()) / 86_400_000));
}

const fmtData = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Rome',
});
export const dataLeggibile = (d: Date) => fmtData.format(d);

const fmtPrezzo = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
export const prezzoLeggibile = (n: number) => fmtPrezzo.format(n);
