/**
 * Pulsanti magnetici: quickTo su x/y entro un raggio di 80px, ritorno elastico.
 * Solo con (hover: hover) and (pointer: fine).
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  const { gsap } = ctx;
  mm = conMedia(ctx, null, ({ mouse }) => {
    if (!mouse) return;
    const RAGGIO = 80;
    const pulsanti = gsap.utils.toArray<HTMLElement>('[data-magnetic]');
    const stati = pulsanti.map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' }),
      dentro: false,
    }));
    const muovi = (e: PointerEvent) => {
      for (const s of stati) {
        const r = s.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const limite = Math.max(r.width, r.height) / 2 + RAGGIO;
        if (Math.hypot(dx, dy) < limite) {
          s.dentro = true;
          s.x(dx * 0.3);
          s.y(dy * 0.35);
        } else if (s.dentro) {
          s.dentro = false;
          gsap.to(s.el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: true });
        }
      }
    };
    window.addEventListener('pointermove', muovi, { passive: true });
    return () => {
      window.removeEventListener('pointermove', muovi);
      gsap.set(pulsanti, { clearProps: 'transform' });
    };
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
