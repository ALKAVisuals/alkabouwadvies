# Performancecontrole niet-stadspagina's

**Uitgevoerd:** 11 augustus 2026

**Status:** lokaal afgerond en technisch gevalideerd
**Buiten scope:** stadspagina's, Netlify-instellingen, vaste `width`- en `height`-attributen en het verwijderen of opnieuw comprimeren van beeldbestanden

## Uitgangssituatie

De controle richtte zich op de onderdelen die de eerste zichtbare weergave en mobiele laadsnelheid rechtstreeks beïnvloeden.

- Op 14 pagina's stonden GSAP, ScrollTrigger en Lenis synchroon in de `<head>`. Samen waren dit 42 parserblokkerende scriptverwijzingen.
- Op 16 pagina's werd de belangrijkste hero-afbeelding wel eager geladen, maar nog niet vanuit de `<head>` vooraangemeld.
- Op de homepage misten de 20 afbeeldingen in de gemeentelogo-ticker expliciete lazy-loading en asynchrone decodering.
- Vier afbeeldingen onder de eerste schermweergave misten dezelfde laadinstellingen.
- De grootste oude PNG-bestanden in de repository blijken niet automatisch onderdeel van de actieve paginalading. Ze zijn daarom niet onnodig aangepast of verwijderd.

## Uitgevoerde optimalisaties

### 1. Externe animatiescripts uit het kritieke renderpad

Op 14 pagina's zijn GSAP, ScrollTrigger en Lenis uit de `<head>` verplaatst naar het einde van de pagina, direct vóór de bestaande pagina-afhankelijke animatiecode. Daardoor kan de browser de zichtbare HTML en CSS eerder verwerken, terwijl de volgorde van de drie afhankelijkheden behouden blijft.

Voor beide gebruikte CDN's is een `preconnect` toegevoegd, zodat de verbinding al kan worden voorbereid voordat de scripts onderaan de pagina worden bereikt.

### 2. Hero-afbeeldingen eerder laten ontdekken

Aan 16 pagina's is een image-preload met `fetchpriority="high"` toegevoegd voor de bestaande eager hero-afbeelding. Samen met de acht al aanwezige hero-preloads heeft iedere eager geladen hoofdafbeelding nu een overeenkomende preload.

### 3. Niet-kritieke afbeeldingen lager prioriteren

De 20 logo-afbeeldingen in de homepage-ticker en vier afbeeldingen verderop op dienstpagina's gebruiken nu `loading="lazy"` en `decoding="async"`. Alle afbeeldingen op de 30 gecontroleerde pagina's hebben daardoor een expliciete laad- en decodeerstrategie.

## Validatie

### Statische controle

- 30 actieve niet-redirectpagina's buiten de steden gecontroleerd.
- 0 lokale verwijzingen naar ontbrekende bestanden.
- 0 dubbele HTML-id's.
- 0 afbeeldingen zonder `loading`.
- 0 afbeeldingen zonder `decoding`.
- 0 eager hero-afbeeldingen zonder overeenkomende preload.
- 0 externe scripts die nog synchroon vanuit de `<head>` laden.
- 0 gewijzigde stadspagina's.
- `git diff --check` geslaagd.

### Browsercontrole

Alle 30 pagina's zijn na de wijzigingen opnieuw geladen: de 14 pagina's met verplaatste animatiescripts op mobiel en de overige 16 pagina's op desktop.

- Geen JavaScriptfouten of waarschuwingen.
- Geen horizontale pagina-overloop.
- Iedere eager hero-afbeelding is geladen.
- Alle hero-loops hebben precies één actief beeld waar zo'n loop aanwezig is.
- De gedeelde header gebruikt nergens meer een dubbel gestijlde binnencontainer.
- De mobiele homepage toont de header, hero, teksten en CTA's correct.

## Bewust niet uitgevoerd

- Geen vaste afbeeldingsafmetingen toegevoegd, conform het verzoek van de eigenaar.
- Geen gebruikte afbeeldingen opnieuw gecomprimeerd of visueel aangepast.
- Geen Netlify-configuratie aangepast.
- Geen stadspagina gewijzigd.
- Niets gecommit of gepusht.

## Aanvullende repository-opschoning

Op 11 augustus 2026 is na de oorspronkelijke performancecontrole een afzonderlijke, veilige assetopschoning uitgevoerd.

- 70 niet-gerefereerde mediabestanden verwijderd: 130.243.408 bytes.
- Twee volledig ongebruikte footerbestanden verwijderd: `footer-section.css` en `footer-section.js`, samen 3.512 bytes.
- Totale verwijdering: 72 bestanden en 130.246.920 bytes (circa 124,2 MiB).
- De mediaverzameling daalde van 157 bestanden en circa 146,2 MB naar 87 bestanden en circa 16,0 MB.
- Geen van de verwijderde bestanden wordt genoemd in actieve HTML, CSS of JavaScript buiten de stadspagina's.
- De 31 actieve niet-stadspagina's hebben na verwijdering geen ontbrekende runtime-verwijzingen.
- De 87 resterende mediabestanden bevatten geen identieke duplicaten; het grootste bestand is circa 0,38 MB.

Deze opschoning verkleint vooral de repository, de te uploaden deploybundel en toekomstige werkmappen. Ongebruikte bestanden werden door bezoekers al niet gedownload; de directe paginalaadtijdwinst komt daarom vooral uit de eerder uitgevoerde laadstrategie, preloads en verplaatsing van scripts.

## Releasecontrole

Na publicatie hoort de live homepage nog eenmaal met een externe Lighthouse- of PageSpeed-meting te worden gecontroleerd. Daarmee kunnen Core Web Vitals onder echte hosting- en netwerkcondities worden gemeten. Deze live meting verandert niets aan de lokaal geslaagde technische controle.
