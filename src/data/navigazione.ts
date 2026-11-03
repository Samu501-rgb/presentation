/** Voci di navigazione principali (header, menu mobile, footer). */
import { negozio } from './negozio';

export const NAVIGAZIONE: { href: string; testo: string }[] = [
  { href: '/reparti', testo: 'Reparti' },
  { href: '/offerte', testo: 'Offerte' },
  { href: '/te-lo-troviamo', testo: 'Te lo troviamo' },
  ...(negozio.flag.listeRegalo ? [{ href: '/liste-regalo', testo: 'Liste regalo' }] : []),
  { href: '/negozio', testo: 'Il negozio' },
  { href: '/contatti', testo: 'Contatti' },
];

export const LEGALI: { href: string; testo: string }[] = [
  { href: '/privacy-policy', testo: 'Privacy policy' },
  { href: '/cookie-policy', testo: 'Cookie policy' },
  { href: '/accessibilita', testo: 'Accessibilità' },
];
