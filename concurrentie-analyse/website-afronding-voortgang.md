# Website-afronding — voortgang Technisch Bouwadvies

Dit document is de vaste overdracht voor de afronding van de website. Werk wordt steeds per genummerd onderdeel uitgevoerd. Na ieder afgerond onderdeel worden de status, uitgevoerde controles en eerstvolgende stap hier bijgewerkt.

## Werkafspraken

- Stadspagina's worden niet aangepast; deze vallen onder het latere onderdeel L1.
- Afbeeldingen krijgen voorlopig geen vaste `width`- en `height`-attributen.
- Er worden geen externe wijzigingen in Netlify uitgevoerd.
- Er wordt niets gecommit of gepusht zolang een prioriteitsniveau nog niet volledig is afgerond en de gebruiker geen toestemming heeft gegeven.
- Statuscodes: `BEZIG`, `GEREED`, `WACHT OP KEUZE`, `WACHT OP GEBRUIKER` en `NOG TE DOEN`.

## HOGE PRIORITEIT

**Status prioriteitsniveau:** GEREED — H1 tot en met H5 afgerond op 9 augustus 2026; nog niet gecommit of gepusht.

### H1 — SEO-URL's, canonicals, metadata en sitemap

**Status:** GEREED — 8 augustus 2026
**Doel:** zoekmachines één ondubbelzinnige voorkeurs-URL per niet-stadspagina geven.
**Acceptatiecriteria:**

- Canonical, Open Graph-URL en structured-data-URL verwijzen per pagina naar dezelfde URL.
- Geen canonical verwijst naar een 404-pagina.
- De sitemap bevat voor niet-stadspagina's alleen de gekozen voorkeurs-URL's.
- De sitemap bevat geldige en onderbouwde `lastmod`-datums.
- XML, interne links en JSON-LD zijn na de wijziging gevalideerd.

**Uitgevoerd:**

- Voor alle 29 indexeerbare niet-stadspagina's zijn canonical en `og:url` gelijkgetrokken met de `.html`-URL uit de sitemap; de homepage gebruikt consequent de root-URL met afsluitende slash.
- De foutieve canonicals `/bedbreakfast` en `/dakopbouw` zijn vervangen door bestaande URL's.
- De pagina-URL's in juridische structured data en twee blogartikelen zijn gecorrigeerd.
- Het foutief in `FAQPage.mainEntity` geplaatste homepage-`Service`-object is een zelfstandig top-level schema-object geworden.
- Aan de 29 gecontroleerde niet-stadspagina's in de sitemap is `lastmod` met datum `2026-08-08` toegevoegd.

**Validatie:**

- 29/29 canonicalcontroles geslaagd.
- 29/29 Open Graph-URL-controles geslaagd.
- 29/29 sitemapcontroles geslaagd.
- Alle JSON-LD-blokken zijn geldige JSON.
- Homepage-schema bevat afzonderlijk `LocalBusiness`, `FAQPage` en `Service`; alle vijf FAQ-items zijn `Question`-objecten.
- `sitemap.xml` is geldige XML en alle 29 toegevoegde datums hebben het formaat `YYYY-MM-DD`.
- Geen gebroken interne links gevonden.
- Geen stadspagina gewijzigd.

### H2 — Tekstkwaliteit niet-stadspagina's

**Status:** GEREED — 8 augustus 2026
**Doel:** alle zichtbare teksten op de homepage en niet-stadspagina's natuurlijk, professioneel, duidelijk en overtuigend maken.
**Beoordelingscriteria:**

- Correcte spelling, grammatica, interpunctie en zinsbouw.
- Consequent gebruik van `u`, `uw`, `wij` en vaste bouwkundige terminologie.
- Begrijpelijke formuleringen zonder onnodig jargon of te lange zinnen.
- Geen holle, overdreven, onbewezen of herkenbaar AI-achtige formuleringen.
- Geen onnodige herhaling tussen koppen, intro's, pakketten, FAQ's en CTA's.
- Natuurlijke verwerking van zoektermen zonder keyword stuffing.
- Duidelijke uitleg van dienst, resultaat, werkwijze, inclusies, uitsluitingen en vervolgstap.
- Zichtbare FAQ-teksten en bijbehorende structured data blijven inhoudelijk gelijk.
- Stadspagina's blijven volledig buiten deze controle- en correctieronde.

**Uitgevoerd:**

