/**
 * "Te lo troviamo": gli oggetti volano in posizione e compongono un grande "?",
 * poi il "?" si scompone e diventa una "✓" (timeline con posizioni precalcolate
 * e scrub). Lente SVG che segue il mouse (quickTo, solo pointer fine) e
 * ingrandisce gli oggetti sotto di sé.
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  const { gsap } = ctx;
  const sez = document.querySelector<HTMLElement>('[data-troviamo]');
  const palco = sez?.querySelector<HTMLElement>('[data-palco]');
  if (!sez || !palco) return;

  mm = conMedia(ctx, sez, ({ mouse }) => {
    const oggetti = gsap.utils.toArray<HTMLElement>('[data-oggetto]', palco);
    // Delta verso la "✓" in px, ricalcolato al refresh.
    const dx = (o: HTMLElement) =>
      ((Number(o.dataset.sx) - Number(o.dataset.px)) / 100) * palco.offsetWidth;
    const dy = (o: HTMLElement) =>
      ((Number(o.dataset.sy) - Number(o.dataset.py)) / 100) * palco.offsetHeight;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: palco,
        start: 'top 85%',
        end: 'bottom 25%',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    // 1) Dagli angoli al "?"
    tl.from(oggetti, {
      x: () => gsap.utils.random(-1, 1) * palco.offsetWidth * 0.8,
      y: () => gsap.utils.random(-1, 1) * palco.offsetHeight * 0.8,
      rotation: () => gsap.utils.random(-120, 120),
      scale: 0.4,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: { each: 0.04, from: 'random' },
    });
    tl.to({}, { duration: 0.35 });
    // 2) Dal "?" alla "✓"
    tl.to(oggetti, {
      x: (_i: number, o: HTMLElement) => dx(o),
      y: (_i: number, o: HTMLElement) => dy(o),
      rotation: () => gsap.utils.random(-20, 20),
      duration: 1,
      ease: 'expo.inOut',
      stagger: { each: 0.03, from: 'end' },
    });

    if (!mouse) return;
    // Lente d'ingrandimento
    const lente = palco.querySelector<SVGElement>('[data-lente]')!;
    lente.classList.remove('hidden');
    gsap.set(lente, { autoAlpha: 0, xPercent: -40, yPercent: -40 });
    const lx = gsap.quickTo(lente, 'x', { duration: 0.35, ease: 'power3.out' });
    const ly = gsap.quickTo(lente, 'y', { duration: 0.35, ease: 'power3.out' });
    // quickTo non accetta la scorciatoia "scale": due setter separati.
    const scale = oggetti.map((o) => {
      const el = o.querySelector('[data-scala]');
      const sx = gsap.quickTo(el, 'scaleX', { duration: 0.4, ease: 'power3.out' });
      const sy = gsap.quickTo(el, 'scaleY', { duration: 0.4, ease: 'power3.out' });
      return (v: number) => {
        sx(v);
        sy(v);
      };
    });
    const RAGGIO = 90;
    const muovi = (e: PointerEvent) => {
      const r = palco.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      lx(x);
      ly(y);
      oggetti.forEach((o, i) => {
        const b = o.getBoundingClientRect();
        const d = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY);
        scale[i](1 + 0.55 * Math.max(0, 1 - d / RAGGIO));
      });
    };
    const entra = () => gsap.to(lente, { autoAlpha: 1, duration: 0.3 });
    const esci = () => {
      gsap.to(lente, { autoAlpha: 0, duration: 0.3 });
      scale.forEach((s) => s(1));
    };
    sez.addEventListener('pointermove', muovi);
    sez.addEventListener('pointerenter', entra);
    sez.addEventListener('pointerleave', esci);
    return () => {
      sez.removeEventListener('pointermove', muovi);
      sez.removeEventListener('pointerenter', entra);
      sez.removeEventListener('pointerleave', esci);
      lente.classList.add('hidden');
    };
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
