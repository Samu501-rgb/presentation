/**
 * Serranda: contatore decorativo 0→100 (NON legato al caricamento reale),
 * clic per saltare, chiusura anticipata se la pagina è già pronta.
 * L'animazione della serranda è CSS (Preloader.astro): durata massima 900 ms.
 */
let raf = 0;

export function init() {
  const html = document.documentElement;
  const el = document.querySelector<HTMLElement>('[data-serranda]');
  const conta = el?.querySelector<HTMLElement>('[data-serranda-conta]');
  if (!el || !html.classList.contains('serranda')) return;

  const via = () => {
    if (!html.classList.contains('serranda--via')) html.classList.add('serranda--via');
  };
  el.addEventListener('click', via, { once: true });
  window.addEventListener('keydown', via, { once: true });

  const inizio = performance.now();
  const DURATA = 450;
  const passo = (t: number) => {
    const p = Math.min(1, (t - inizio) / DURATA);
    if (conta) conta.textContent = String(Math.round(p * 100));
    if (p < 1) raf = requestAnimationFrame(passo);
  };
  raf = requestAnimationFrame(passo);

  // Se la pagina era già pronta (cache), la serranda sale subito dopo il contatore.
  if (document.readyState === 'complete') window.setTimeout(via, DURATA);

  // Pulizia: a fine animazione la serranda sparisce dal flusso.
  el.addEventListener('animationend', () => {
    html.classList.remove('serranda', 'serranda--via');
  });
}

export function destroy() {
  cancelAnimationFrame(raf);
  document.documentElement.classList.remove('serranda', 'serranda--via');
}
