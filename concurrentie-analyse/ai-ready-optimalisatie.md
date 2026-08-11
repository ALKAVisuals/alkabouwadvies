# M3 — AI-ready optimalisatie Technisch Bouwadvies

**Uitgevoerd:** 11 augustus 2026

**Scope:** homepage en alle niet-stadspagina's

**Buiten scope:** stadspagina's, accountgebonden zoekmachine-activatie en garanties over opname of aanbeveling
**Status:** lokaal gereed en technisch gevalideerd

## Uitkomst in het kort

De website is technisch en inhoudelijk geschikt gemaakt om door reguliere zoekmachines en AI-zoekdiensten te worden gevonden, geïnterpreteerd en als bron te worden gebruikt. De belangrijkste inhoud staat als gewone HTML op de pagina's, crawlers worden niet geblokkeerd, de organisatie en website hebben een consistente machineleesbare identiteit en de kennisbank bevat zichtbare redactionele gegevens en officiële bronverwijzingen.

Dit vergroot de duidelijkheid voor zoek- en AI-systemen, maar geeft geen garantie op indexering, bronvermelding, aanbeveling of positie. Google en OpenAI noemen zelf dat opname en ranking niet gegarandeerd kunnen worden.

## 1. Wat al goed was

### Crawlbaarheid en indexeerbaarheid

- `robots.txt` staat crawling van openbare pagina's toe.
- De sitemap bevat alle 29 indexeerbare niet-stadspagina's.
- Belangrijke inhoud staat als tekst in de HTML en is niet afhankelijk van JavaScript om zichtbaar te worden.
- De homepage en een kennisbankartikel geven bij een live verzoek met de user-agent `OAI-SearchBot` status 200.
- De homepage geeft bij een live verzoek met de user-agent `Googlebot` status 200.

Google stelt dat voor AI Overviews en AI Mode dezelfde technische SEO-basis geldt als voor reguliere Search: crawlbare, indexeerbare pagina's met tekstuele inhoud en consistente structured data. Er is geen speciaal AI-schema of verplicht AI-tekstbestand. Bron: [Google Search Central — AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).

OpenAI adviseert om OAI-SearchBot niet te blokkeren wanneer inhoud in ChatGPT Search gevonden, samengevat en gelinkt moet kunnen worden. Bron: [OpenAI — Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq).

### Citeerbare kennisbank

Alle acht artikelen bevatten:

- een zichtbare publicatiedatum;
- een zichtbare datum van de laatste inhoudelijke controle;
- `Technisch Bouwadvies` als zichtbare redactie;
- een inhoudsopgave en duidelijke tussenkoppen;
- een apart onderdeel met officiële bronnen;
- links naar toepasselijke primaire Nederlandse bronnen, zoals IPLO, Rijksoverheid en het Omgevingsloket;
- `BlogPosting`-structured data met headline, beschrijving, auteur, uitgever, datum, canonical pagina-URL en representatieve afbeelding.

De artikelen zijn daardoor niet alleen samenvattingen zonder herkomst: bouwregelgeving en vergunningsinformatie is controleerbaar gekoppeld aan officiële bronnen.

### Afbeeldingen en tekstalternatieven

- 128 afbeeldingen op de gecontroleerde niet-stadspagina's hebben allemaal een niet-lege `alt`-tekst.
- De belangrijke beelden staan als normale `<img>`-elementen in de HTML.
- Structured data van artikelen verwijst naar absolute, openbare afbeeldings-URL's.

Dit ondersteunt zowel toegankelijkheid als het begrijpen en vinden van afbeeldingen. Google adviseert normale HTML-afbeeldingselementen en beschrijvende tekst rondom afbeeldingen. Bron: [Google Search Central — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images).

## 2. Uitgevoerde verbeteringen

### OAI-SearchBot expliciet toegestaan

Aan `robots.txt` is een afzonderlijke regel toegevoegd:

```text
User-agent: OAI-SearchBot
Allow: /
```

De bestaande algemene regel blijft aanwezig, zodat Googlebot, Bingbot en andere openbare crawlers eveneens toegang houden. Het expliciete blok maakt de keuze voor vindbaarheid in ChatGPT Search controleerbaar zonder `GPTBot` of andere trainingscrawlers apart toe te staan.

### Eén herkenbare organisatie-entiteit

De homepage-`Organization` gebruikt nu het vaste identifier:

```text
https://technischbouwadvies.nl/#organization
```

Ditzelfde `@id` wordt hergebruikt op dienstpagina's, de kennisbank, de Over-ons-pagina, de contactpagina en in de auteur-/uitgevergegevens van artikelen. Daardoor worden identieke bedrijfsvermeldingen niet langer als losse, naamloze objecten aangeboden.

De organisatie-entiteit bevat ook een verwijzing naar het bestaande officiële logo op:

```text
https://technischbouwadvies.nl/images/logo.png
```

Er zijn geen sociale profielen, keurmerken, medewerkers, ervaringen of andere `sameAs`-claims verzonnen.

### Website-entiteit en voorkeursnaam

Op de homepage is één `WebSite`-object toegevoegd met:

