/**
 * Dati strutturati (JSON-LD) generati da negozio.ts.
 * I campi testuali non confermati restano segnaposto (visibili in DA_COMPILARE.md);
 * i campi numerici o di elenco non confermati vengono omessi per non invalidare lo schema.
 */
import { negozio, èSegnaposto, confermato, urlSito, orariConfermati } from './negozio';

export function schemaNegozio() {
  const sito = urlSito();
  const { lat, lng } = negozio.geo;
  const sameAs = [
    negozio.social.facebook,
    negozio.social.instagram,
    negozio.social.googleMaps,
  ].filter((u) => !èSegnaposto(u));

  // Orari: una specifica per ogni fascia (gli orari spezzati diventano due specifiche).
  const specifiche: { dayOfWeek: string[]; opens: string; closes: string }[] = [];
  if (orariConfermati()) {
    for (const g of negozio.orari) {
      for (const f of g.fasce) {
        const esistente = specifiche.find((s) => s.opens === f.apre && s.closes === f.chiude);
        if (esistente) esistente.dayOfWeek.push(g.schema);
        else specifiche.push({ dayOfWeek: [g.schema], opens: f.apre, closes: f.chiude });
      }
    }
  }

  const piva = confermato(negozio.piva);
  const tel = confermato(negozio.telefono);

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeGoodsStore',
    '@id': `${sito}/#negozio`,
    name: negozio.nome,
    legalName: negozio.ragioneSociale,
    description: negozio.descrizione,
    url: `${sito}/`,
    image: [
      `${sito}/og/negozio-1x1.jpg`,
      `${sito}/og/negozio-4x3.jpg`,
      `${sito}/og/negozio-16x9.jpg`,
    ],
    ...(piva ? { vatID: `IT${piva}` } : { vatID: `IT${negozio.piva}` }),
    telephone: tel ? `+39${tel.replace(/\D/g, '')}` : `+39${negozio.telefono}`,
    ...(confermato(negozio.email) ? { email: negozio.email } : {}),
    priceRange: '€',
    areaServed: negozio.areaServita,
    address: {
      '@type': 'PostalAddress',
      streetAddress: negozio.indirizzo.via,
      addressLocality: negozio.indirizzo.citta,
      postalCode: negozio.indirizzo.cap,
      addressRegion: negozio.indirizzo.provincia,
      addressCountry: negozio.indirizzo.nazione,
    },
    ...(!èSegnaposto(lat) && !èSegnaposto(lng)
      ? { geo: { '@type': 'GeoCoordinates', latitude: Number(lat), longitude: Number(lng) } }
      : {}),
    ...(specifiche.length
      ? {
          openingHoursSpecification: specifiche.map((s) => ({
            '@type': 'OpeningHoursSpecification',
            ...s,
          })),
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function schemaBriciole(voci: { nome: string; href: string }[]) {
  const sito = urlSito();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: voci.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: v.nome,
      item: `${sito}${v.href === '/' ? '/' : v.href}`,
    })),
  };
}
