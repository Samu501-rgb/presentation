/**
 * Calcolo lato client di "aperto ora" a partire dagli orari di negozio.ts.
 * Usa sempre l'ora italiana (Europe/Rome), qualunque sia il fuso del visitatore.
 */
import type { GiornoOrario } from '../data/negozio';

const aMinuti = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Giorno della settimana e minuti correnti a Roma. */
export function oraDiRoma(d = new Date()): { giorno: number; minuti: number } {
  const parti = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const v = (t: string) => parti.find((p) => p.type === t)?.value ?? '';
  const giorni = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    giorno: giorni.indexOf(v('weekday')),
    minuti: Number(v('hour')) * 60 + Number(v('minute')),
  };
}

export function statoOrari(orari: GiornoOrario[], confermati: boolean, d = new Date()) {
  const { giorno, minuti } = oraDiRoma(d);
  if (!confermati) return { giorno, aperto: undefined, testo: '' };
  const oggi = orari.find((g) => g.indice === giorno);
  const fasce = oggi?.fasce ?? [];
  if (fasce.length === 0) return { giorno, aperto: false, testo: 'Oggi chiuso' };
  const inCorso = fasce.find((f) => minuti >= aMinuti(f.apre) && minuti < aMinuti(f.chiude));
  if (inCorso) return { giorno, aperto: true, testo: `Oggi aperto fino alle ${inCorso.chiude}` };
  const prossima = fasce.find((f) => minuti < aMinuti(f.apre));
  if (prossima)
    return { giorno, aperto: false, testo: `Ora chiuso · oggi riapre alle ${prossima.apre}` };
  return { giorno, aperto: false, testo: 'Per oggi abbiamo chiuso' };
}
