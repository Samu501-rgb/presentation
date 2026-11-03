/**
 * Quick view: apre la modale con i dati della card. Con animazioni attive
 * l'immagine fa un Flip dalla card alla modale (data-flip-id condiviso).
 */
import { linkWhatsApp, messaggioPrenotazione } from '../data/negozio';

export function collegaVistaRapida() {
  const dlg = document.querySelector<HTMLDialogElement>('[data-vr]');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const imm = dlg.querySelector<HTMLElement>('[data-vr-immagine]')!;
  let origine: HTMLElement | null = null;
  let immagineCard: HTMLElement | null = null;

  document
    .querySelectorAll<HTMLButtonElement>('[data-vista-rapida]')
    .forEach((b) => (b.hidden = false));

  document.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-vista-rapida]');
    if (!btn) return;
    const card = btn.closest<HTMLElement>('[data-prodotto]');
    if (!card) return;
    origine = btn;
    immagineCard = card.querySelector<HTMLElement>('[data-immagine]');
    const nome = card.dataset.nome || '';
    const slug = card.dataset.slug || '';
    dlg.querySelector('[data-vr-nome]')!.textContent = nome;
    dlg.querySelector('[data-vr-reparto]')!.textContent =
      document.querySelector('h1')?.textContent?.trim() ?? '';
    dlg.querySelector('[data-vr-prezzo]')!.textContent =
      card.querySelector('[data-cartellino]')?.textContent?.trim() ?? '';
    dlg.querySelector<HTMLAnchorElement>('[data-vr-wa]')!.href = linkWhatsApp(
      messaggioPrenotazione(nome),
    );
    dlg.querySelector<HTMLAnchorElement>('[data-vr-scheda]')!.href = `/prodotti/${slug}`;
    imm.replaceChildren(...Array.from(immagineCard?.children ?? []).map((n) => n.cloneNode(true)));

    const movimento = document.documentElement.dataset.motion === 'full' && immagineCard;
    if (!movimento) {
      dlg.showModal();
      return;
    }
    const [{ gsap }, { Flip }] = await Promise.all([import('gsap'), import('gsap/Flip')]);
    gsap.registerPlugin(Flip);
    immagineCard!.dataset.flipId = 'vr';
    const stato = Flip.getState(immagineCard!);
    dlg.showModal();
    Flip.from(stato, {
      targets: imm,
      duration: 0.6,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
    });
    delete immagineCard!.dataset.flipId;
  });

  const chiudi = () => dlg.close();
  dlg.querySelector('[data-vr-chiudi]')?.addEventListener('click', chiudi);
  // Clic sullo sfondo: chiude.
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) chiudi();
  });
  dlg.addEventListener('close', () => {
    origine?.focus();
    origine = null;
  });
}
