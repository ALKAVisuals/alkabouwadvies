# H5 — Vertrouwen, prijzen en juridische consistentie

**Controle uitgevoerd:** 9 augustus 2026
**Scope:** homepage en alle actieve niet-stadspagina's
**Buiten scope:** stadspagina's, demo-/vervallen pagina's, Netlify-configuratie en publicatie
**Status:** GEREED — websitecorrecties en operationele afspraken bevestigd op 9 augustus 2026

## Resultaat in het kort

De prijscommunicatie is voor consumenten consequent gemaakt: het bedrag inclusief 21% btw staat steeds als eerste en het bedrag exclusief btw als tweede. Pakketprijzen, prominente vanaf-prijzen, formulierteksten, veelgestelde vragen en gestructureerde zoekmachinegegevens zijn onderling gecontroleerd.

Onbevestigde of te stellige vertrouwensclaims zijn verwijderd of genuanceerd. De juridische pagina's zijn aangescherpt voor prijsvermelding, totstandkoming van de overeenkomst, betaling, aansprakelijkheid, klachten, herroepingsrecht, privacy en externe technische diensten.

Het vestigingsadres, KvK-nummer en vestigingsnummer zijn inmiddels door de eigenaar bevestigd en toegevoegd. De website blijft overal de merknaam Technisch Bouwadvies gebruiken. De geregistreerde contractnaam en het btw-nummer worden op uitdrukkelijk verzoek van de eigenaar vooralsnog niet op de website gepubliceerd. Daardoor kan H5 niet als volledig juridisch afgerond worden aangemerkt.

## Uitgevoerde verbeteringen

### 1. Prijscommunicatie

- Op 35 pakketkaarten staat de consumentenprijs inclusief btw primair.
- Het bedrag exclusief btw blijft zichtbaar als secundaire informatie.
- Alle 35 btw-berekeningen zijn rekenkundig gecontroleerd tegen 21% btw; er zijn geen afwijkingen gevonden.
- Prominente vanaf-prijzen op de dienstpagina's zijn op dezelfde manier gecorrigeerd.
- De homepage, prijswisselaar, calculator, veelgestelde vragen, blogs en contactformulier gebruiken dezelfde prijsvolgorde.
- Losse prijzen uit projectkeuzelijsten zijn verwijderd, omdat deze geen duidelijke pakketomvang of btw-context hadden.
- De afwijkende B&B-vanafprijs is hersteld en sluit nu aan op het basistarief.
- Gemeentelijke leges, archiefkosten en projectspecifieke aanvullingen worden niet als inbegrepen voorgesteld wanneer dat niet vaststaat.

### 2. Claims en vertrouwen

- Niet-verifieerbare claims over verzekering, certificering, slagingspercentages, aantallen vergunningen en gegarandeerde uitkomsten zijn niet als actuele bewijsvoering gebruikt.
- Vergunningsinformatie is waar nodig geformuleerd als locatie- en planafhankelijk.
- De formulering "streeftijd: één werkdag" blijft bewust een streeftijd en geen garantie. De eigenaar heeft bevestigd dat dit operationeel haalbaar is doordat een eerste persoonlijke e-mailreactie binnen die termijn kan worden gegeven.
- 3D-visualisaties en vloerplannen worden duidelijk als visueel hulpmiddel gepresenteerd, niet als constructieberekening, uitvoeringstekening of garantie op vergunningverlening.

### 3. Zoekmachinegegevens

- Actieve niet-stadspagina's gebruiken geen onbevestigde openingstijden, betalingsmethoden, geografische coördinaten of onvolledig vestigingsadres meer in JSON-LD.
- De organisatie wordt als landelijke `Organization` beschreven zolang een volledig en bevestigd vestigingsadres ontbreekt.
- Het gemaskeerde telefoonnummer in de bloggegevens is vervangen door het consistente zakelijke telefoonnummer.
- Alle 40 JSON-LD-blokken op de gecontroleerde pagina's zijn technisch geldig JSON.

### 4. Algemene voorwaarden

- Een contact- of offerteaanvraag wordt niet automatisch als overeenkomst aangemerkt.
- Consumentenprijzen worden inclusief btw beschreven; zakelijke prijzen mogen alleen exclusief btw worden aangeboden wanneer dat duidelijk is.
- De betalingsregeling voor consumenten houdt rekening met een voorafgaande herinnering en wettelijke termijn voordat incassokosten worden gerekend.
- Een onnodig brede aansprakelijkheidsuitsluiting en een onbevestigde verzekeringsclaim zijn verwijderd.
- De opdrachtgever mag opgeleverde tekeningen binnen het eigen project delen met gemeente, aannemer en adviseurs.
- Het herroepingsrecht bij overeenkomsten op afstand is toegevoegd, inclusief de voorwaarden voor vroeg beginnen en evenredige betaling.
- Klachten- en geschilbepalingen zijn minder absoluut gemaakt en verwijzen naar dwingend consumentenrecht.

### 5. Privacy en cookies

- De fiscale bewaartermijn is onderscheiden van de bewaartermijn voor volledige projectdossiers.
- Rechtenverzoeken worden binnen één maand behandeld, met de wettelijke mogelijkheid tot verlenging wanneer dat nodig is.
- Externe technische bronnen van Google Fonts, jsDelivr en Cloudflare zijn benoemd.
- Een onbevestigde claim over regelmatige back-ups is verwijderd.
- De broncode bevat geen aangetroffen analytics- of marketingcookies; de bestaande technische voorkeur voor de cookiemelding blijft als functionele opslag beschreven.

