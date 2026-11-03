/**
 * Effetto "scramble" leggero (alternativa a ScrambleTextPlugin, pochi byte):
 * il testo passa per caratteri casuali prima di fermarsi sul valore finale.
 * Usato per i numeri dei passi e per il contatore dello scaffale.
 */
export function scramble(el: HTMLElement, finale: string, durata = 600, caratteri = '0123456789') {
  const inizio = performance.now();
  let raf = 0;
  const passo = (t: number) => {
    const p = Math.min(1, (t - inizio) / durata);
    const fissi = Math.floor(p * finale.length);
    let testo = '';
    for (let i = 0; i < finale.length; i++) {
      testo +=
        i < fissi || finale[i] === ' '
          ? finale[i]
          : caratteri[Math.floor(Math.random() * caratteri.length)];
    }
    el.textContent = p >= 1 ? finale : testo;
    if (p < 1) raf = requestAnimationFrame(passo);
  };
  raf = requestAnimationFrame(passo);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = finale;
  };
}

/** Numero che scorre da `da` ad `a` (cifre che "rotolano"). */
export function contaA(el: HTMLElement, da: number, a: number, durata = 700) {
  const inizio = performance.now();
  let raf = 0;
  const passo = (t: number) => {
    const p = Math.min(1, (t - inizio) / durata);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(da + (a - da) * e));
    if (p < 1) raf = requestAnimationFrame(passo);
  };
  raf = requestAnimationFrame(passo);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = String(a);
  };
}
