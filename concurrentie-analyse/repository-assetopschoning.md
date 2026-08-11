# Repository- en assetopschoning

**Uitgevoerd:** 11 augustus 2026

**Status:** lokaal afgerond en technisch gevalideerd
**Buiten scope:** stadspagina's aanpassen, Netlify-instellingen wijzigen, gebruikte beelden visueel bewerken en Git-geschiedenis herschrijven

## Doel

Ongebruikte websitebestanden veilig uit de actieve repository verwijderen, zonder zichtbare inhoud, functionaliteit of gebruikte beelden te beschadigen.

## Werkwijze

Alle media in de repository zijn vergeleken met verwijzingen vanuit HTML, CSS, JavaScript, JSON, XML, tekst- en documentatiebestanden. Een bestand is alleen verwijderd wanneer geen enkele geldige bestandsverwijzing werd gevonden. Voor de actieve niet-stadspagina's is daarna nog een afzonderlijke runtimecontrole uitgevoerd.

## Verwijderd

| Onderdeel | Aantal | Omvang |
|---|---:|---:|
| Niet-gerefereerde media | 70 | 130.243.408 bytes |
| Ongebruikte footer-CSS en -JavaScript | 2 | 3.512 bytes |
| **Totaal** | **72** | **130.246.920 bytes (circa 124,2 MiB)** |

De mediaverzameling is teruggebracht van 157 bestanden en circa 146,2 MB naar 87 bestanden en circa 16,0 MB. Dat is een reductie van ongeveer 89% van de mediabestandsgrootte in de werkmap.

De verwijderde bestanden blijven vóór commit via de huidige Git-status direct herstelbaar en na commit via de Git-geschiedenis terug te halen.

## Validatie

- 31 actieve niet-stadspagina's gecontroleerd.
- Geen actieve HTML-, CSS- of JavaScriptverwijzing naar een verwijderd mediabestand gevonden.
- Geen ontbrekende runtime-afbeeldingen op de gecontroleerde niet-stadspagina's.
- Geen identieke mediabestanden meer aangetroffen op basis van SHA-256.
- Alle 87 resterende mediabestanden hebben een repositoryverwijzing.
- Het grootste resterende mediabestand is circa 0,38 MB; een nieuwe compressieronde is daarom niet nodig.
- Geen stadspagina aangepast.
- Geen Netlify-instelling gewijzigd.
- Niets gecommit of gepusht.

Een vooraf bestaande verwijzing vanuit `css/styles.css` naar `assets/den-haag-hero.jpg` hoort uitsluitend bij de buiten-scope stadspagina Den Haag. Dat bestand ontbrak al vóór deze opschoning en is niet door deze verwijdering ontstaan.

## Bewust behouden

- `Vervallen/`: 17 historische HTML-bestanden, circa 0,84 MB.
- `verbeterpunten site.pdf`: bron-/werkdocument van circa 2,95 MB.
- Analyse- en concurrentierapporten: overdracht en onderbouwing voor vervolgwerk.
- Stadspaginabeelden en overige bestanden die nog ergens in de repository worden gebruikt.

Deze onderdelen zijn niet nodig voor de actuele bezoekersweergave, maar kunnen nog als bron, historie of vervolgdocumentatie dienen. Verwijdering daarvan levert bovendien weinig directe browsersnelheid op en vraagt daarom een afzonderlijke, expliciete keuze.

## Verwacht effect

De opschoning verkleint vooral de deployupload, de uitgecheckte werkmap en de hoeveelheid te beheren websitebestanden. Omdat ongebruikte assets normaal niet door de browser worden aangevraagd, is dit geen directe winst van 124,2 MiB per paginaweergave. De directe laadtijdverbeteringen komen uit de eerder uitgevoerde M1-aanpassingen: lazy-loading, asynchrone beelddecodering, hero-preloads en scripts buiten het kritieke renderpad.
