/**
 * "Una giornata in casa" — storytelling bloccato.
 *
 * ≥ 768px: ScrollTrigger con pin (≈ 400vh) e scrub: 1. Timeline in 4 capitoli:
 *   - sfondi sovrapposti in crossfade (limone → pomodoro → mare → bonifica);
 *   - orologio con cifre che rotolano in verticale da 07:30 a 21:00;
 *   - oggetti che entrano dai bordi ed escono con clip-path;
 *   - titoli con mask-reveal di SplitText (righe).
 *   Tacche cliccabili (scorriA al capitolo) e focus da tastiera: se un link di un
 *   capitolo riceve il focus, la pagina scorre a quel capitolo (nessuna trappola).
 * < 768px: niente pin, blocchi impilati con reveal semplici.
 */
import type { Contesto } from './setup';
import { conMedia, scorriA } from './setup';

let mm: gsap.MatchMedia | null = null;

const INK = '#1F1A17';
const CARTA = '#F5EFE4';

export function init(ctx: Contesto) {
  const { gsap, ScrollTrigger, SplitText } = ctx;
  const sez = document.querySelector<HTMLElement>('[data-giornata]');
  if (!sez) return;
  const palco = sez.querySelector<HTMLElement>('[data-giornata-palco]')!;
  const cifre: number[][] = JSON.parse(sez.dataset.cifre || '[]');

  mm = conMedia(ctx, sez, ({ isTablet }) => {
    if (!isTablet) return mobile();
    return bloccata();
  });

  /* ---------------------------- mobile ---------------------------- */
  function mobile() {
    const blocchi = gsap.utils.toArray<HTMLElement>('[data-capitolo]', sez!);
    blocchi.forEach((b) => {
      const parti = b.querySelectorAll('.giornata__testo > *, [data-oggetto]');
      if (b.getBoundingClientRect().top < window.innerHeight) return;
      gsap.from(parti, {
        autoAlpha: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: b, start: 'top 80%', once: true },
      });
    });
  }

  /* ---------------------------- bloccata ---------------------------- */
  function bloccata() {
    sez!.classList.add('giornata--pin');
    const capitoli = gsap.utils.toArray<HTMLElement>('[data-capitolo]', sez!);
    const sfondi = gsap.utils.toArray<HTMLElement>('[data-sfondo]', sez!);
    const colonne = gsap.utils.toArray<HTMLElement>('[data-colonna]', sez!);
    const testata = sez!.querySelector<HTMLElement>('.giornata__testata')!;
    const nav = sez!.querySelector<HTMLElement>('[data-tacche]')!;
    const tacche = gsap.utils.toArray<HTMLButtonElement>('[data-tacca]', sez!);
    const riempimenti = gsap.utils.toArray<HTMLElement>('[data-tacca-riempi]', sez!);
    nav.hidden = false;

    const PASSO = 1.5;
    const TOTALE = PASSO * (capitoli.length - 1) + 0.5;
    const tempoCapitolo = (k: number) => (k === 0 ? 0 : (k - 1) * PASSO + PASSO);

    const splits = capitoli.map((c) =>
      SplitText.create(c.querySelector('.giornata__titolo-testo'), {
        type: 'lines',
        mask: 'lines',
        aria: 'none',
      }),
    );
    const parti = capitoli.map((c, i) => ({
      righe: splits[i].lines,
      testo: c.querySelectorAll(
        '.giornata__descrizione, [data-capitolo-link], .giornata__titolo .occhiello',
      ),
      oggetti: c.querySelectorAll<HTMLElement>('[data-oggetto]'),
      scuro: c.dataset.scuro === '1',
    }));

    // Stati iniziali: visibile solo il primo capitolo.
    gsap.set(sfondi.slice(1), { opacity: 0 });
    capitoli.forEach((c, i) => {
      gsap.set(c, { opacity: i === 0 ? 1 : 0, pointerEvents: i === 0 ? 'auto' : 'none' });
      if (i === 0) return;
      gsap.set(parti[i].righe, { yPercent: 100 });
      gsap.set(parti[i].testo, { opacity: 0, y: 24 });
      parti[i].oggetti.forEach((o, k) =>
        gsap.set(o, {
          x: (k % 2 ? 1 : -1) * window.innerWidth * 0.5,
          rotation: k % 2 ? 40 : -40,
          opacity: 0,
        }),
      );
    });
    colonne.forEach((col, c) => gsap.set(col, { yPercent: -10 * cifre[0][c] }));
    gsap.set([testata, nav], { color: parti[0].scuro ? CARTA : INK });

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    for (let i = 1; i < capitoli.length; i++) {
      const s = (i - 1) * PASSO + 0.5;
      const prima = parti[i - 1];
      const dopo = parti[i];
      // Sfondo: crossfade del layer successivo (sta sopra al precedente).
      tl.to(sfondi[i], { opacity: 1, duration: 1, ease: 'none' }, s);
      // Orologio: ogni colonna rotola fino alla nuova cifra.
      colonne.forEach((col, c) =>
        tl.to(col, { yPercent: -10 * cifre[i][c], duration: 0.8 }, s + 0.1),
      );
      tl.to(
        [testata, nav],
        { color: dopo.scuro ? CARTA : INK, duration: 0.4, ease: 'none' },
        s + 0.3,
      );
      // Uscita del capitolo precedente.
      tl.to(prima.righe, { yPercent: -100, duration: 0.5, stagger: 0.05, ease: 'power3.in' }, s);
      tl.to(prima.testo, { opacity: 0, y: -24, duration: 0.4 }, s);
      tl.fromTo(
        prima.oggetti,
        { clipPath: 'inset(0% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          y: -60,
          duration: 0.55,
          stagger: 0.05,
          ease: 'power3.in',
        },
        s,
      );
      tl.set(capitoli[i - 1], { opacity: 0 }, s + 0.55);
      // Entrata del capitolo nuovo.
      tl.set(capitoli[i], { opacity: 1 }, s + 0.35);
      tl.to(
        dopo.oggetti,
        { x: 0, rotation: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'casa' },
        s + 0.35,
      );
      tl.to(
        dopo.righe,
        { yPercent: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' },
        s + 0.45,
      );
      tl.to(
        dopo.testo,
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' },
        s + 0.6,
      );
    }
    tl.to({}, { duration: TOTALE - tl.duration() });

    let attivo = 0;
    const st = ScrollTrigger.create({
      trigger: sez,
      pin: palco,
      start: 'top top',
      end: '+=300%',
      scrub: 1,
      anticipatePin: 1,
      animation: tl,
      onUpdate(self) {
        const t = self.progress * TOTALE;
        // Capitolo più vicino al tempo corrente.
        let migliore = 0;
        capitoli.forEach((_, k) => {
          if (Math.abs(t - tempoCapitolo(k)) < Math.abs(t - tempoCapitolo(migliore))) migliore = k;
        });
        if (migliore !== attivo) {
          attivo = migliore;
          capitoli.forEach((c, k) => (c.style.pointerEvents = k === attivo ? 'auto' : 'none'));
          tacche.forEach((b, k) =>
            k === attivo
              ? b.setAttribute('aria-current', 'step')
              : b.removeAttribute('aria-current'),
          );
        }
        riempimenti.forEach((r, k) =>
          gsap.set(r, { scaleX: gsap.utils.clamp(0, 1, t / PASSO - k + 1) }),
        );
      },
    });
    tacche[0]?.setAttribute('aria-current', 'step');

    const posizione = (k: number) =>
      st.start + (tempoCapitolo(k) / TOTALE) * (st.end - st.start) + 2;
    const clicTacca = (e: Event) => {
      const k = Number((e.currentTarget as HTMLElement).dataset.tacca);
      scorriA(posizione(k));
    };
    tacche.forEach((b) => b.addEventListener('click', clicTacca));

    // Tab su un link di un capitolo nascosto: scorri a quel capitolo.
    const alFocus = (e: FocusEvent) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>('[data-capitolo]');
      if (!c) return;
      const k = Number(c.dataset.capitolo);
      if (k !== attivo) {
        attivo = k;
        window.scrollTo({ top: posizione(k), behavior: 'auto' });
        ctx.lenis?.scrollTo(posizione(k), { immediate: true });
      }
    };
    sez!.addEventListener('focusin', alFocus);

    return () => {
      tacche.forEach((b) => b.removeEventListener('click', clicTacca));
      sez!.removeEventListener('focusin', alFocus);
      splits.forEach((s) => s.revert());
      nav.hidden = true;
      sez!.classList.remove('giornata--pin');
    };
  }

  // Se cambia la larghezza, le righe di SplitText vanno ricalcolate: ricostruiamo.
  let ultimaLarghezza = window.innerWidth;
  let timer = 0;
  alRidimensiona = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (Math.abs(window.innerWidth - ultimaLarghezza) < 40) return;
      ultimaLarghezza = window.innerWidth;
      destroy();
      init(ctx);
    }, 300);
  };
  window.addEventListener('resize', alRidimensiona);
}

let alRidimensiona: (() => void) | null = null;

export function destroy() {
  if (alRidimensiona) window.removeEventListener('resize', alRidimensiona);
  alRidimensiona = null;
  mm?.revert();
  mm = null;
}
