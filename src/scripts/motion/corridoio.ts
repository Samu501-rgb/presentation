/**
 * Corridoio dei reparti — desktop (≥ 1024px, gsap.matchMedia):
 * pin del contenitore e traslazione x del binario in scrub. Dentro, con
 * containerAnimation: clip-path dell'immagine da inset(0 100% 0 0) a inset(0),
 * parallax interno degli oggetti, numero grande che scorre più lento.
 * Barra di avanzamento, frecce e tastiera; il focus su una card fuori schermo
 * porta la pagina alla posizione giusta.
 */
import type { Contesto } from './setup';
import { conMedia, scorriA } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  const { gsap, ScrollTrigger } = ctx;
  const sez = document.querySelector<HTMLElement>('[data-corridoio]');
  if (!sez) return;

  mm = conMedia(ctx, sez, ({ isDesktop }) => {
    const card = gsap.utils.toArray<HTMLElement>('[data-card]', sez);

    // Sotto 1024px resta la riga nativa con scroll-snap (scripts/corridoio-nativo.ts).
    if (!isDesktop) return;

    sez.classList.add('corridoio--pin');
    const palco = sez.querySelector<HTMLElement>('[data-corridoio-palco]')!;
    const finestra = sez.querySelector<HTMLElement>('[data-corridoio-finestra]')!;
    const binario = sez.querySelector<HTMLElement>('[data-binario]')!;
    const barra = sez.querySelector<HTMLElement>('[data-avanzamento]');
    finestra.scrollLeft = 0;

    const distanza = () => Math.max(0, binario.scrollWidth - window.innerWidth);
    /** % del viewport in cui la card ha finito di rivelarsi (≤ 45%, o la sua posizione finale). */
    const fineRivelazione = (c: HTMLElement) => {
      const finale = ((c.offsetLeft - distanza()) / window.innerWidth) * 100;
      return Math.round(Math.max(5, Math.min(45, finale - 2)));
    };

    const scorrimento = gsap.to(binario, {
      x: () => -distanza(),
      ease: 'none',
      scrollTrigger: {
        trigger: sez,
        pin: palco,
        start: 'top top',
        end: () => `+=${distanza()}`,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => barra && gsap.set(barra, { scaleX: self.progress }),
      },
    });

    card.forEach((c) => {
      const visual = c.querySelector<HTMLElement>('[data-visual]');
      const oggetti = c.querySelector<HTMLElement>('[data-parallasse]');
      const numero = c.querySelector<HTMLElement>('[data-numero]');
      // Le prime card sono già nel viewport: niente maschera iniziale.
      const giàVisibile = c.getBoundingClientRect().left < window.innerWidth * 0.9;
      if (visual && !giàVisibile) {
        gsap.fromTo(
          visual,
          { clipPath: 'inset(0% 100% 0% 0% round 24px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            ease: 'none',
            scrollTrigger: {
              trigger: c,
              containerAnimation: scorrimento,
              // Le ultime card non arrivano mai al 45% del viewport: la rivelazione
              // deve finire entro la loro posizione finale.
              start: () => `left ${fineRivelazione(c) + 45}%`,
              end: () => `left ${fineRivelazione(c)}%`,
              scrub: true,
            },
          },
        );
      }
      if (oggetti) {
        gsap.fromTo(
          oggetti,
          { xPercent: 12 },
          {
            xPercent: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: c,
              containerAnimation: scorrimento,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      }
      if (numero) {
        gsap.fromTo(
          numero,
          { xPercent: -30 },
          {
            xPercent: 40,
            ease: 'none',
            scrollTrigger: {
              trigger: c,
              containerAnimation: scorrimento,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      }
    });

    const st = scorrimento.scrollTrigger!;
    const posizioneCard = (i: number) => {
      const primo = card[0].offsetLeft;
      const quota = gsap.utils.clamp(0, 1, (card[i].offsetLeft - primo) / Math.max(1, distanza()));
      return st.start + quota * (st.end - st.start);
    };
    const indiceCorrente = () => Math.round(st.progress * (card.length - 1));

    // Frecce (evento dal modulo nativo) e focus da tastiera.
    const vai = (e: Event) => {
      const delta = (e as CustomEvent<number>).detail;
      const i = gsap.utils.clamp(0, card.length - 1, indiceCorrente() + delta);
      scorriA(posizioneCard(i));
    };
    const alFocus = (e: FocusEvent) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>('[data-card]');
      if (!c) return;
      finestra.scrollLeft = 0;
      const r = c.getBoundingClientRect();
      if (r.left < 0 || r.right > window.innerWidth) {
        const y = posizioneCard(card.indexOf(c));
        window.scrollTo({ top: y, behavior: 'auto' });
        ctx.lenis?.scrollTo(y, { immediate: true });
      }
    };
    sez.addEventListener('corridoio:vai', vai);
    sez.addEventListener('focusin', alFocus);
    ScrollTrigger.refresh();

    return () => {
      sez.removeEventListener('corridoio:vai', vai);
      sez.removeEventListener('focusin', alFocus);
      sez.classList.remove('corridoio--pin');
    };
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
