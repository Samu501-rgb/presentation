# Checklist accessibilità (obiettivo WCAG 2.1 AA)

Verifiche automatiche: axe-core 4 (regole wcag2a/aa, wcag21a/aa, best-practice) su **tutte le 59 pagine** con JS,
senza JS e con `prefers-reduced-motion: reduce`; Lighthouse Accessibility 100 sulle pagine principali.

| Requisito | Stato | Note |
|---|---|---|
| `lang="it"`, skip link "Vai al contenuto", landmark | ✅ | header, nav, main, aside (FAB), footer |
| Un solo H1 per pagina, gerarchia coerente | ✅ | |
| Contrasti (pomodoro #D9411E mai per testo piccolo) | ✅ | testo su pomodoro usa il 700 con carta (5.2:1); numeri decorativi in SVG aria-hidden |
| Focus visibile ovunque | ✅ | anello 3px inchiostro + alone limone; carta sulle sezioni scure |
| Tastiera: nessuna trappola nelle sezioni bloccate | ✅ | focus su un capitolo/card fuori schermo → la pagina scorre lì |
| Marquee con pulsante pausa, pausa su hover/focus/fuori viewport | ✅ | WCAG 2.2.2 |
| Movimento ridotto + toggle "Animazioni on/off" | ✅ | header e footer, persistente, revert di tutti i context |
| Menu mobile e quick view: focus trap, Esc, ritorno del focus | ✅ | menu con `inert` sul resto, quick view con `<dialog>` |
| SplitText senza aria-label su elementi non consentiti | ✅ | `aria: 'none'` (solo righe) |
| Alt text: oggetti decorativi `aria-hidden`, illustrazioni prodotto con nome | ✅ | |
| Form: label vere, errori in aria-live, non solo colore (icona ⚠ + bordo) | ✅ | |
| Aree toccabili ≥ 44×44 | ✅ | classe `.tocco` |
| Sito completo senza JS | ✅ | elementi solo-JS nascosti via CSS; form fa GET a wa.me |
| Nessuno scroll orizzontale a 360px | ✅ | verificato a 375 e 360 |
| Test con lettore di schermo (VoiceOver/NVDA) | ⏳ | da fare su dispositivo reale |
| Browser integrati IG/FB, Safari iOS, Firefox | ⏳ | da fare sull'anteprima |

Nota per Daniele: se il cliente è una microimpresa (< 10 dipendenti e fatturato o bilancio ≤ 2 M€) e il sito resta
una vetrina, l'EAA (D.Lgs. 82/2022) non dovrebbe applicarsi. WCAG 2.1 AA resta comunque lo standard adottato.