- Alle 31 niet-stadspagina's zijn beoordeeld op spelling, grammatica, zinsbouw, toon, terminologie, scanbaarheid, CTA's, metadata en FAQ-consistentie.
- Overdreven verkooptaal, angstformuleringen, onbewezen resultaatclaims en herkenbaar AI-achtige formuleringen zijn verwijderd of genuanceerd.
- Dienst-, proces- en pakketteksten zijn concreter gemaakt en verantwoordelijkheden zijn duidelijker afgebakend.
- Titels en meta descriptions zijn gecontroleerd op natuurlijk taalgebruik en onderlinge uniciteit.
- De volledige uitkomst per pagina staat in [`tekstaudit-niet-stadspaginas.md`](tekstaudit-niet-stadspaginas.md).

**Validatie:**

- 31 niet-stadspagina's gecontroleerd; geen stadspagina gewijzigd.
- 61 FAQ-items komen overeen met de zichtbare FAQ-tekst.
- 40 JSON-LD-blokken zijn geldige JSON.
- 2.651 lokale bestandverwijzingen gecontroleerd; geen ontbrekende doelen.
- Geen zichtbare informele aanspreekvormen `je`, `jij` of `jouw` gevonden.
- Geen dubbele paginatitels of meta descriptions gevonden.
- De bewuste redirect uitgezonderd heeft iedere inhoudspagina precies één H1.

### H3 — Functionele QA niet-stadspagina's

**Status:** GEREED — 9 augustus 2026
**Doel:** alle publieke routes op desktop en mobiel functioneel en visueel controleren.
**Omvat:** navigatie, footers, hero-loops, pakketkiezer, btw-weergave, CTA's, interne links, formulieren, 404-pagina en toetsenbordbediening.

**Uitgevoerd:**

- Alle 31 niet-stadspagina's zijn gecontroleerd op desktop en mobiel.
- De afgebroken initialisatie van het contactformulier is hersteld; niet-actieve stappen zijn ook vóór de JavaScript-initialisatie verborgen, zodat altijd exact één stap zichtbaar is.
- De calculator werkt de actieve stap nu ook technisch bij en geeft project, diensten en pakket door aan contact.
- Alle acht blogartikelen gebruiken nu dezelfde footerinhoud als de homepage.
- Dubbele hero-benamingen op dakkapel, aanbouw en dakopbouw zijn verduidelijkt.
- De volledige uitkomst staat in [`functionele-qa-niet-stadspaginas.md`](functionele-qa-niet-stadspaginas.md).

**Validatie:**

- 62 van 62 pagina- en schermformaatcontroles geslaagd.
- Geen horizontale overloop, kapotte afbeeldingen of browserfouten gevonden.
- Alle gecontroleerde footers hebben dezelfde tekst en 24 links als de homepagefooter.
- Acht hero-loops wisselen automatisch tussen vier beelden, zonder zichtbare bediening; een volledige cyclus is bevestigd.
- Btw-schakelaar, pakketkiezer, FAQ, desktopmenu, mobiel menu en vier formulierstappen functioneren.
- 192 zichtbare interne ankers gecontroleerd; geen ontbrekende doelen.
- Geen stadspagina gewijzigd en geen formulier verzonden.

### H4 — Contactformulier end-to-end

**Status:** GEREED — 9 augustus 2026
**Doel:** bewijzen dat een echte testaanvraag correct wordt verwerkt en ontvangen.
**Resultaat:** de server accepteerde de testaanvraag en de gebruiker bevestigde de registratie in Netlify.

**Reeds gecontroleerd op 9 augustus 2026:**

- De openbare pagina `https://technischbouwadvies.nl/contact.html` is bereikbaar en bevat het formulier `offerteaanvraag` met de verwachte velden.
- De live site gebruikt nog de oude versie waarin de verwijzing naar het ontbrekende element `year` een JavaScript-fout veroorzaakt. De lokale reparatie uit H3 is dus nog niet gepubliceerd.
- Na expliciete toestemming is exact één testaanvraag met kenmerk `H4-CODEX-20260809` verzonden. De live server antwoordde met HTTP-status `200`, zonder redirect.
- De gebruiker heeft met een schermafbeelding bevestigd dat dezelfde aanvraag met de verwachte velden in Netlify is geregistreerd.
- De volledige uitkomst staat in [`contactformulier-end-to-end-test.md`](contactformulier-end-to-end-test.md).