### 6. Bevestigde bedrijfsgegevens

- Merknaam op de website: Technisch Bouwadvies.
- Vestigingsadres: Schutkolk 4 d 1, 6582 DB Heumen.
- KvK-nummer: 95153756.
- Vestigingsnummer: 000060582847.
- De gegevens zijn toegevoegd aan de contactpagina, algemene voorwaarden, privacyverklaring en cookieverklaring.
- De homepage bevat het bevestigde adres en KvK-nummer ook in de gestructureerde organisatiegegevens.

## Technische controle

| Controle | Uitkomst |
|---|---:|
| Actieve niet-stadspagina's gecontroleerd | 31 |
| Pakketkaarten met incl.- en excl.-prijs | 35 |
| Fouten in 21%-btw-berekening | 0 |
| JSON-LD-blokken gecontroleerd | 40 |
| Ongeldige JSON-LD-blokken | 0 |
| Onbevestigde schema-velden voor vestiging/openingstijden/betaling | 0 |
| Regels waar excl. btw vóór incl. btw staat | 0 zichtbare prijsregels |
| `git diff --check` | geslaagd |

## Bevestigde operationele afspraken

De eigenaar heeft op 9 augustus 2026 de volgende werkwijze bevestigd:

1. De website blijft overal de merknaam Technisch Bouwadvies gebruiken.
2. De officiële contractnaam en het bevestigde btw-identificatienummer worden niet op de website gepubliceerd, maar staan op de consumentenofferte vóór aanvaarding en vervolgens op de factuur. Alleen vermelding op een factuur na het sluiten van de overeenkomst zou te laat zijn.
3. Toegang tot Netlify-inzendingen, e-mail en klantbestanden wordt beperkt tot bevoegde personen.
4. Niet-doorgegane aanvragen kunnen uiterlijk twaalf maanden na het laatste contact worden verwijderd; fiscale administratie wordt volgens de geldende bewaartermijn bewaard en projectbestanden alleen zolang dat noodzakelijk is.
5. De checklist `concurrentie-analyse/offerte-en-herroepingsworkflow.md` en de teksten uit `concurrentie-analyse/emailtemplates-consumentenofferte.md` worden gebruikt bij consumentenoffertes.
6. Algemene voorwaarden, informatie over de bedenktijd en het modelformulier worden vóór het sluiten van de overeenkomst in een bewaarbare vorm verstrekt.
7. Bij starten binnen de bedenktijd wordt eerst de aparte schriftelijke instemming uit het e-mailsjabloon vastgelegd.

Deze afspraken maken de controle binnen de gekozen website- en procesomvang compleet. Een juridische beoordeling van de concrete offerte- en contractpraktijk blijft aanbevolen en valt buiten deze technische controle.

## Officiële bronnen

- ACM — [Prijzen vermelden](https://www.acm.nl/nl/verkoop-aan-consumenten/consumenten-informeren/prijzen-vermelden)
- ACM — [Bedrijfsgegevens vermelden](https://www.acm.nl/nl/verkoop-aan-consumenten/consumenten-informeren/bedrijfsgegevens-vermelden)
- ACM — [Bedenktijd bij diensten en aankopen op afstand](https://www.acm.nl/nl/verkoop-aan-consumenten/klantenservice/bedenktijd)
- ACM — [Modelinstructie en modelformulier voor herroeping](https://www.acm.nl/sites/default/files/old_publication/publicaties/12753_modelinstructies-ontbinding-herroeping-2014.pdf)
- ACM — [Algemene voorwaarden aanbieden](https://www.acm.nl/nl/verkoop-aan-consumenten/de-koop-sluiten/algemene-voorwaarden-aanbieden)
- ACM ConsuWijzer — [Onredelijke algemene voorwaarden](https://consument.acm.nl/aankoop-dienst-annuleren/algemene-voorwaarden)
- Autoriteit Persoonsgegevens — [Privacyrechten in de praktijk](https://autoriteitpersoonsgegevens.nl/themas/basis-avg/privacyrechten-avg/voor-organisaties-privacyrechten-in-de-praktijk)
- Autoriteit Persoonsgegevens — [Verantwoordingsplicht en privacy-informatie](https://autoriteitpersoonsgegevens.nl/nl/onderwerpen/algemene-informatie-avg/verantwoordingsplicht)
- Autoriteit Persoonsgegevens — [Toestemming en cookiebeleid](https://autoriteitpersoonsgegevens.nl/actueel/foute-cookiebanners-aangepast-na-ingrijpen-ap)
- Rijksoverheid — [Betalingsherinnering en incassokosten](https://www.rijksoverheid.nl/vraag-en-antwoord/schulden/wanneer-incassobureau)

## Afbakening

Dit is een inhoudelijke en technische consistentiecontrole, geen individueel juridisch advies. Laat de definitieve algemene voorwaarden en het verkoopproces zo nodig beoordelen door een Nederlandse jurist die de werkelijke bedrijfsvoering en contractstroom kent.

Er is in deze fase niets gecommit, gepusht of naar Netlify gepubliceerd.
