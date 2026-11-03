/**
 * ESEMPIO (non attivo) di Cloudflare Pages Function per l'invio alternativo del
 * form "Te lo troviamo" via email. Per attivarlo: copiarlo in functions/api/richiesta.js,
 * impostare in Cloudflare le variabili RESEND_API_KEY e EMAIL_NEGOZIO, e in
 * src/data/negozio.ts endpointForm: '/api/richiesta'.
 */
export async function onRequestPost({ request, env }) {
  const d = await request.formData();
  if (d.get('sito')) return new Response('ok'); // honeypot
  if (!d.get('privacy') || !d.get('text') || !d.get('nome')) return new Response('Campi mancanti', { status: 400 });
  const testo = ['Cosa cerca: ' + d.get('text'), 'Quantità: ' + (d.get('quantita') || '-'), 'Nome: ' + d.get('nome'), 'Telefono: ' + (d.get('telefono') || '-'), 'Note: ' + (d.get('note') || '-')].join('\n');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'sito@[DOMINIO]', to: env.EMAIL_NEGOZIO, subject: 'Richiesta "Te lo troviamo"', text: testo }),
  });
  return new Response(r.ok ? 'ok' : 'errore', { status: r.ok ? 200 : 502 });
}
