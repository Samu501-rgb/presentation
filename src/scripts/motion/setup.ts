/**
 * Infrastruttura del movimento di Gino Casa.
 *
 * - Carica GSAP (+ ScrollTrigger, SplitText, CustomEase) e Lenis SOLO se le
 *   animazioni sono attive: con "Animazioni off" o prefers-reduced-motion non
 *   scarica nulla di pesante.
 * - Registro dei moduli: ogni modulo esporta init(ctx) e destroy(), usa
 *   gsap.matchMedia()/gsap.context() e fa revert() quando viene distrutto.
 * - Strategie di avvio: "subito" (hero), "idle" (sezioni con pin, in ordine,
 *   spezzate con scheduler.yield), "vicino" (sezioni sotto la piega, quando si
 *   avvicinano al viewport).
 * - Toggle "Animazioni on/off": salva in localStorage, imposta html[data-motion],
 *   distrugge e ricrea moduli e Lenis.
 */
import type Lenis from 'lenis';

type Gsap = typeof import('gsap').gsap;
type ST = typeof import('gsap/ScrollTrigger').ScrollTrigger;
type Split = typeof import('gsap/SplitText').SplitText;

export interface Condizioni {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
  mouse: boolean;
}

export interface Contesto {
  gsap: Gsap;
  ScrollTrigger: ST;
  SplitText: Split;
  lenis: Lenis | null;
  /** true se l'utente/il sistema chiede movimento ridotto. */
  ridotto: boolean;
  /** Mouse o trackpad (hover + pointer fine). */
  mouse: boolean;
}

export interface Modulo {
  init(ctx: Contesto): void | Promise<void>;
  destroy(): void;
}

interface Registrazione {
  nome: string;
  carica: () => Promise<Modulo>;
  quando: 'subito' | 'idle' | 'vicino';
  /** Selettore dell'elemento che fa scattare l'avvio "vicino". */
  el?: string;
  /** Avvia anche con movimento ridotto (moduli funzionali: filtri, tela…). */
  sempre?: boolean;
  modulo?: Modulo;
  osservatore?: IntersectionObserver;
}

declare global {
  interface Window {
    __gcMotion?: boolean;
  }
}

const html = document.documentElement;
const registro: Registrazione[] = [];
let avviato = false;
let generazione = 0;
let ctx: Contesto | null = null;
let motore: Promise<Pick<Contesto, 'gsap' | 'ScrollTrigger' | 'SplitText'>> | null = null;
let rafLenis: ((t: number) => void) | null = null;

const mqRidotto = matchMedia('(prefers-reduced-motion: reduce)');
const mqMouse = matchMedia('(hover: hover) and (pointer: fine)');

export const èRidotto = () => html.dataset.motion === 'reduce';

/** Cede il main thread: niente task lunghi oltre 50 ms durante l'avvio. */
export function cedi(): Promise<void> {
  const s = (globalThis as any).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((r) => setTimeout(r, 0));
}

/** Carica GSAP e i plugin del primo caricamento (una volta sola). */
function caricaMotore() {
  motore ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
    import('gsap/CustomEase'),
  ]).then(([{ gsap }, { ScrollTrigger }, { SplitText }, { CustomEase }]) => {
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
    // Easing "casa": morbido, con un piccolo assestamento finale.
    CustomEase.create('casa', 'M0,0 C0.16,0.62 0.3,1.04 0.58,1.03 0.76,1.02 0.88,1 1,1');
    gsap.defaults({ ease: 'power3.out', duration: 0.8 });
    ScrollTrigger.config({ ignoreMobileResize: true });
    return { gsap, ScrollTrigger, SplitText };
  });
  return motore;
}

/* ------------------------------------------------------------------ */
/* Lenis                                                               */
/* ------------------------------------------------------------------ */

