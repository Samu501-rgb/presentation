/**
 * Hero: oggetti che si "posano" con un piccolo rimbalzo, sottotitolo e CTA con
 * SplitText (righe mascherate), sottolineato di "Latina Est", parallax al mouse
 * (±12px, solo pointer fine) e separazione in profondità allo scroll.
 * L'H1 non viene mai nascosto: allo scroll scala solo da 1 a 0.92.
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;
let split: SplitText | null = null;

export function init(ctx: Contesto) {
  const { gsap, SplitText } = ctx;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const oggetti = gsap.utils.toArray<HTMLElement>('.hero__oggetto', hero);
  const interni = oggetti.map((o) => o.firstElementChild as HTMLElement);
  const sotto = hero.querySelector<HTMLElement>('[data-hero-sotto]')!;
  const cta = gsap.utils.toArray<HTMLElement>('.hero__cta-maschera > *', hero);
  const sottolinea = hero.querySelector<HTMLElement>('[data-sottolinea]');
  const titolo = hero.querySelector<HTMLElement>('[data-hero-titolo]');
  const giro = hero.querySelector('[data-bollino-giro]');
  // Se c'è la serranda, aspettiamo che salga (≈ 0.5 s) prima dell'entrata.
  const ritardo = document.documentElement.classList.contains('serranda') ? 0.55 : 0.1;

  mm = conMedia(ctx, hero, ({ mouse }) => {
    // 1) Oggetti sparsi e ruotati che si posano intorno al titolo.
    gsap.fromTo(
      interni,
      {
        opacity: 0,
        x: () => gsap.utils.random(-180, 180),
        y: () => gsap.utils.random(-220, 120),
        rotation: () => gsap.utils.random(-70, 70),
        scale: 0.6,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: (i) =>
          Number(getComputedStyle(oggetti[i]).getPropertyValue('--rot').replace('deg', '')) || 0,
        scale: 1,
        duration: 1.2,
        ease: 'back.out(1.5)',
        stagger: { each: 0.06, from: 'random' },
        delay: ritardo,
      },
    );

    // 2) Sottotitolo a righe mascherate (rigenerato in onSplit se cambia il layout).
    split = SplitText.create(sotto, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(sotto, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          delay: ritardo + 0.15,
        });
      },
    });

    // 3) CTA che salgono dalla loro maschera.
    gsap.fromTo(
      cta,
      { y: 0, yPercent: 110 },
      { yPercent: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: ritardo + 0.35 },
    );

    // 4) Sottolineato pomodoro su "Latina Est" (scaleX 0→1, origine a sinistra).
    if (sottolinea)
      gsap.fromTo(
        sottolinea,
        { '--linea': 0 },
        { '--linea': 1, duration: 0.9, ease: 'expo.inOut', delay: ritardo + 0.7 },
      );

    // 5) Scroll: oggetti in profondità a velocità diverse, titolo che scala 1→0.92.
    oggetti.forEach((o) => {
      const p = Number(o.dataset.profondita) || 1;
      gsap.to(o, {
        yPercent: -60 * p,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
      });
    });
    if (titolo) {
      gsap.to(titolo, {
        scale: 0.92,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }
    if (giro) {
      gsap.to(giro, {
        rotation: 200,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }

    // 6) Parallax leggero al mouse (±12px), solo con pointer fine.
    if (!mouse) return;
    // Il parallax agisce sul contenitore esterno (x/y in px), lo scroll su yPercent:
    // le due animazioni non si sovrascrivono.
    const movitori = oggetti.map((el) => ({
      p: Number(el.dataset.profondita) || 1,
      x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
    }));
    const muovi = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      for (const m of movitori) {
        m.x(nx * 24 * (m.p / 1.6));
        m.y(ny * 24 * (m.p / 1.6));
      }
    };
    hero.addEventListener('pointermove', muovi, { passive: true });
    return () => hero.removeEventListener('pointermove', muovi);
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
  split?.revert();
  split = null;
}
