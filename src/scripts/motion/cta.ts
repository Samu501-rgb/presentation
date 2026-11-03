/** CTA finale: il titolo si "riempie" di pomodoro da sinistra a destra in scrub. */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  const { gsap } = ctx;
  const sez = document.querySelector<HTMLElement>('[data-cta-finale]');
  const riempi = sez?.querySelector('[data-riempi]');
  if (!sez || !riempi) return;
  mm = conMedia(ctx, sez, () => {
    gsap.fromTo(
      riempi,
      { clipPath: 'inset(0% 100% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: sez, start: 'top 80%', end: 'center 45%', scrub: 1 },
      },
    );
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
