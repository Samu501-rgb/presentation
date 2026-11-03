/**
 * Filtri live (scaffale e pagine reparto): reparto, colore, "in offerta", "novità".
 * Funzionano sempre; con animazioni attive il cambio di layout usa GSAP Flip
 * (caricato con import() dinamico solo qui): getState → modifica DOM → Flip.from
 * con absolute, stagger 0.02, onEnter/onLeave (scala + opacità).
 * Lo stato dei filtri finisce nell'URL (?reparto=…&colore=…) per poterlo condividere.
 */
import { contaA } from './motion/scramble';

interface Stato {
  reparto: string;
  colori: Set<string>;
  offerta: boolean;
  nuovo: boolean;
}

const LIMITE_FLIP = 150;

async function caricaFlip() {
  const [{ gsap }, { Flip }] = await Promise.all([import('gsap'), import('gsap/Flip')]);
  gsap.registerPlugin(Flip);
  return { gsap, Flip };
}

export function collegaFiltri({ scaffale = false } = {}) {
  const barra = document.querySelector<HTMLElement>('[data-filtri]');
  if (!barra) return;
  barra.hidden = false;
  const voci = Array.from(document.querySelectorAll<HTMLElement>('[data-voce]'));
  const contatore = barra.querySelector<HTMLElement>('[data-contatore]');
  const etichetta = barra.querySelector<HTMLElement>('[data-contatore-etichetta]');
  const selReparto = barra.querySelector<HTMLSelectElement>('[data-filtro-reparto]');
  const btnColori = Array.from(barra.querySelectorAll<HTMLButtonElement>('[data-filtro-colore]'));
  const btnFlag = Array.from(barra.querySelectorAll<HTMLButtonElement>('[data-filtro-flag]'));
  const azzera = barra.querySelector<HTMLButtonElement>('[data-filtri-azzera]');
  const vuoto = document.querySelector<HTMLElement>('[data-vuoto]');

  const params = new URLSearchParams(location.search);
  const stato: Stato = {
    reparto: params.get('reparto') ?? '',
    colori: new Set((params.get('colore') ?? '').split(',').filter(Boolean)),
    offerta: params.get('offerta') === '1',
    nuovo: params.get('novita') === '1',
  };

  const corrisponde = (v: HTMLElement) =>
    (!stato.reparto || v.dataset.reparto === stato.reparto) &&
    (stato.colori.size === 0 || stato.colori.has(v.dataset.colore || '')) &&
    (!stato.offerta || v.dataset.offerta === '1') &&
    (!stato.nuovo || v.dataset.nuovo === '1');

  const sincronizzaControlli = () => {
    if (selReparto) selReparto.value = stato.reparto;
    btnColori.forEach((b) =>
      b.setAttribute('aria-pressed', String(stato.colori.has(b.dataset.filtroColore || ''))),
    );
    btnFlag.forEach((b) =>
      b.setAttribute(
        'aria-pressed',
        String(b.dataset.filtroFlag === 'offerta' ? stato.offerta : stato.nuovo),
      ),
    );
    if (azzera)
      azzera.hidden = !stato.reparto && stato.colori.size === 0 && !stato.offerta && !stato.nuovo;
  };

  const aggiornaUrl = () => {
    const p = new URLSearchParams();
    if (stato.reparto && scaffale) p.set('reparto', stato.reparto);
    if (stato.colori.size) p.set('colore', [...stato.colori].join(','));
    if (stato.offerta) p.set('offerta', '1');
    if (stato.nuovo) p.set('novita', '1');
    const q = p.toString();
    history.replaceState(null, '', q ? `?${q}` : location.pathname);
  };

  let precedente = voci.length;
  const applica = async (anima: boolean) => {
    const movimento =
      anima && document.documentElement.dataset.motion === 'full' && voci.length <= LIMITE_FLIP;
    const flip = movimento ? await caricaFlip() : null;
    const statoFlip = flip?.Flip.getState(voci);
    let n = 0;
    voci.forEach((v) => {
      const ok = corrisponde(v);
      v.hidden = !ok;
      if (ok) n++;
    });
    if (flip && statoFlip) {
      const { gsap, Flip } = flip;
      Flip.from(statoFlip, {
        absolute: true,
        duration: 0.6,
        ease: 'power3.inOut',
        stagger: 0.02,
        scale: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' },
          ),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.6, duration: 0.35 }),
        onComplete: () => window.dispatchEvent(new CustomEvent('scaffale:filtrato')),
      });
    }
    window.dispatchEvent(new CustomEvent('scaffale:filtrato'));
    if (contatore) {
      if (movimento) contaA(contatore, precedente, n, 600);
      else contatore.textContent = String(n);
    }
    if (etichetta) etichetta.textContent = n === 1 ? 'oggetto' : 'oggetti';
    precedente = n;
    if (vuoto) vuoto.hidden = n > 0;
    sincronizzaControlli();
    aggiornaUrl();
  };

  selReparto?.addEventListener('change', () => {
    stato.reparto = selReparto.value;
    void applica(true);
  });
  btnColori.forEach((b) =>
    b.addEventListener('click', () => {
      const c = b.dataset.filtroColore || '';
      if (stato.colori.has(c)) stato.colori.delete(c);
      else stato.colori.add(c);
      void applica(true);
    }),
  );
  btnFlag.forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.filtroFlag === 'offerta') stato.offerta = !stato.offerta;
      else stato.nuovo = !stato.nuovo;
      void applica(true);
    }),
  );
  azzera?.addEventListener('click', () => {
    stato.reparto = '';
    stato.colori.clear();
    stato.offerta = false;
    stato.nuovo = false;
    void applica(true);
    selReparto?.focus();
  });

  void applica(false);
}
