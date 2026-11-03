/**
 * "Prenota e ritira": numeri 1-2-3 con breve scramble, linea tratteggiata tipo
 * scontrino che si disegna con lo scroll (stroke-dashoffset, come DrawSVG),
 * bolle WhatsApp una alla volta con l'indicatore "sta scrivendo…".
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';
import { scramble } from './scramble';

let mm: gsap.MatchMedia | null = null;
const annulla: (() => void)[] = [];

export function init(ctx: Contesto) {
  const { gsap, ScrollTrigger } = ctx;
  const sez = document.querySelector<HTMLElement>('[data-prenota]');
  if (!sez) return;

  mm = conMedia(ctx, sez, () => {
    // Linea tratteggiata: maschera disegnata con lo scroll. Il tratteggio resta
    // nello stroke-dasharray; la "penna" è un clip-path sull'SVG (solo transform/clip).
    sez.querySelectorAll<SVGPathElement>('[data-linea]').forEach((p) => {
      const svg = p.ownerSVGElement!;
      const orizzontale = svg.classList.contains('prenota__linea--orizzontale');
      gsap.fromTo(
        svg,
        { clipPath: orizzontale ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: sez.querySelector('.prenota__passi'),
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 1,
          },
        },
      );
    });

    // Passi in sequenza + numeri con scramble.
    const passi = gsap.utils.toArray<HTMLElement>('[data-passo]', sez);
    gsap.set(passi, { autoAlpha: 0, y: 30 });
    ScrollTrigger.create({
      trigger: sez.querySelector('.prenota__passi'),
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(passi, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.18, ease: 'power3.out' });
        passi.forEach((p, i) => {
          const n = p.querySelector<HTMLElement>('[data-numero]');
          if (n)
            window.setTimeout(
              () => annulla.push(scramble(n, n.dataset.numero || '', 500)),
              i * 180,
            );
        });
      },
    });

    // Chat: bolle una alla volta, con "sta scrivendo…" prima della risposta.
    const bolle = gsap.utils.toArray<HTMLElement>('[data-bolla]', sez);
    const scrive = sez.querySelector<HTMLElement>('[data-scrive]');
    const stato = sez.querySelector<HTMLElement>('[data-sta-scrivendo-testata]');
    gsap.set(bolle, { autoAlpha: 0, y: 16, scale: 0.96, transformOrigin: 'bottom right' });
    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.5, ease: 'back.out(1.6)' },
    });
    tl.to(bolle[0], { autoAlpha: 1, y: 0, scale: 1 })
      .set(scrive, { display: 'inline-flex' }, '+=0.3')
      .call(() => stato && (stato.textContent = 'sta scrivendo…'))
      .fromTo(scrive, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 })
      .to(scrive, { autoAlpha: 0, duration: 0.2 }, '+=1')
      .set(scrive, { display: 'none' })
      .call(() => stato && (stato.textContent = 'online'))
      .to(bolle[1], { autoAlpha: 1, y: 0, scale: 1, transformOrigin: 'bottom left' })
      .to(bolle[2], { autoAlpha: 1, y: 0, scale: 1 }, '+=0.6');
    ScrollTrigger.create({
      trigger: sez.querySelector('[data-telefono]'),
      start: 'top 70%',
      once: true,
      onEnter: () => tl.play(),
    });
    return () => {
      tl.kill();
      if (scrive) scrive.style.display = '';
      if (stato) stato.textContent = 'online';
    };
  });
}

export function destroy() {
  annulla.splice(0).forEach((f) => f());
  mm?.revert();
  mm = null;
}
