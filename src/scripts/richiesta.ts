/**
 * Form di richiesta: validazione accessibile e invio.
 * - "Invia su WhatsApp": compone il messaggio e apre wa.me con il testo codificato.
 * - "Invia via email": POST (multipart) a [ENDPOINT_FORM], se configurato.
 */
import { linkWhatsApp } from '../data/negozio';

const MESSAGGI: Record<string, string> = {
  text: 'Scrivi in due righe cosa cerchi.',
  nome: 'Dicci il tuo nome.',
  telefono: 'Controlla il numero: solo cifre, spazi o +.',
  privacy: 'Serve il consenso per poterti rispondere.',
  occasione: 'Scegli l’occasione.',
};

function componi(form: HTMLFormElement): string {
  const d = new FormData(form);
  const tipo = form.dataset.tipo;
  const v = (k: string) => String(d.get(k) ?? '').trim();
  const righe: string[] = [];
  if (tipo === 'lista-regalo')
    righe.push(`Ciao Gino Casa! Vorrei creare una lista regalo (${v('occasione')}).`);
  else if (tipo === 'contatto') righe.push('Ciao Gino Casa!');
  else righe.push('Ciao Gino Casa! Sto cercando:');
  righe.push(v('text'));
  if (v('quantita')) righe.push(`Quantità: ${v('quantita')}`);
  if (v('note')) righe.push(`Note: ${v('note')}`);
  righe.push(`— ${v('nome')}${v('telefono') ? ` (${v('telefono')})` : ''}`);
  return righe.join('\n');
}

function valida(form: HTMLFormElement): boolean {
  let primo: HTMLElement | null = null;
  form
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select',
    )
    .forEach((el) => {
      if (!el.id || el.type === 'file') return;
      const err = form.querySelector<HTMLElement>(`#${CSS.escape(el.id)}-err`);
      const campo = el.closest('.campo');
      const ok = el.checkValidity() && !(el.required && el.type !== 'checkbox' && !el.value.trim());
      el.setAttribute('aria-invalid', String(!ok));
      if (err) err.textContent = ok ? '' : (MESSAGGI[el.name] ?? 'Controlla questo campo.');
      if (campo) {
        campo.classList.remove('campo--errore');
        if (!ok) {
          void (campo as HTMLElement).offsetWidth;
          campo.classList.add('campo--errore');
        }
      }
      if (!ok && !primo) primo = el;
    });
  (primo as HTMLElement | null)?.focus();
  return !primo;
}

function conferma(form: HTMLFormElement, testo: string) {
  const box = form.querySelector<HTMLElement>('[data-conferma]');
  if (!box) return;
  const t = box.querySelector('[data-conferma-testo]');
  if (t) t.textContent = testo;
  box.classList.remove('is-visibile');
  void box.offsetWidth;
  box.classList.add('is-visibile');
}

export function collegaModuli() {
  document.querySelectorAll<HTMLFormElement>('[data-modulo]').forEach((form) => {
    // Con JS la validazione è nostra (messaggi in italiano, aria-live); senza JS resta quella nativa.
    form.noValidate = true;
    form.removeAttribute('target');
    let canale = 'whatsapp';
    form
      .querySelectorAll<HTMLButtonElement>('[data-invio]')
      .forEach((b) => b.addEventListener('click', () => (canale = b.dataset.invio || 'whatsapp')));
    // Validazione "live" dopo il primo errore
    form.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement;
      if (el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) {
        el.setAttribute('aria-invalid', 'false');
        const err = form.querySelector(`#${CSS.escape(el.id)}-err`);
        if (err) err.textContent = '';
        el.closest('.campo')?.classList.remove('campo--errore');
      }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!valida(form)) return;
      const endpoint = form.dataset.endpoint;
      if (canale === 'email' && endpoint) {
        try {
          const r = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
          if (!r.ok) throw new Error(String(r.status));
          conferma(form, 'Richiesta inviata! Ti rispondiamo appena possibile.');
          form.reset();
        } catch {
          conferma(
            form,
            'Non siamo riusciti a inviare la richiesta. Riprova o scrivici su WhatsApp.',
          );
        }
        return;
      }
      window.open(linkWhatsApp(componi(form)), '_blank', 'noopener');
      conferma(
        form,
        'Fatto! Abbiamo aperto WhatsApp con il tuo messaggio: premi invio per mandarlo.',
      );
    });
  });
}
