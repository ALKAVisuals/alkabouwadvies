# M2 — zoekmachine-activatie Technisch Bouwadvies

**Controle uitgevoerd:** 11 augustus 2026

**Scope:** homepage en alle niet-stadspagina's

**Buiten scope:** inhoudelijke of technische beoordeling van stadspagina's
**Status:** technisch voorbereid; accountgebonden activatie staat nog open

## Uitkomst in het kort

De website is technisch toegankelijk voor zoekmachines. De openbare `robots.txt` en `sitemap.xml` zijn bereikbaar, het hoofddomein is consequent, alle 29 indexeerbare niet-stadspagina's staan in de sitemap en al deze URL's antwoorden met HTTP-status 200. Onbekende URL's geven een echte 404-status.

Google Search Console en Bing Webmaster Tools kunnen niet vanuit de websitecode worden geactiveerd. Daarvoor moet het domein in een account worden toegevoegd en geverifieerd. Na die verificatie kan de sitemap worden ingediend en kan de feitelijke indexeringsstatus worden gecontroleerd.

## 1. Robots.txt

Openbare URL: `https://technischbouwadvies.nl/robots.txt`

Vastgesteld:

- HTTP-status 200 en contenttype `text/plain`.
- Crawlers worden niet onbedoeld geblokkeerd.
- De sitemap wordt expliciet genoemd als `https://technischbouwadvies.nl/sitemap.xml`.
- De lokale en openbare versie zijn gelijk.

Beoordeling: **gereed**.

Google beschrijft `robots.txt` als een middel om crawltoegang te regelen, niet als methode om een pagina uit de zoekresultaten te houden. Voor niet-indexeerbare HTML-pagina's gebruikt de site daarom terecht een `noindex`-metatag. Bron: [Google Search Central — Introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

## 2. Sitemap

Openbare URL: `https://technischbouwadvies.nl/sitemap.xml`

Vastgesteld:

- HTTP-status 200 en contenttype `application/xml`.
- De sitemap is geldige XML.
- Alle URL's zijn absolute HTTPS-URL's op het voorkeursdomein.
- De sitemap bevat 40 URL's in totaal.
- Daarvan zijn 29 URL's indexeerbare niet-stadspagina's en 11 bestaande stadspagina's.
- Alle 29 indexeerbare niet-stadspagina's met een canonical staan exact één keer in de sitemap.
- Er ontbreekt geen indexeerbare niet-stadspagina en er staat geen extra niet-stadspagina zonder indexeerbare canonical in.
- Alle 29 gecontroleerde openbare niet-stad-URL's antwoorden met HTTP-status 200.
- De 11 stadspagina's zijn alleen geteld om de sitemap te kunnen verklaren; ze zijn niet inhoudelijk of technisch beoordeeld.

Beoordeling: **gereed voor indiening**.

