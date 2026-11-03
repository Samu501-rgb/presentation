/**
 * Scadenza delle offerte lato client (rete di sicurezza: alla build le offerte
 * scadute sono già escluse; il deploy giornaliero le aggiorna).
 * Testo statico "Ancora X giorni": nessun timer che lampeggia.
 */
export function aggiornaScadenze(ora = new Date()) {
  document.querySelectorAll<HTMLElement>('[data-scadenza]').forEach((el) => {
    const fine = new Date(el.dataset.scadenza || '');
    if (!Number.isNaN(fine.getTime()) && fine < ora) {
      el.hidden = true;
      el.dispatchEvent(new CustomEvent('offerta:scaduta', { bubbles: true }));
    }
  });
  document.querySelectorAll<HTMLElement>('[data-giorni-rimasti]').forEach((el) => {
    const fine = new Date(el.dataset.fino || '');
    if (Number.isNaN(fine.getTime())) return;
    const g = Math.max(0, Math.ceil((fine.getTime() - ora.getTime()) / 86_400_000));
    el.textContent = g <= 1 ? 'Ultimo giorno.' : `Ancora ${g} giorni.`;
  });
}
