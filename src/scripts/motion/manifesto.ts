/**
 * Manifesto, fallback GSAP (solo se il browser NON supporta animation-timeline):
 * opacità delle parole da 0.15 a 1 in scrub, adesivo limone che si "stampa".
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  if (CSS.supports('animation-timeline: view()')) return;
  const { gsap } = ctx;
  document.querySelectorAll<HTMLElement>('[data-manifesto]').forEach((sez) => {
    mm = conMedia(ctx, sez, () => {
      const parole = sez.querySelectorAll('.parola');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sez, start: 'top 75%', end: 'bottom 45%', scrub: 1 },
      });
      tl.fromTo(parole, { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: 'none' });
      const chiave = sez.querySelector<HTMLElement>('.parola--chiave');
      if (chiave) {
        // Il pseudo-elemento non è animabile: usiamo un adesivo reale clonato.
        const adesivo = document.createElement('span');
        adesivo.setAttribute('aria-hidden', 'true');
        adesivo.className = 'manifesto__adesivo';
        Object.assign(adesivo.style, {
          position: 'absolute',
          inset: '0.08em -0.04em 0.02em',
          zIndex: '-1',
          borderRadius: '0.2em',
          background: 'var(--color-limone)',
        });
        chiave.classList.add('parola--js');
        chiave.prepend(adesivo);
        tl.fromTo(
          adesivo,
          { scale: 0, rotation: -8 },
          { scale: 1, rotation: -3, ease: 'back.out(2)', duration: 0.4 },
          0.55,
        );
        return () => {
          adesivo.remove();
          chiave.classList.remove('parola--js');
        };
      }
    });
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
