/**
 * Offerte: bollino che entra con rotazione e rimbalzo, prezzo barrato che si
 * "taglia" (scaleX della linea), tilt 3D leggero su hover (max 6°, quickTo,
 * solo pointer fine).
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

const mms: gsap.MatchMedia[] = [];

export function init(ctx: Contesto) {
  const { gsap, ScrollTrigger } = ctx;
  document.querySelectorAll<HTMLElement>('[data-offerte], [data-offerte-pagina]').forEach((sez) => {
    mms.push(
      conMedia(ctx, sez, ({ mouse }) => {
        const card = gsap.utils.toArray<HTMLElement>('[data-offerta-card]', sez);
        card.forEach((c) => {
          const bollino = c.querySelector('[data-bollino]');
          const barrato = c.querySelector<HTMLElement>('[data-barrato]');
          if (c.getBoundingClientRect().top > window.innerHeight) {
            gsap.set(c, { autoAlpha: 0, y: 40 });
            if (bollino) gsap.set(bollino, { scale: 0, rotation: -90 });
            if (barrato) gsap.set(barrato, { '--taglio': 0 });
          }
        });
        ScrollTrigger.batch(card, {
          start: 'top 85%',
          once: true,
          onEnter: (lotto) => {
            gsap.to(lotto, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: 'power3.out',
            });
            lotto.forEach((c, i) => {
              const bollino = c.querySelector('[data-bollino]');
              const barrato = c.querySelector('[data-barrato]');
              if (bollino)
                gsap.to(bollino, {
                  scale: 1,
                  rotation: -8,
                  duration: 0.9,
                  delay: 0.25 + i * 0.08,
                  ease: 'back.out(2.2)',
                });
              if (barrato)
                gsap.to(barrato, {
                  '--taglio': 1,
                  duration: 0.6,
                  delay: 0.5 + i * 0.08,
                  ease: 'expo.inOut',
                });
            });
          },
        });

        if (!mouse) return;
        const pulizie = card.map((c) => {
          const corpo = c.querySelector<HTMLElement>('[data-tilt]');
          if (!corpo) return () => {};
          gsap.set(corpo, { transformPerspective: 800 });
          const rx = gsap.quickTo(corpo, 'rotationX', { duration: 0.5, ease: 'power3.out' });
          const ry = gsap.quickTo(corpo, 'rotationY', { duration: 0.5, ease: 'power3.out' });
          const muovi = (e: PointerEvent) => {
            const r = corpo.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 12);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
          };
          const esci = () => {
            rx(0);
            ry(0);
          };
          corpo.addEventListener('pointermove', muovi);
          corpo.addEventListener('pointerleave', esci);
          return () => {
            corpo.removeEventListener('pointermove', muovi);
            corpo.removeEventListener('pointerleave', esci);
          };
        });
        return () => pulizie.forEach((f) => f());
      }),
    );
  });
}

export function destroy() {
  mms.splice(0).forEach((m) => m.revert());
}
