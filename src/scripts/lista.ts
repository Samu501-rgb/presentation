/**
 * "La mia lista": i prodotti salvati col cuore, in localStorage (sempre in try/catch).
 * Si invia in un clic su WhatsApp come prenotazione da ritirare in negozio.
 */
export interface VoceLista {
  slug: string;
  nome: string;
  codice?: string;
  quantità?: number;
}

const CHIAVE = 'gc-lista';
const EVENTO = 'gc:lista';

let memoria: VoceLista[] = [];

export function leggi(): VoceLista[] {
  try {
    const raw = localStorage.getItem(CHIAVE);
    const dati = raw ? JSON.parse(raw) : [];
    return Array.isArray(dati) ? dati.filter((v) => v && typeof v.slug === 'string') : [];
  } catch {
    return memoria;
  }
}

function salva(lista: VoceLista[]) {
  memoria = lista;
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(lista));
  } catch {
    /* storage non disponibile (navigazione privata, browser integrati): resta in memoria */
  }
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: lista }));
}

export const contiene = (slug: string) => leggi().some((v) => v.slug === slug);

export function aggiungi(voce: VoceLista) {
  const lista = leggi();
  if (!lista.some((v) => v.slug === voce.slug))
    salva([...lista, { ...voce, quantità: voce.quantità ?? 1 }]);
}

export function rimuovi(slug: string) {
  salva(leggi().filter((v) => v.slug !== slug));
}

export function imposta(slug: string, quantità: number) {
  salva(
    leggi().map((v) =>
      v.slug === slug ? { ...v, quantità: Math.max(1, Math.min(99, quantità)) } : v,
    ),
  );
}

export const svuota = () => salva([]);

export function alCambio(fn: (lista: VoceLista[]) => void) {
  window.addEventListener(EVENTO, (e) => fn((e as CustomEvent<VoceLista[]>).detail));
  // sincronizza tra schede
  window.addEventListener('storage', (e) => e.key === CHIAVE && fn(leggi()));
}

/** Testo del messaggio WhatsApp con tutta la lista. */
export function messaggioLista(lista = leggi()): string {
  const righe = lista.map(
    (v) => `• ${v.quantità ?? 1} × ${v.nome}${v.codice ? ` (${v.codice})` : ''}`,
  );
  return `Ciao Gino Casa! Vorrei prenotare questi articoli da ritirare in negozio:\n${righe.join('\n')}\nPasso a ritirarli [quando]. Grazie!`;
}

/* ------------------------------------------------------------------ */
/* Collegamento all'interfaccia: cuori e contatore nell'header         */
/* ------------------------------------------------------------------ */

const movimentoAttivo = () => document.documentElement.dataset.motion === 'full';

/** Coriandoli CSS: 10 elementi, solo transform/opacity, rimossi dopo l'animazione. */
function coriandoli(btn: HTMLElement) {
  if (!movimentoAttivo()) return;
  const colori = ['#D9411E', '#F3C548', '#9CCFD8', '#24594B'];
  for (let i = 0; i < 10; i++) {
    const c = document.createElement('span');
    c.className = 'coriandolo';
    const angolo = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
    const dist = 28 + Math.random() * 22;
    c.style.setProperty('--dx', `${Math.cos(angolo) * dist}px`);
    c.style.setProperty('--dy', `${Math.sin(angolo) * dist}px`);
    c.style.setProperty('--r', `${Math.random() * 360}deg`);
    c.style.background = colori[i % colori.length];
    c.setAttribute('aria-hidden', 'true');
    btn.append(c);
    c.addEventListener('animationend', () => c.remove(), { once: true });
  }
}

function aggiornaCuori() {
  const salvati = new Set(leggi().map((v) => v.slug));
  document.querySelectorAll<HTMLButtonElement>('[data-cuore]').forEach((b) => {
    const dentro = salvati.has(b.dataset.slug || '');
    b.setAttribute('aria-pressed', String(dentro));
    const t = b.querySelector('[data-cuore-testo]');
    if (t) {
      const grande = !t.classList.contains('visualmente-nascosto');
      t.textContent = grande
        ? dentro
          ? 'Nella tua lista'
          : 'Aggiungi alla mia lista'
        : `${dentro ? 'Rimuovi' : 'Aggiungi'} ${b.dataset.nome} ${dentro ? 'dalla' : 'alla'} mia lista`;
    }
  });
}

function aggiornaConteggio(salta = false) {
  const n = leggi().length;
  document.querySelectorAll<HTMLElement>('[data-lista-conteggio]').forEach((el) => {
    el.hidden = n === 0;
    const num = el.querySelector('[data-lista-numero]');
    if (num) num.textContent = String(n);
    if (salta && movimentoAttivo()) {
      el.classList.remove('salta');
      void el.offsetWidth;
      el.classList.add('salta');
    }
  });
}

function collega() {
  document.querySelectorAll<HTMLButtonElement>('[data-cuore]').forEach((b) => (b.hidden = false));
  aggiornaCuori();
  aggiornaConteggio();
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-cuore]');
    if (!b) return;
    const slug = b.dataset.slug!;
    if (contiene(slug)) {
      rimuovi(slug);
    } else {
      aggiungi({ slug, nome: b.dataset.nome || slug, codice: b.dataset.codice || undefined });
      b.classList.remove('cuore--pop');
      void b.offsetWidth;
      b.classList.add('cuore--pop');
      coriandoli(b);
    }
  });
  alCambio(() => {
    aggiornaCuori();
    aggiornaConteggio(true);
  });
}

collega();
