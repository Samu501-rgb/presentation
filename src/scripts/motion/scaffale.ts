/**
 * Lo scaffale infinito — tela trascinabile e toggle Tela/Griglia.
 *
 * - Tela: Draggable + InertiaPlugin (import() dinamico, solo in questa pagina),
 *   navigabile con trascinamento, rotella/trackpad e frecce da tastiera; il focus
 *   da tastiera su un prodotto porta la tela a centrarlo.
 * - Griglia: layout classico. È il default su mobile e con movimento ridotto.
 * - Il passaggio Tela ↔ Griglia usa Flip (absolute: true) se le animazioni sono attive.
 * - Virtualizzazione: content-visibility sulle voci (gli oggetti fuori schermo
 *   non vengono disegnati); oltre 150 voci niente Flip.
 * Modulo "funzionale": gira anche con movimento ridotto (senza inerzia né Flip).
 */
import type { Contesto } from './setup';

type Vista = 'tela' | 'griglia';
let pulizia: (() => void) | null = null;
let distruggiTela: (() => void) | null = null;

export async function init(ctx: Contesto) {
  const { gsap } = ctx;
  const sez = document.querySelector<HTMLElement>('[data-scaffale]');
  if (!sez) return;
  const finestra = sez.querySelector<HTMLElement>('[data-finestra]')!;
  const piano = sez.querySelector<HTMLElement>('[data-piano]')!;
  const bottoni = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-vista-btn]'));
  const voci = () => Array.from(piano.querySelectorAll<HTMLElement>('[data-voce]:not([hidden])'));
  const ridotto = () => document.documentElement.dataset.motion === 'reduce';

  // Colonne della tela: stabili, calcolate sul totale (≈ rapporto 16:10).
  const totale = piano.querySelectorAll('[data-voce]').length;
  piano.style.setProperty(
    '--colonne',
    String(gsap.utils.clamp(4, 14, Math.ceil(Math.sqrt(totale * 1.6)))),
  );

  async function attivaTela() {
    const [{ Draggable }, { InertiaPlugin }] = await Promise.all([
      import('gsap/Draggable'),
      import('gsap/InertiaPlugin'),
    ]);
    gsap.registerPlugin(Draggable, InertiaPlugin);
    finestra.tabIndex = 0;
    finestra.dataset.cursor = 'Trascina';

    const limiti = () => {
      const fw = finestra.clientWidth;
      const fh = finestra.clientHeight;
      const pw = piano.offsetWidth;
      const ph = piano.offsetHeight;
      const cx = (fw - pw) / 2;
      const cy = (fh - ph) / 2;
      return {
        minX: pw > fw ? fw - pw : cx,
        maxX: pw > fw ? 0 : cx,
        minY: ph > fh ? fh - ph : cy,
        maxY: ph > fh ? 0 : cy,
      };
    };
    const centra = () => {
      const l = limiti();
      gsap.set(piano, { x: (l.minX + l.maxX) / 2, y: l.maxY - (l.maxY - l.minY) * 0.1 });
    };
    centra();

    let trascinato = false;
    const [drag] = Draggable.create(piano, {
      type: 'x,y',
      bounds: limiti(),
      inertia: !ridotto(),
      edgeResistance: 0.85,
      dragClickables: true,
      minimumMovement: 6,
      allowContextMenu: true,
      onDragStart: () => (trascinato = true),
      onRelease: () => window.setTimeout(() => (trascinato = false), 60),
    });

    const aggiornaLimiti = () => {
      drag.applyBounds(limiti());
    };
    const blocca = (e: MouseEvent) => {
      if (trascinato) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const clamp = (x: number, y: number) => {
      const l = limiti();
      return { x: gsap.utils.clamp(l.minX, l.maxX, x), y: gsap.utils.clamp(l.minY, l.maxY, y) };
    };
    const spostaDi = (dx: number, dy: number, durata = 0.6) => {
      const cur = {
        x: Number(gsap.getProperty(piano, 'x')),
        y: Number(gsap.getProperty(piano, 'y')),
      };
      const n = clamp(cur.x + dx, cur.y + dy);
      const cambiato = Math.abs(n.x - cur.x) > 0.5 || Math.abs(n.y - cur.y) > 0.5;
      if (cambiato)
        gsap.to(piano, {
          ...n,
          duration: ridotto() ? 0 : durata,
          ease: 'power3.out',
          overwrite: true,
          onUpdate: () => drag.update(),
        });
      return cambiato;
    };
    // Rotella/trackpad: la tela scorre finché non tocca un bordo, poi scorre la pagina.
    const ruota = (e: WheelEvent) => {
      if (spostaDi(-e.deltaX, -e.deltaY, 0.5)) e.preventDefault();
    };
    const tasti = (e: KeyboardEvent) => {
      if (e.target !== finestra) return;
      const passi: Record<string, [number, number]> = {
        ArrowLeft: [160, 0],
        ArrowRight: [-160, 0],
        ArrowUp: [0, 160],
        ArrowDown: [0, -160],
      };
      const p = passi[e.key];
      if (p) {
        e.preventDefault();
        spostaDi(p[0], p[1]);
      }
    };
    // Focus da tastiera su un prodotto: centralo nella finestra.
    const alFocus = (e: FocusEvent) => {
      const voce = (e.target as HTMLElement).closest<HTMLElement>('[data-voce]');
      if (!voce) return;
      finestra.scrollTop = 0;
      finestra.scrollLeft = 0;
      const fr = finestra.getBoundingClientRect();
      const vr = voce.getBoundingClientRect();
      spostaDi(
        fr.left + fr.width / 2 - (vr.left + vr.width / 2),
        fr.top + fr.height / 2 - (vr.top + vr.height / 2),
        0.5,
      );
    };

    piano.addEventListener('click', blocca, true);
    finestra.addEventListener('wheel', ruota, { passive: false });
    finestra.addEventListener('keydown', tasti);
    finestra.addEventListener('focusin', alFocus);
    window.addEventListener('resize', aggiornaLimiti);
    window.addEventListener('scaffale:filtrato', aggiornaLimiti);

    distruggiTela = () => {
      drag.kill();
      piano.removeEventListener('click', blocca, true);
      finestra.removeEventListener('wheel', ruota);
      finestra.removeEventListener('keydown', tasti);
      finestra.removeEventListener('focusin', alFocus);
      window.removeEventListener('resize', aggiornaLimiti);
      window.removeEventListener('scaffale:filtrato', aggiornaLimiti);
      finestra.removeAttribute('tabindex');
      delete finestra.dataset.cursor;
      gsap.set(piano, { clearProps: 'transform' });
      distruggiTela = null;
    };
  }

  async function imposta(vista: Vista, anima: boolean) {
    const elenco = voci();
    const conFlip = anima && !ridotto() && elenco.length <= 150;
    let statoFlip: Flip.FlipState | null = null;
    let FlipCls: typeof Flip | null = null;
    if (conFlip) {
      ({ Flip: FlipCls } = await import('gsap/Flip'));
      gsap.registerPlugin(FlipCls);
      statoFlip = FlipCls.getState(elenco);
    }
    distruggiTela?.();
    sez!.dataset.vista = vista;
    bottoni.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.vistaBtn === vista)));
    if (vista === 'tela') await attivaTela();
    if (FlipCls && statoFlip) {
      FlipCls.from(statoFlip, {
        absolute: true,
        duration: 0.9,
        ease: 'expo.inOut',
        stagger: 0.01,
        scale: true,
      });
    }
    if (anima) sez!.scrollIntoView({ block: 'start', behavior: ridotto() ? 'auto' : 'smooth' });
  }

  const clic = (e: Event) => {
    const v = (e.currentTarget as HTMLElement).dataset.vistaBtn as Vista;
    sez.dataset.sceltaVista = v;
    if (v !== sez.dataset.vista) void imposta(v, true);
  };
  bottoni.forEach((b) => b.addEventListener('click', clic));

  // Vista iniziale: tela solo su desktop con animazioni attive (o scelta esplicita).
  const scelta = sez.dataset.sceltaVista as Vista | undefined;
  const iniziale: Vista =
    scelta ?? (!ridotto() && matchMedia('(min-width: 1024px)').matches ? 'tela' : 'griglia');
  await imposta(iniziale, false);

  pulizia = () => {
    bottoni.forEach((b) => b.removeEventListener('click', clic));
    distruggiTela?.();
  };
}

export function destroy() {
  pulizia?.();
  pulizia = null;
}
