/**
 * Corridoio in versione nativa (mobile, tablet, animazioni off): frecce e
 * tastiera ←/→ che scorrono di una card, puntini sincronizzati con lo scroll.
 * Funziona anche con movimento ridotto (nessuna animazione, solo scorrimento).
 */
export function collegaCorridoioNativo() {
  const sez = document.querySelector<HTMLElement>('[data-corridoio]');
  if (!sez) return;
  const finestra = sez.querySelector<HTMLElement>('[data-corridoio-finestra]')!;
  const frecce = sez.querySelector<HTMLElement>('[data-corridoio-frecce]');
  const card = Array.from(sez.querySelectorAll<HTMLElement>('[data-card]'));
  const puntini = Array.from(sez.querySelectorAll<HTMLElement>('[data-puntini] > span'));
  if (frecce) frecce.hidden = false;

  const inPin = () => sez.classList.contains('corridoio--pin');
  const ridotto = () => document.documentElement.dataset.motion === 'reduce';

  const indiceCorrente = () => {
    const sx = finestra.getBoundingClientRect().left;
    let migliore = 0;
    card.forEach((c, i) => {
      if (
        Math.abs(c.getBoundingClientRect().left - sx) <
        Math.abs(card[migliore].getBoundingClientRect().left - sx)
      )
        migliore = i;
    });
    return migliore;
  };

  const vai = (delta: number) => {
    if (inPin()) {
      sez.dispatchEvent(new CustomEvent('corridoio:vai', { detail: delta }));
      return;
    }
    const i = Math.max(0, Math.min(card.length - 1, indiceCorrente() + delta));
    const destinazione =
      card[i].offsetLeft - parseFloat(getComputedStyle(finestra).scrollPaddingInlineStart || '0');
    finestra.scrollTo({ left: destinazione, behavior: ridotto() ? 'auto' : 'smooth' });
  };

  frecce
    ?.querySelectorAll<HTMLButtonElement>('[data-freccia]')
    .forEach((b) => b.addEventListener('click', () => vai(Number(b.dataset.freccia))));
  finestra.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      vai(e.key === 'ArrowRight' ? 1 : -1);
    }
  });

  let raf = 0;
  finestra.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = indiceCorrente();
        puntini.forEach((p, k) => p.classList.toggle('is-attivo', k === i));
      });
    },
    { passive: true },
  );
}
