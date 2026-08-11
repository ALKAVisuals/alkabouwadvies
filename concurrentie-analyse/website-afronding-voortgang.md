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
**Git-status:** hoge-prioriteitsniveau gecommit als `0adc8c9` en verwerkt in `main`.

**Afsluitende controle hoge prioriteit:** 31 actieve niet-stadspagina's, 2.931 lokale links en bestanden gecontroleerd, 0 ontbrekende verwijzingen, 0 dubbele HTML-id's, 40 geldige JSON-LD-blokken, geldige sitemap-XML, 0 openbare ALKA-verwijzingen, 0 zichtbare prijsregels met excl. btw vóór incl. btw, 0 gewijzigde stadspagina's en `git diff --check` geslaagd.

**Visuele nacorrectie op 11 augustus 2026:** op 27 niet-stadspagina's is de dubbel gestijlde headercontainer gelijkgetrokken met de correcte structuur van Contact, Over ons en de 3D-pagina. Alle 30 niet-redirectpagina's met de gedeelde navigatie hebben nu precies één header, één `tba-site-nav` en één `tba-nav-shell`. Geen stadspagina gewijzigd. Deze nacorrectie is nog niet gecommit of gepusht.

## MIDDELHOGE PRIORITEIT

**Status prioriteitsniveau:** WACHT OP GEBRUIKER — M1 en M3 zijn lokaal gereed; alleen de uitgestelde accountgebonden stappen van M2 staan nog open.

### M1 — Performancecontrole en optimalisatie

**Status:** GEREED — lokaal afgerond en technisch gevalideerd op 11 augustus 2026
**Doel:** mobiele laadtijd, renderblokkering en zware assets controleren en verbeteren.
**Buiten scope:** vaste afbeeldingsafmetingen blijven uitgesteld op verzoek van de gebruiker.
**Uitgevoerd:** 42 parserblokkerende scriptverwijzingen uit de `<head>` gehaald, 16 ontbrekende hero-preloads toegevoegd en 24 niet-kritieke afbeeldingen voorzien van lazy-loading en asynchrone decodering.
**Validatie:** 30 niet-redirectpagina's gecontroleerd; 0 ontbrekende lokale verwijzingen, 0 dubbele id's, 0 afbeeldingen zonder laadstrategie, 0 eager hero-afbeeldingen zonder preload, 0 synchrone externe scripts in de `<head>`, 0 browserfouten en 0 gewijzigde stadspagina's.
**Rapport:** `concurrentie-analyse/performancecontrole-niet-stadspaginas.md`
**Aanvullende assetopschoning:** 72 ongebruikte bestanden verwijderd, samen 130.246.920 bytes (circa 124,2 MiB). De mediaverzameling is teruggebracht van 157 naar 87 bestanden; op 31 actieve niet-stadspagina's zijn geen verwijzingen naar verwijderde bestanden aangetroffen. Volledige vastlegging: `concurrentie-analyse/repository-assetopschoning.md`.
**Git-status:** onderdeel van de nog niet gecommitteerde of gepushte middelhoge-prioriteitswijzigingsset.

### M2 — Zoekmachine-activatie

**Status:** WACHT OP GEBRUIKER — alle accountonafhankelijke controles en correcties lokaal afgerond op 11 augustus 2026
**Doel:** Google Search Console en Bing Webmaster Tools controleren, sitemap indienen en kern-URL's laten inspecteren.
**Uitgevoerd:** openbare en lokale robots- en sitemapcontrole, canonical- en metadatacontrole, HTTP/HTTPS/www/404-controle en live bereikbaarheidscontrole van alle 29 niet-stad-URL's uit de sitemap. Voor de vervallen aankoopadviesroute is in `_redirects` een geforceerde permanente 301 naar de homepage voorbereid.
**Validatie:** `robots.txt` en `sitemap.xml` geven live status 200; de sitemap is geldige XML; 29/29 indexeerbare niet-stadspagina's staan exact eenmaal in de sitemap en geven live status 200; HTTP en www leiden met 301 naar het voorkeursdomein; onbekende URL's geven status 404; geen stadspagina gewijzigd.
**Afhankelijkheid:** voor volledige afronding zijn verificatie van de Google Search Console-domeinproperty, sitemapindiening, URL-inspectie en import/controle in Bing Webmaster Tools nodig. Hiervoor is account- en DNS-toegang van de gebruiker vereist.
**Rapport:** `concurrentie-analyse/zoekmachine-activatie.md`
**Git-status:** onderdeel van de nog niet gecommitteerde of gepushte middelhoge-prioriteitswijzigingsset.

### M3 — AI-ready optimalisatie

**Status:** GEREED — lokaal afgerond en technisch gevalideerd op 11 augustus 2026
**Doel:** de site technisch vindbaar, inhoudelijk citeerbaar en betrouwbaar maken voor AI-zoekdiensten, zonder aanbevelingen of posities te garanderen.
**Uitgevoerd:** OAI-SearchBot expliciet toegestaan, een centrale organisatie- en `WebSite`-identiteit toegevoegd, kennisbank/Over ons/Contact aan die identiteit gekoppeld en de auteur- en uitgevergegevens van alle acht artikelen aangevuld met herkenbare URL's en het officiële logo.
**Validatie:** alle JSON-LD is geldige JSON; acht van acht artikelen hebben zichtbare redactionele informatie, officiële bronverwijzingen en consistente auteur-/uitgeverdata; 128 van 128 afbeeldingen hebben niet-lege alt-tekst; lokale robotsregels laten relevante zoek- en AI-crawlers toe; live OAI-SearchBot- en Googlebot-verzoeken geven status 200; geen stadspagina gewijzigd.
**Bewuste keuze:** geen experimenteel `llms.txt` en geen kunstmatige AI-landingspagina's toegevoegd; Google en OpenAI vereisen dit niet voor hun zoekfuncties.
**Rapport:** `concurrentie-analyse/ai-ready-optimalisatie.md`
**Git-status:** onderdeel van de nog niet gecommitteerde of gepushte middelhoge-prioriteitswijzigingsset.

## LATER

- L1 — Stadspagina's inhoudelijk en technisch uitwerken.
- L2 — Echte klantcases en controleerbare reviews toevoegen zodra beschikbaar.
- L3 — Persoonlijke fotografie toevoegen zodra beschikbaar.
- L4 — Kennisbank uitbreiden op basis van echte zoekvragen en bezoekersdata.

## Eerstvolgende stap

M2 — accountgebonden zoekmachine-activatie blijft op verzoek uitgesteld. Wanneer dit wordt hervat, wordt eerst de Google Search Console-domeinproperty voor `technischbouwadvies.nl` geverifieerd; daarna volgen sitemapindiening en kern-URL-inspectie bij Google en Bing. M1 en M3 zijn gereed, maar de middelhoge-prioriteitswijzigingsset wordt pas gecommit en gepusht nadat het volledige prioriteitsniveau is afgerond of de gebruiker de uitgestelde M2-stappen bewust van deze release loskoppelt.