async function creaLenis(gsap: Gsap, ScrollTrigger: ST): Promise<Lenis | null> {
  // Su touch resta lo scroll nativo: Lenis solo con mouse/trackpad.
  if (!mqMouse.matches) return null;
  const { default: LenisCls } = await import('lenis');
  const lenis = new LenisCls({
    autoRaf: false,
    anchors: true,
    syncTouch: false,
    lerp: 0.1,
  });
  lenis.on('scroll', ScrollTrigger.update);
  rafLenis = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(rafLenis);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function distruggiLenis() {
  if (!ctx?.lenis) return;
  if (rafLenis) ctx.gsap.ticker.remove(rafLenis);
  ctx.gsap.ticker.lagSmoothing(500, 33);
  ctx.lenis.destroy();
  ctx.lenis = null;
  rafLenis = null;
}

/** Scorre fino a un elemento o a una posizione, con Lenis se c'è. */
export function scorriA(target: HTMLElement | number, offset = 0) {
  if (ctx?.lenis) {
    ctx.lenis.scrollTo(target, { offset, duration: 1.2 });
    return;
  }
  const y =
    typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: èRidotto() ? 'auto' : 'smooth' });
}

/* ------------------------------------------------------------------ */
/* Helper per i moduli                                                 */
/* ------------------------------------------------------------------ */

/**
 * gsap.matchMedia con le condizioni standard del sito. Se il sistema chiede
 * movimento ridotto (e l'utente non ha forzato "on") la funzione non gira.
 */
export function conMedia(
  c: Contesto,
  scope: Element | null,
  fn: (cond: Condizioni) => void | (() => void),
) {
  const mm = c.gsap.matchMedia(scope ?? undefined);
  mm.add(
    {
      isDesktop: '(min-width: 1024px)',
      isTablet: '(min-width: 768px)',
      isMobile: '(max-width: 767px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
      mouse: '(hover: hover) and (pointer: fine)',
    },
    (m) => {
      const cond = m.conditions as unknown as Condizioni;
      if (èRidotto()) return;
      if (cond.reduceMotion && preferenzaSalvata() !== 'on') return;
      return fn(cond);
    },
  );
  return mm;
}

let timerRefresh = 0;
/** ScrollTrigger.refresh() con debounce: solo quando cambia il layout. */
export function refresh() {
  window.clearTimeout(timerRefresh);
  timerRefresh = window.setTimeout(() => ctx?.ScrollTrigger.refresh(), 150);
}

/* ------------------------------------------------------------------ */
/* Registro e avvio                                                    */
/* ------------------------------------------------------------------ */

export function registra(r: Omit<Registrazione, 'modulo' | 'osservatore'>) {
  const voce: Registrazione = { ...r };
  registro.push(voce);
  if (avviato) void pianifica(voce, generazione);
}

async function attiva(r: Registrazione, gen: number) {
  if (r.modulo || gen !== generazione) return;
  const ridotto = èRidotto();
  if (ridotto && !r.sempre) return;
  const c = await assicuraContesto();
  if (gen !== generazione) return;
  const modulo = await r.carica();
  if (gen !== generazione || r.modulo) return;
  r.modulo = modulo;
  try {
    await modulo.init(c);
  } catch (err) {
    console.error(`[motion] errore in ${r.nome}`, err);
    html.classList.add('motion-ko');
  }
  if (r.quando !== 'subito') refresh();
}

async function pianifica(r: Registrazione, gen: number) {
  if (èRidotto() && !r.sempre) return;
  if (r.quando === 'subito') return attiva(r, gen);
  if (r.quando === 'idle') {
    await cedi();
    return attiva(r, gen);
  }
  const el = r.el ? document.querySelector(r.el) : null;
  if (!el) return attiva(r, gen);
  r.osservatore = new IntersectionObserver(
    (voci) => {
      if (voci.some((v) => v.isIntersecting)) {
        r.osservatore?.disconnect();
        r.osservatore = undefined;
        void attiva(r, gen);
      }
    },
    { rootMargin: '60% 0px 60% 0px' },
  );
  r.osservatore.observe(el);
}

async function assicuraContesto(): Promise<Contesto> {
  if (ctx) return ctx;
  const m = await caricaMotore();
  ctx = { ...m, lenis: null, ridotto: èRidotto(), mouse: mqMouse.matches };
  return ctx;
}

async function accendi() {
  const gen = ++generazione;
  const ridotto = èRidotto();
  if (!ridotto) {
    const c = await assicuraContesto();
    if (gen !== generazione) return;
    c.ridotto = false;
    c.mouse = mqMouse.matches;
    c.lenis = await creaLenis(c.gsap, c.ScrollTrigger);
  } else if (ctx) {
    ctx.ridotto = true;
  }
  // Ordine: prima "subito", poi "idle" (pin, in ordine di pagina), poi "vicino".
  for (const quando of ['subito', 'idle', 'vicino'] as const) {
    for (const r of registro.filter((x) => x.quando === quando)) {
      if (gen !== generazione) return;
      await pianifica(r, gen);
    }
  }
  if (ctx && !ridotto) {
    document.fonts?.ready.then(refresh);
    if (document.readyState !== 'complete')
      window.addEventListener('load', refresh, { once: true });
  }
}

