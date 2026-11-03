/**
 * Cursore personalizzato (solo desktop, mouse, animazioni attive).
 * Disco inchiostro 12px che segue il mouse (quickTo 0.15). Sopra [data-cursor]
 * diventa una pillola con etichetta ("Guarda", "Trascina"); sopra i link si
 * ingrandisce con mix-blend-mode: difference.
 * Il cursore nativo NON viene nascosto sui campi di input e testo, e il focus
 * da tastiera resta indipendente.
 */
import type { Contesto } from './setup';
import { conMedia } from './setup';

let mm: gsap.MatchMedia | null = null;

export function init(ctx: Contesto) {
  const { gsap } = ctx;
  mm = conMedia(ctx, null, ({ mouse, isDesktop }) => {
    if (!mouse || !isDesktop) return;
    const el = document.createElement('div');
    el.className = 'cursore';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="cursore__disco"></span><span class="cursore__etichetta"></span>';
    document.body.append(el);
    const etichetta = el.querySelector<HTMLElement>('.cursore__etichetta')!;
    const x = gsap.quickTo(el, 'x', { duration: 0.15, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.15, ease: 'power3.out' });
    let visibile = false;

    const muovi = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!visibile) {
        visibile = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.classList.add('cursore--visibile');
      }
      x(e.clientX);
      y(e.clientY);
      const t = e.target as HTMLElement;
      const conEtichetta = t.closest<HTMLElement>('[data-cursor]');
      const campo = t.closest('input, textarea, select, [contenteditable], p, li, td');
      const link = t.closest('a, button, [role="button"], summary, label');
      el.classList.toggle('cursore--pillola', !!conEtichetta);
      el.classList.toggle('cursore--link', !conEtichetta && !!link);
      el.classList.toggle('cursore--testo', !conEtichetta && !link && !!campo);
      if (conEtichetta) etichetta.textContent = conEtichetta.dataset.cursor || '';
    };
    const esci = () => {
      visibile = false;
      el.classList.remove('cursore--visibile');
    };
    window.addEventListener('pointermove', muovi, { passive: true });
    document.documentElement.addEventListener('pointerleave', esci);
    document.documentElement.classList.add('ha-cursore');
    return () => {
      window.removeEventListener('pointermove', muovi);
      document.documentElement.removeEventListener('pointerleave', esci);
      document.documentElement.classList.remove('ha-cursore');
      el.remove();
    };
  });
}

export function destroy() {
  mm?.revert();
  mm = null;
}