Google adviseert volledig gekwalificeerde URL's en alleen de URL's die als canonical moeten worden getoond. De huidige niet-stadselectie voldoet daaraan. Bron: [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

De bestaande `lastmod`-datums zijn niet aangepast voor alleen de header- en performancecorrecties. Google adviseert `lastmod` uitsluitend te wijzigen bij een aantoonbare, significante wijziging aan bijvoorbeeld hoofdinhoud, structured data of links. De waarden mogen dus niet automatisch bij iedere technische release worden vernieuwd.

## 3. Canonical, indexering en statuscodes

Vastgesteld:

- 29 indexeerbare niet-stadspagina's hebben een unieke canonical die aansluit op de sitemap.
- HTTP wordt permanent naar HTTPS geleid.
- `www.technischbouwadvies.nl` wordt permanent naar `technischbouwadvies.nl` geleid.
- De gecontroleerde homepage en dienstpagina's geven HTTP-status 200.
- Een onbekende URL geeft HTTP-status 404.
- `404.html` bevat `noindex, follow`.
- `aankoopadvies.html` bevat `noindex, follow` en verwijst canoniek naar de homepage.

Google gebruikt onder meer redirects, sitemapvermeldingen en `rel="canonical"` als signalen om de voorkeurs-URL te bepalen. Bron: [Google Search Central — Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization).

### Lokale correctie binnen M2

De openbare URL `https://technischbouwadvies.nl/aankoopadvies.html` geeft nu nog status 200 en stuurt de browser met HTML en JavaScript door. In `_redirects` zijn daarom twee permanente server-side redirects voorbereid:

- `/aankoopadvies.html` → `/` met status 301;
- `/aankoopadvies` → `/` met status 301.

Omdat het oude HTML-bestand nog bestaat, zijn de regels bewust geforceerd. Na publicatie moet de live status opnieuw worden gecontroleerd. De huidige HTML-doorverwijzing blijft als terugval aanwezig.

De officiële configuratiedocumentatie bevestigt dat een geforceerde `301!` nodig kan zijn wanneer het bronpad ook als bestand bestaat. Bron: [Netlify Docs — Redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

## 4. Metadata en eigendomsverificatie

Vastgesteld voor de indexeerbare niet-stadspagina's:

- geen ontbrekende paginatitels;
- geen ontbrekende meta descriptions;
- geen dubbele paginatitels of meta descriptions;
- geen ontbrekende canonicals;
- canonical en Open Graph-URL sluiten aan op de sitemap;
- geen bestaande `google-site-verification`- of `msvalidate.01`-code in de HTML.

Een verificatiecode is niet noodzakelijk als een Google Search Console-domeinproperty via DNS wordt geverifieerd. Dat is voor dit domein de aanbevolen route, omdat één domeinproperty zowel HTTP/HTTPS als www/niet-www omvat. Bron: [Google Search Console Help — Add a property](https://support.google.com/webmasters/answer/34592).

## 5. Google Search Console — nog uit te voeren

Benodigd: toegang tot het Google-account dat de website gaat beheren én toegang tot de DNS-instellingen van `technischbouwadvies.nl`.

Stappen:

1. Voeg een **domeinproperty** toe met exact `technischbouwadvies.nl`.
2. Plaats de door Google verstrekte TXT-verificatiecode in DNS en rond de verificatie af.
3. Dien in het Sitemaps-rapport `https://technischbouwadvies.nl/sitemap.xml` in.
4. Controleer of de sitemapstatus **Succes** is en of 40 URL's zijn ontdekt. De 11 stadspagina's blijven inhoudelijk buiten deze werkronde.
5. Inspecteer na publicatie minimaal deze kern-URL's:
   - `https://technischbouwadvies.nl/`
   - `https://technischbouwadvies.nl/dakkapel.html`
   - `https://technischbouwadvies.nl/aanbouw-uitbouw.html`
   - `https://technischbouwadvies.nl/omgevingsvergunning-aanvragen.html`
   - `https://technischbouwadvies.nl/bouwkundig-advies.html`
   - `https://technischbouwadvies.nl/3d-visualisaties-vloerplannen.html`
   - `https://technischbouwadvies.nl/blog.html`
   - `https://technischbouwadvies.nl/contact.html`
6. Vraag alleen voor deze kernpagina's indexering aan wanneer de live inspectie een succesvolle fetch toont. Gebruik voor de rest de sitemap.
7. Controleer in Pagina-indexering of de 404- en vervallen aankoopadviespagina correct als niet-indexeerbaar worden behandeld.

Google vermeldt dat sitemapindiening monitoring en foutdiagnose mogelijk maakt, maar indexering niet garandeert. Voor losse pagina's is URL-inspectie geschikt; voor meerdere pagina's is een sitemap de aangewezen methode. Bronnen: [Google Search Console — Sitemaps report](https://support.google.com/webmasters/answer/7451001) en [Top tasks for Search Console users](https://support.google.com/webmasters/answer/10351509).

## 6. Bing Webmaster Tools — nog uit te voeren

Benodigd: toegang tot het Microsoft-account dat de website gaat beheren. De snelste route is importeren vanuit de geverifieerde Google Search Console-property.

Stappen:

1. Importeer `technischbouwadvies.nl` vanuit Google Search Console of voeg het domein handmatig toe en verifieer het.
2. Controleer of `https://technischbouwadvies.nl/sitemap.xml` is geïmporteerd; dien deze anders handmatig in.
3. Controleer de verwerkingsstatus en eventuele crawlmeldingen.
4. Inspecteer dezelfde kern-URL's als bij Google.
5. Gebruik URL Submission alleen voor belangrijke nieuwe of duidelijk gewijzigde URL's; het is aanvullend op de sitemap.

Bing kan een geverifieerde Search Console-property met sitemaps importeren. Bronnen: [Bing Webmaster Tools — Add and verify site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b) en [Bing Webmaster Tools — Sitemaps](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed).

## 7. IndexNow

IndexNow is technisch mogelijk, maar voor deze kleine statische website niet nodig om M2 af te ronden. Het protocol vereist een openbare sleutel op het domein en een notificatie bij toegevoegde, gewijzigde of verwijderde URL's. Zonder publicatie-automatisering levert handmatig gebruik weinig structureel voordeel op.

Advies: pas later toevoegen wanneer wijzigingen via een vaste publicatieworkflow automatisch gemeld kunnen worden. Bron: [IndexNow — Documentation](https://www.indexnow.org/documentation).

## 8. Acceptatie en resterende afhankelijkheid

Technisch gereed:

- lokale en openbare robotscontrole;
- lokale en openbare sitemapcontrole;
- canonical- en metadatacontrole voor niet-stadspagina's;
- statuscontrole van 29 openbare niet-stad-URL's;
- HTTPS-, www- en 404-controle;
- permanente redirect voor de vervallen aankoopadviesroute voorbereid;
- geen stadspagina gewijzigd;
- geen Netlify-account of externe configuratie aangepast;
- niets gecommit of gepusht.

Nog accountgebonden:

- Google Search Console-property verifiëren;
- sitemap bij Google indienen en kern-URL's inspecteren;
- Bing Webmaster Tools activeren/importeren;
- sitemapstatus en kern-URL's bij Bing controleren;
- na publicatie de nieuwe 301 voor aankoopadvies live bevestigen.

M2 kan pas volledig als **GEREED** worden gemarkeerd nadat deze account- en releasecontroles zijn bevestigd.