function spegni() {
  generazione++;
  // Distruggi in ordine inverso: prima i moduli aggiunti per ultimi.
  for (const r of [...registro].reverse()) {
    r.osservatore?.disconnect();
    r.osservatore = undefined;
    if (r.modulo) {
      try {
        r.modulo.destroy();
      } catch (err) {
        console.error(`[motion] errore distruggendo ${r.nome}`, err);
      }
      r.modulo = undefined;
    }
  }
  distruggiLenis();
  ctx?.ScrollTrigger.getAll().forEach((t) => t.kill());
}

/* ------------------------------------------------------------------ */
/* Toggle "Animazioni on/off"                                          */
/* ------------------------------------------------------------------ */

function preferenzaSalvata(): string | null {
  try {
    return localStorage.getItem('gc-motion');
  } catch {
    return null;
  }
}

function aggiornaToggle() {
  const on = !èRidotto();
  document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]').forEach((b) => {
    b.hidden = false;
    b.setAttribute('aria-pressed', String(on));
    const s = b.querySelector('[data-motion-stato]');
    if (s) s.textContent = on ? 'attive' : 'disattivate';
  });
}

async function impostaMovimento(modo: 'full' | 'reduce', salva: boolean) {
  if (salva) {
    try {
      localStorage.setItem('gc-motion', modo === 'full' ? 'on' : 'off');
    } catch {
      /* preferenza non salvabile: vale solo per questa pagina */
    }
  }
  if (html.dataset.motion === modo) return;
  spegni();
  html.dataset.motion = modo;
  html.classList.remove('serranda');
  aggiornaToggle();
  window.dispatchEvent(new CustomEvent('gc:motion', { detail: modo }));
  await accendi();
  refresh();
}

function collegaToggle() {
  aggiornaToggle();
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-motion-toggle]');
    if (b) void impostaMovimento(èRidotto() ? 'full' : 'reduce', true);
  });
  // Se cambia la preferenza di sistema e l'utente non ha scelto, la seguiamo.
  mqRidotto.addEventListener('change', (m) => {
    if (!preferenzaSalvata()) void impostaMovimento(m.matches ? 'reduce' : 'full', false);
  });
  // Il menu mobile blocca lo scroll: fermiamo anche Lenis.
  window.addEventListener('gc:scroll-blocco', (e) => {
    const blocca = (e as CustomEvent<boolean>).detail;
    if (blocca) ctx?.lenis?.stop();
    else ctx?.lenis?.start();
  });
}

/** Immagini lazy: dissolvenza in apertura quando sono decodificate. */
function collegaImmagini() {
  document.querySelectorAll<HTMLImageElement>('.skeleton img[loading="lazy"]').forEach((img) => {
    const fatto = () => img.classList.add('caricata');
    if (img.complete) fatto();
    else {
      img.addEventListener('load', () => img.decode().then(fatto, fatto), { once: true });
      img.addEventListener('error', fatto, { once: true });
    }
  });
}

/** Moduli presenti in ogni pagina. */
function registraGlobali() {
  registra({ nome: 'reveals', carica: () => import('./reveals'), quando: 'vicino' });
  if (mqMouse.matches) {
    registra({ nome: 'magnetic', carica: () => import('./magnetic'), quando: 'idle' });
    registra({ nome: 'cursor', carica: () => import('./cursor'), quando: 'idle' });
  }
  if (html.classList.contains('serranda')) {
    registra({
      nome: 'preloader',
      carica: () => import('./preloader'),
      quando: 'subito',
      sempre: true,
    });
  }
}

/** Avvio: chiamato una volta da Base.astro. */
export function avvia() {
  if (avviato) return;
  avviato = true;
  window.__gcMotion = true;
  html.classList.remove('motion-ko');
  collegaToggle();
  collegaImmagini();
  registraGlobali();
  // I moduli delle sezioni si registrano nei loro <script>, eseguiti in ordine
  // di documento: aspettiamo la fine della coda dei moduli prima di accendere.
  queueMicrotask(() => void accendi());
}