**Releasecontrole na latere publicatie:**

- Na publicatie van de lokale H3-wijzigingen wordt de verbeterde succes- en foutmelding nog eenmaal op de live pagina gecontroleerd. Dit is een releasecontrole en geen openstaand onderdeel van de geslaagde backendtest.

### H5 — Vertrouwen, prijzen en juridische consistentie

**Status:** GEREED — inhoudelijke, technische en operationele afspraken afgerond op 9 augustus 2026
**Doel:** bedrijfsgegevens, prijscommunicatie, claims, privacy, cookies en voorwaarden laten aansluiten op de werkelijke dienstverlening.
**Uitgevoerd:** consumentenprijzen incl. btw primair gemaakt, 35 pakketprijzen rekenkundig gecontroleerd, losse onduidelijke formulierprijzen verwijderd, claims genuanceerd, JSON-LD opgeschoond en algemene voorwaarden/privacy/cookies aangescherpt.
**Technische controle:** 31 actieve niet-stadspagina's, 40 geldige JSON-LD-blokken, 0 btw-rekenfouten, 0 onbevestigde vestigings- of openingstijdvelden en `git diff --check` geslaagd.
**Bevestigd en verwerkt:** merknaam Technisch Bouwadvies blijft ongewijzigd; vestigingsadres Schutkolk 4 d 1, 6582 DB Heumen; KvK 95153756; vestigingsnummer 000060582847; streeftijd van één werkdag is operationeel bevestigd.
**Bewust niet gepubliceerd:** geregistreerde contractnaam en btw-identificatienummer. De eigenaar heeft bevestigd dat deze op de consumentenofferte vóór acceptatie en daarna op de factuur komen.
**Operationeel bevestigd:** toegang tot aanvragen en klantbestanden blijft beperkt tot bevoegde personen; niet-doorgegane aanvragen kunnen na maximaal twaalf maanden worden verwijderd; de offerte- en herroepingsworkflow en e-mailtemplates worden gebruikt; bij vroeg starten wordt afzonderlijke schriftelijke instemming vastgelegd.
**Rapport:** `concurrentie-analyse/vertrouwen-prijzen-juridische-consistentie.md`
**Git-status:** niet gecommit en niet gepusht.

**Afsluitende controle hoge prioriteit:** 31 actieve niet-stadspagina's, 2.931 lokale links en bestanden gecontroleerd, 0 ontbrekende verwijzingen, 0 dubbele HTML-id's, 40 geldige JSON-LD-blokken, geldige sitemap-XML, 0 openbare ALKA-verwijzingen, 0 zichtbare prijsregels met excl. btw vóór incl. btw, 0 gewijzigde stadspagina's en `git diff --check` geslaagd.

## MIDDELHOGE PRIORITEIT

### M1 — Performancecontrole en optimalisatie

**Status:** NOG TE DOEN
**Doel:** mobiele laadtijd, renderblokkering en zware assets controleren en verbeteren.
**Buiten scope:** vaste afbeeldingsafmetingen blijven uitgesteld op verzoek van de gebruiker.

### M2 — Zoekmachine-activatie

**Status:** NOG TE DOEN
**Doel:** Google Search Console en Bing Webmaster Tools controleren, sitemap indienen en kern-URL's laten inspecteren.
**Afhankelijkheid:** accounttoegang of handelingen door de gebruiker kunnen nodig zijn.

### M3 — AI-ready optimalisatie

**Status:** NOG TE DOEN
**Doel:** de site technisch vindbaar, inhoudelijk citeerbaar en betrouwbaar maken voor AI-zoekdiensten, zonder aanbevelingen of posities te garanderen.

## LATER

- L1 — Stadspagina's inhoudelijk en technisch uitwerken.
- L2 — Echte klantcases en controleerbare reviews toevoegen zodra beschikbaar.
- L3 — Persoonlijke fotografie toevoegen zodra beschikbaar.
- L4 — Kennisbank uitbreiden op basis van echte zoekvragen en bezoekersdata.

## Eerstvolgende stap

Na expliciete toestemming: het afgeronde hoge-prioriteitsniveau als één gecontroleerde wijzigingsset committen en pushen. Daarna volgt M1: performancecontrole en optimalisatie, waarbij vaste afbeeldingsafmetingen op verzoek uitgesteld blijven.
