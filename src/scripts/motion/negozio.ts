/**
 * Mini-mappa di Latina Est: prima si disegnano le strade (stroke-dashoffset su
 * pathLength=1, come DrawSVG), poi compare la croce verde della farmacia,
 * infine il pin di Gino Casa cade e rimbalza, con l'etichetta.
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

const mms: gsap.MatchMedia[] = [];

export function init(ctx: Contesto) {
  const { gsap } = ctx;
  document.querySelectorAll<HTMLElement>('[data-mappa-quartiere]').forEach((mappa) => {
    mms.push(
      conMedia(ctx, mappa, () => {
        if (mappa.getBoundingClientRect().top < window.innerHeight * 0.6) return; // già in vista: nessuna sorpresa
        const strade = mappa.querySelectorAll('.mq-strade path');
        const farmacia = mappa.querySelector('.mq-farmacia');
        const pin = mappa.querySelector('.mq-pin__corpo');
        const etichetta = mappa.querySelector('.mq-etichetta');
        const isolati = mappa.querySelectorAll('.mq-isolati rect, .mq-alberi circle');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: mappa, start: 'top 75%', once: true },
        });
        tl.from(isolati, { opacity: 0, duration: 0.5, stagger: 0.02, ease: 'none' })
          .fromTo(
            strade,
            { strokeDasharray: 1, strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.9, stagger: 0.08, ease: 'power2.inOut' },
            0.1,
          )
          .from(
            farmacia,
            { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)' },
            '-=0.3',
          )
          .from(pin, { y: -220, duration: 0.9, ease: 'bounce.out' }, '-=0.1')
          .from(
            etichetta,
            {
              scale: 0.4,
              opacity: 0,
              transformOrigin: '50% 50%',
              duration: 0.5,
              ease: 'back.out(2)',
            },
            '-=0.3',
          );
      }),
    );
  });
}

export function destroy() {
  mms.splice(0).forEach((m) => m.revert());
}
