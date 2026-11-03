/**
 * Marquee: due righe in direzioni opposte. La velocità aumenta con la velocità
 * di scroll (con un massimo) e torna dolcemente a quella di base; la direzione
 * segue il verso dello scroll. Pausa su hover, su focus, fuori viewport e con il
 * pulsante "Metti in pausa" (WCAG 2.2.2).
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  const { gsap, ScrollTrigger } = ctx;
  mm = conMedia(ctx, null, () => {
    const pulizie: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((sez) => {
      sez.classList.add('marquee--attivo');
      const btn = sez.querySelector<HTMLButtonElement>('[data-marquee-pausa]');
      const etichetta = btn?.querySelector('[data-marquee-etichetta]');
      const righe = Array.from(sez.querySelectorAll<HTMLElement>('.marquee__riga'));
      const VELOCITA = 60; // px al secondo

      const tween = righe.map((riga) => {
        const traccia = riga.querySelector<HTMLElement>('[data-traccia]')!;
        const dir = Number(riga.dataset.direzione) || -1;
        const larghezza = traccia.scrollWidth / 2;
        const durata = larghezza / VELOCITA;
        return {
          dir,
          t:
            dir < 0
              ? gsap.fromTo(
                  traccia,
                  { xPercent: 0 },
                  { xPercent: -50, duration: durata, ease: 'none', repeat: -1 },
                )
              : gsap.fromTo(
                  traccia,
                  { xPercent: -50 },
                  { xPercent: 0, duration: durata, ease: 'none', repeat: -1 },
                ),
        };
      });

      // Stato di pausa combinato
      let manuale = false;
      let sopra = false;
      let fuori = false;
      const applica = () => {
        const ferma = manuale || sopra || fuori;
        tween.forEach(({ t }) => (ferma ? t.pause() : t.resume()));
      };

      // Velocità e direzione legate allo scroll
      let verso = 1;
      let spinta = 0;
      const st = ScrollTrigger.create({
        trigger: sez,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
          verso = self.direction;
          spinta = Math.min(Math.abs(self.getVelocity()) / 400, 4);
        },
      });
      const tick = () => {
        spinta *= 0.92; // ritorno dolce alla velocità di base
        const scala = verso * (1 + spinta);
        tween.forEach(({ t }) => t.timeScale(gsap.utils.interpolate(t.timeScale(), scala, 0.12)));
      };
      gsap.ticker.add(tick);

      const io = new IntersectionObserver(([e]) => {
        fuori = !e.isIntersecting;
        applica();
      });
      io.observe(sez);

      const entra = () => ((sopra = true), applica());
      const esce = () => ((sopra = false), applica());
      const focusEsce = (e: FocusEvent) => {
        if (!sez.contains(e.relatedTarget as Node)) esce();
      };
      sez.addEventListener('pointerenter', entra);
      sez.addEventListener('pointerleave', esce);
      sez.addEventListener('focusin', entra);
      sez.addEventListener('focusout', focusEsce);

      const clic = () => {
        manuale = !manuale;
        btn!.setAttribute('aria-pressed', String(manuale));
        if (etichetta) etichetta.textContent = manuale ? 'Riprendi' : 'Metti in pausa';
        btn!.querySelector('[data-icona-pausa]')?.classList.toggle('hidden', manuale);
        btn!.querySelector('[data-icona-play]')?.classList.toggle('hidden', !manuale);
        applica();
      };
      if (btn) {
        btn.hidden = false;
        btn.addEventListener('click', clic);
      }

      pulizie.push(() => {
        gsap.ticker.remove(tick);
        io.disconnect();
        st.kill();
        sez.removeEventListener('pointerenter', entra);
        sez.removeEventListener('pointerleave', esce);
        sez.removeEventListener('focusin', entra);
        sez.removeEventListener('focusout', focusEsce);
        if (btn) {
          btn.removeEventListener('click', clic);
          btn.hidden = true;
        }
        sez.classList.remove('marquee--attivo');
      });
    });
    return () => pulizie.forEach((f) => f());
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