- naam `Technisch Bouwadvies`;
- alternatieve naam `technischbouwadvies.nl`;
- canonical homepage-URL;
- taal `nl-NL`;
- de organisatie als uitgever.

Google noemt `WebSite`-structured data op de homepage het belangrijkste expliciete signaal voor de gewenste sitenaam. Bron: [Google Search Central — Site names](https://developers.google.com/search/docs/appearance/site-names).

### Auteur en uitgever van artikelen versterkt

Bij alle acht `BlogPosting`-objecten is toegevoegd:

- de vaste organisatie-`@id`;
- een auteur-URL naar `https://technischbouwadvies.nl/over-ons.html`;
- de homepage als uitgever-URL;
- het officiële logo als uitgeverlogo;
- een koppeling met de centrale `WebSite`-entiteit.

Dit sluit aan op de zichtbare byline `Redactie Technisch Bouwadvies`. Google adviseert bij Article-markup een correct auteurstype en een URL die de auteur of organisatie identificeert. Bron: [Google Search Central — Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).

### Pagina-entiteiten gekoppeld

- De kennisbank heeft nu een eigen `Blog`-entiteit.
- `AboutPage` verwijst naar dezelfde centrale organisatie-entiteit.
- `ContactPage` verwijst naar dezelfde centrale organisatie-entiteit.
- Deze pagina's zijn gekoppeld aan de centrale `WebSite`-entiteit.

## 3. Bewuste keuzes

### Geen `llms.txt` toegevoegd

Er is geen `llms.txt` of vergelijkbaar experimenteel AI-bestand toegevoegd. Google vermeldt expliciet dat er geen nieuw machineleesbaar AI-bestand of speciaal schema nodig is om in de AI-functies van Search te verschijnen. OpenAI vereist voor ChatGPT Search evenmin een `llms.txt`; crawltoegang voor OAI-SearchBot is het relevante technische signaal.

Een experimentele inhoudsopgave zonder aantoonbare ondersteuning zou onderhoud toevoegen en mogelijk een onterecht gevoel van zekerheid geven. De bestaande sitemap, interne links, semantische HTML en structured data leveren de benodigde vindbaarheid al via breder ondersteunde standaarden.

### Geen kunstmatige AI-landingspagina's

Er zijn geen pagina's toegevoegd voor variaties van dezelfde zoekvraag. Google waarschuwt dat grote aantallen weinig onderscheidende pagina's, gemaakt om zoek- of AI-antwoorden te beïnvloeden, niet dezelfde waarde hebben als unieke, behulpzame inhoud. Bron: [Google Search Central — Generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

### Geen aanbevelingsgaranties

Structured data geeft expliciete context, maar is geen aanbevelings- of rankingsignaal dat plaatsing garandeert. De technische formulering blijft daarom: de site is geschikt voor ontdekking en interpretatie, niet gegarandeerd zichtbaar of aanbevolen.

## 4. Technische validatie

- Alle JSON-LD-blokken zijn geldige JSON.
- Precies één `WebSite`-entiteit op de homepage.
- Precies één centrale organisatie-identifier die sitebreed wordt hergebruikt.
- Acht van acht artikelen hebben een geldige auteur-URL, uitgever-URL, uitgeverlogo en websitekoppeling.
- Acht van acht artikelen hebben zichtbare redactionele informatie en een sectie met officiële bronnen.
- 128 van 128 afbeeldingen hebben een niet-lege `alt`-tekst.
- De lokale robotsregels staan OAI-SearchBot, Googlebot, Bingbot, ClaudeBot en PerplexityBot toe op de homepage en kennisbank.
- De live homepage en een live artikel geven status 200 aan OAI-SearchBot; de live homepage geeft status 200 aan Googlebot.
- Geen stadspagina gewijzigd.
- Geen externe Netlify-instellingen aangepast.
- Niets gecommit of gepusht.

## 5. Wat later nog waarde toevoegt

Deze punten zijn geen technisch gebrek van M3, maar kunnen de feitelijke autoriteit later verhogen:

1. M2 afronden in Google Search Console en Bing Webmaster Tools, zodat indexering en crawlmeldingen meetbaar worden.
2. Echte gerealiseerde projecten publiceren met datum, plaats op regioniveau, opdracht, oplossing en controleerbare projectbeelden.
3. Echte klantreviews toevoegen zodra die beschikbaar zijn.
4. Een persoonlijke of redactionele profielpagina toevoegen wanneer de eigenaar zijn naam en vakinhoudelijke achtergrond openbaar wil maken.
5. Nieuwe kennisbankartikelen uitsluitend baseren op echte klantvragen, eigen praktijkkennis en actuele officiële bronnen.

## 6. Eindbeoordeling

M3 is lokaal **GEREED**. De site voldoet aan de relevante technische basis voor reguliere en generatieve zoekervaringen: crawlbaar, tekstueel, semantisch gekoppeld, brononderbouwd en zonder onbewezen entiteitsclaims. De nog openstaande beperking is niet de websitecode maar de accountgebonden activatie en monitoring uit M2.
