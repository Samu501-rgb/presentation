/**
 * Reveal globali (.reveal): fallback GSAP per i browser SENZA animation-timeline.
 * Dove il CSS legato allo scroll è supportato, se ne occupa global.css.
 * Anima solo opacity/transform; gli elementi già visibili all'avvio non vengono nascosti.
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  if (CSS.supports('animation-timeline: view()')) return;
  const { gsap, ScrollTrigger } = ctx;
  mm = conMedia(ctx, null, () => {
    const sotto = gsap.utils
      .toArray<HTMLElement>('.reveal')
      .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    if (!sotto.length) return;
    gsap.set(sotto, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(sotto, {
      start: 'top 88%',
      once: true,
      onEnter: (lotto) =>
        gsap.to(lotto, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
          overwrite: true,
        }),
    });
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
