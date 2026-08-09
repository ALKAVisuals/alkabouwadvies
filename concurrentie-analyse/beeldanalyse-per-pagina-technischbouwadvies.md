# Beeldanalyse per pagina — Technisch Bouwadvies

**Datum:** 31 juli 2026
**Scope:** alle actieve niet-stadspagina's en blogartikelen in de huidige repository
**Buiten scope:** alle stadspagina's, `Vervallen/`, demo- en 404-pagina's
**Doel:** bepalen welke afbeeldingen ontbreken, welke huidige beelden misleidend of repetitief zijn en welke beelden later kunnen worden gemaakt of aangeleverd

## Uitvoeringsstatus — 1 augustus 2026

De hoge-prioriteitscontrole van de actieve niet-stadspagina's is uitgevoerd. Alle nieuwe beelden in `images/website-2026/` zijn daadwerkelijk geopend en inhoudelijk beoordeeld; daarnaast zijn alle lokale `img`-verwijzingen technisch gecontroleerd.

**Afgerond:**

- verkeerde beeldtoewijzingen op homepage, 3D-pagina, aanbouw, dakopbouw, nokverhoging, erker, bijgebouw, mantelzorgwoning en B&B zijn gecorrigeerd;
- carport, bouwkundig advies, digitaliseren, kozijnen en vergunningbegeleiding gebruiken inmiddels een passend eigen dienstbeeld;
- externe stockportretten bij homepage-reviews zijn verwijderd en vervangen door neutrale initialen;
- projectgalerijen zonder bewijs zijn als illustratief concept gelabeld en niet meer aan verzonnen plaatsen of vergunningresultaten gekoppeld;
- tijdelijke reviewkaarten zijn zichtbaar als demo-opmaak gelabeld;
- onjuiste of misleidende alt-teksten en twee technisch kapotte B&B-`img`-tags zijn hersteld;
- er zijn geen ontbrekende lokale beeldbestanden, ongeldige `img`-attributen of onbedoelde dubbele HTML-id's gevonden;
- er zijn op verzoek nog geen `width`- of `height`-attributen aan afbeeldingen toegevoegd.

**Bewust tijdelijk hergebruik:**

- op de B&B-pagina worden `B&B_A1.png` en `B&B3.jpg` ieder nog tweemaal gebruikt;
- op de bijgebouwpagina worden het plan-/gevelbeeld en `Bijgebouw_.png` ieder nog voor twee verschillende uitlegblokken gebruikt;
- op de erkerpagina keren drie bestaande erkerfoto's terug in zowel de type-uitleg als de illustratieve voorbeeldgalerij;
- op de homepage keren enkele 3D- en dienstbeelden terug in verschillende modules; de dubbele stadsthumbnails horen bij aparte desktop- en mobiele presentatie en vallen inhoudelijk buiten deze opdracht.

Dit hergebruik is nu expliciet vastgelegd omdat er nog geen extra unieke beelden of echte projectfoto's beschikbaar zijn. Voor definitieve publieke oplevering blijven extra unieke B&B-, bijgebouw- en erkerbeelden wenselijk. Een teamfoto of AI-portret is niet toegevoegd, omdat er geen echte teamfoto beschikbaar is.

## 1. Samenvatting

De website heeft voldoende beeldbestanden om visueel gevuld te lijken, maar nog geen betrouwbare en consistente beeldstrategie. De belangrijkste tekortkomingen zijn:

1. Eén beeld wordt op verschillende plekken als verschillende inhoud gepresenteerd.
2. Renders en sfeerbeelden worden soms beschreven alsof het constructietekeningen of gerealiseerde projecten zijn.
3. De homepage gebruikt externe stockportretten als klantfoto's.
4. Projectbeelden zijn niet duidelijk gelabeld als echt project, visualisatie, stockbeeld of voorbeeld.
5. Bijna alle blogartikelen hebben helemaal geen inhoudelijke afbeeldingen.
6. Dienstpagina's met slechts één generiek stockbeeld missen bewijs van het concrete eindproduct.
7. 3D-visualisaties en 3D-vloerplannen zijn nog niet als herkenbare aanvullende diensten zichtbaar.
8. Veel PNG-bestanden zijn tussen circa 2,4 en 4,1 MB; één placeholder is bijna 12 MB.
9. Sommige afbeeldingen hebben onjuiste of ontbrekende alt-tekst.
10. De officiële adviseur en echte projectfotografie zijn onvoldoende aanwezig.

## 2. Kritieke huidige beeldproblemen

### Exacte duplicaten met een andere betekenis

- `images/stock/bouwkundig-advies.png` is exact hetzelfde bestand als `images/Dakopbouw_.png`.
- `images/stock/carport-vergunning.png` is exact hetzelfde bestand als `images/Dakkapel_.png`.

Deze bestanden mogen niet als verschillende diensten worden gepresenteerd. Vervang beide stockbestanden door een werkelijk passend beeld.

### Zelfde beeld, verschillende beweringen

- `Bijgebouw_.png` wordt gebruikt als modern tuinhuis, perceelschets, opslaggebouw en technische/lege afbeelding.
- `Dakkapel_.png` wordt zowel als dakkapel als constructietekening gepresenteerd.
- `Dakopbouw_.png` wordt herhaald voor woningwaarde, vergunning en algemeen dakopbouwbeeld.
- `Mantelzorg_.png` wordt gebruikt voor prefab, traditioneel, familie-/zorgsituatie en technische funderingsdetails.
- `Nok_.png` wordt gebruikt voor verschillende architectonische en financiële boodschappen.
- Verschillende erkerfoto's worden tevens als technische detailtekening en meerdere plaatsgebonden projecten beschreven.

Een afbeelding kan opnieuw worden gebruikt als exact hetzelfde onderwerp wordt getoond, maar niet met een nieuwe feitelijke betekenis.

### Stockportretten als klantprofielen

De homepage laadt twee Unsplash-portretten met alt-teksten waarin fictief of onbewezen namen, projecten en plaatsen staan. Ook `tim-adviseur.jpg` wordt eenmaal als klant/aannemer “Peter Bakker” en elders als adviseur gebruikt.

**Actie:** verwijder alle portretten bij reviews totdat echte klanten toestemming hebben gegeven. Gebruik initialen zonder foto of een neutraal reviewontwerp. Gebruik het adviseursportret uitsluitend voor de werkelijke persoon met de correcte naam.

### Projectstatus is onduidelijk

Beelden als `Uitbouw1.png`, `woonrenovatie en keukenaanbouw van 25 m2.png`, `B&B3.jpg` en erkerfoto's worden gekoppeld aan concrete plaatsen en uitkomsten. Uit de repository blijkt niet of het echte eigen projecten, stockbeelden of renders zijn.

**Actie:** leg per beeld intern vast:

- maker en auteursrecht;
- klant/project;
- toestemming voor publicatie;
- echt gerealiseerd, 3D-visualisatie of stock;
- welke rol Technisch Bouwadvies had;
- welke feitelijke projectclaims zijn toegestaan.

Zonder bewijs mag het beeld alleen als algemene illustratie worden gebruikt.

## 3. Beeldcategorieën voor de vernieuwde website

Gebruik vijf vaste labels:

1. **Echt project** — foto van een werkelijk project met toestemming.
2. **Bouwkundige tekening** — geanonimiseerde uitsnede van een echte tekeningset.
3. **3D-visualisatie** — realistische impressie, duidelijk als visualisatie vermeld.
4. **3D-vloerplan** — ingerichte ruimtelijke impressie, geen officiële bouwtekening.
5. **Algemene illustratie** — sfeer- of uitlegbeeld zonder projectclaim.

Deze categorie moet in CMS/alt-tekst/bijschrift duidelijk zijn, vooral bij 3D-beelden.

## 4. Prioritaire beeldproductie

### Eerst echte materialen verzamelen

Deze beelden moeten bij voorkeur niet met AI worden gemaakt:

- professioneel portret van de echte adviseur;
- adviseur tijdens tekenwerk of overleg;
- drie geanonimiseerde bouwtekeningensets;
- foto's van echte gerealiseerde projecten;
- echte klantfoto's alleen met schriftelijke toestemming;
- certificaten en bewijsdocumenten.

### Geschikt voor 3D-productie via ALKA Visuals

- aanbouw/uitbouw voor en na;
- dakkapel in bestaande en nieuwe situatie;
- dakopbouw/nokverhoging;
- erker aan de voorgevel;
- mantelzorgwoning in de tuin;
- bijgebouw/tuinkantoor;
- B&B-indeling;
- ingerichte 3D-vloerplannen voor uitbouw, dakopbouw, mantelzorg en B&B.

### Geschikt voor neutrale gegenereerde uitlegillustraties

- stappen van vergunningaanvraag;
- verschil tussen technische tekening, 3D-visualisatie en 3D-vloerplan;
- schematische voor-/achterzijde of bouwvolume;
- digitaliseren: papieren tekening naar schoon digitaal bestand.

Deze illustraties mogen niet als echte projecten worden gepresenteerd.

## 5. Analyse per pagina

### Homepage — `index.html`

**Nu aanwezig:** 43 afbeeldingen, waaronder dienstbeelden, gemeenteafbeeldingen, stockportretten, galerijbeelden, drie projectbeelden en een adviseursportret.

**Problemen:**

- Te veel verschillende beeldtypen zonder duidelijke status.
- Externe stockportretten worden als echte klanten benoemd.
- `tim-adviseur.jpg` heeft tegenstrijdige identiteiten.
- Veel gemeenteafbeeldingen worden dubbel geladen en vallen buiten de gewenste niet-stadfocus.
- Galerijbeelden bewijzen niet duidelijk welke werkzaamheden door Technisch Bouwadvies zijn uitgevoerd.
- Projectbeelden zijn niet controleerbaar gelabeld.

**Ontbreekt:**

1. Eén sterke hero-compositie: technische tekening naast realistische 3D-uitkomst of echt project.
2. Een echte foto van de adviseur tijdens het werk.
3. Drie consistente dienstthumbnailreeksen in dezelfde stijl.
4. Een duidelijk voorbeeld “bouwtekening → 3D-vloerplan → 3D-visualisatie”.
5. Twee of drie bewijsbare projectcases met bijschrift.
6. Echte reviewpresentatie zonder stockklantfoto's.

**Aanbevolen productie:** één hero, één adviseursessie, drie casebeeldsets en acht tot tien consistente dienstthumbnails. Hergebruik bestaande renders alleen na juiste classificatie.

**Prioriteit: kritiek/hoog.**

### Aanbouw en uitbouw — `aanbouw-uitbouw.html`

**Nu aanwezig:** zeven afbeeldingen, maar twee bestanden worden herhaald. Eén foto wordt als constructietekening beschreven terwijl het geen aantoonbare technische tekening is.

**Ontbreekt:**

- echte bestaande-situatiefoto;
- echte/geanonimiseerde plattegrond en doorsnede;
- fotorealistische exterieurrender van de nieuwe uitbouw;
- ingericht 3D-vloerplan met looproutes;
- eventueel gerealiseerde eindfoto;
- vergelijking tussen aanbouw en uitbouw in één simpele illustratie.

**Ideale beeldset:** vijf stappen: bestaand → bouwtekening → 3D-vloerplan → render → realisatie.

**Prioriteit: hoog.**

### Dakkapel — `dakkapel.html`

**Nu aanwezig:** twee keer hetzelfde `Dakkapel_.png`, eenmaal benoemd als dakkapel en eenmaal als constructietekening.

**Ontbreekt:**

- voor-/achteraanzicht van een dakkapel;
- uitsnede van een echte bouwtekening met maatvoering;
- constructief detail alleen als een echte constructeurstekening beschikbaar is;
- 3D-visualisatie van bestaande en nieuwe situatie;
- eenvoudig schema van plaatsing op het dak zonder universele vergunningclaim.

**Prioriteit: hoog.**

### Dakopbouw — `dakopbouw-vergunningen.html`

**Nu aanwezig:** vier keer hetzelfde renderbestand met verschillende betekenissen; één alt-tekst ontbreekt.

**Ontbreekt:**

- bestaand dak en voorgestelde dakopbouw naast elkaar;
- bouwkundige doorsnede;
- volume-/massastudie;
- fotorealistische exterieurrender;
- 3D-vloerplan van de toegevoegde verdieping;
- eventueel echte realisatiefoto.

**Prioriteit: hoog.**

### Nokverhoging — `nokverhoging.html`

**Nu aanwezig:** drie keer hetzelfde vierkante beeld.

**Ontbreekt:**

- helder verschil tussen nokverhoging en dakopbouw;
- voor/na-zijaanzicht van de kap;
- echte doorsnede met trap en stahoogte;
- 3D-vloerplan van de nieuwe verdieping;
- render waarin aansluiting op bestaande architectuur zichtbaar is.

**Prioriteit: hoog.**

### Erker — `erker.html`

**Nu aanwezig:** relatief veel beelden, maar dezelfde drie à vier beelden worden gebruikt als ontwerpvariant, technisch detail en projecten in verschillende steden.

**Ontbreekt:**

- echte vergelijking klassieke versus Franse erker;
- geveltekening vóór en na;
- correcte technische detailuitsnede;
- 3D-visualisatie van materiaal-/kleurvarianten;
- één bewijsbare projectcase.

**Actie:** bestaande foto's niet langer aan specifieke plaatsen/projecten koppelen zonder bewijs.

**Prioriteit: hoog.**

### Bijgebouw — `bijgebouw.html`

**Nu aanwezig:** vier keer hetzelfde `Bijgebouw_.png`; één alt-tekst ontbreekt.

**Ontbreekt:**

- drie verschillende functies: opslag, tuinkantoor en verblijfsruimte;
- simpele perceelillustratie met positie van hoofdgebouw en bijgebouw;
- echte plattegrond/gevelset;
- 3D-vloerplan wanneer het gebouw een verblijfsfunctie heeft;
- exterieurrender passend bij tuin en hoofdgebouw.

**Prioriteit: hoog.**

### Mantelzorgwoning — `mantelzorg.html`

**Nu aanwezig:** zes keer hetzelfde beeld met verschillende claims over prefab, traditioneel, familie en funderingsdetail.

**Ontbreekt:**

- echte vergelijking prefab en traditioneel;
- perceel-/situatieplan;
- toegankelijk ingericht 3D-vloerplan;
- exterieurrender in relatie tot hoofdwoning en tuin;
- geanonimiseerde bouwtekening;
- eventueel toegankelijkheidsdetails, alleen wanneer technisch correct.

**Prioriteit: hoog.**

### Bed & Breakfast — `bed-breakfast.html`

**Nu aanwezig:** zes afbeeldingen uit vier bestanden; renders/sfeerbeelden worden als meerdere specifieke projecten beschreven.

**Ontbreekt:**

- duidelijk 3D-vloerplan met gastenkamers, privéruimte en looproutes;
- render van één gastenkamer en gemeenschappelijke ruimte;
- schema van bestaande versus nieuwe gebruiksindeling;
- echte projectcase met toestemming;
- functioneel beeld rond parkeren/toegang alleen als het inhoudelijk wordt uitgelegd.

**Prioriteit: midden/hoog.**

### Carport — `carport-vergunning.html`

**Nu aanwezig:** één stockbestand dat exact hetzelfde is als het dakkapelbeeld.

**Ontbreekt:**

- werkelijk carportbeeld;
- situatie op het perceel;
- voor-/zijaanzicht;
- materiaalvariant hout/staal indien aangeboden;
- eenvoudige bouwtekeninguitsnede.

Een 3D-vloerplan is hier niet nodig; één goede exterieurrender kan wel nuttig zijn.

**Prioriteit: kritiek/hoog.**

### Kozijnen vervangen — `kozijnen-vervangen-vergunning.html`

**Nu aanwezig:** één passend maar generiek stockbeeld.

**Ontbreekt:**

- gevel vóór en na;
- drie materiaal-/profielvarianten indien relevant;
- geveltekening met gewijzigde raamindeling;
- detailbeeld van kleur en profilering;
- monument/beschermd gezicht alleen met passend werkelijk voorbeeld.

3D-vloerplannen zijn niet relevant.

**Prioriteit: midden.**

### Omgevingsvergunning aanvragen — `omgevingsvergunning-aanvragen.html`

**Nu aanwezig:** één brede generieke stockafbeelding.

**Ontbreekt:**

- visuele proceslijn van check tot besluit;
- voorbeeld van een complete documentenset;
- screenshot/illustratie van de officiële route zonder overheidsinterface misleidend na te maken;
- overzicht van rollen: klant, Technisch Bouwadvies, constructeur en bevoegd gezag;
- echt dossiervoorbeeld, volledig geanonimiseerd.

**Prioriteit: hoog.**

### Bouwkundig advies — `bouwkundig-advies.html`

**Nu aanwezig:** één “stockbeeld” dat exact hetzelfde is als de dakopbouwrender.

**Ontbreekt:**

- adviseur die een bouwplan beoordeelt;
- voorbeeld van een adviesmemo;
- geannoteerde kaart/tekening met aandachtspunten;
- visualisatie van de drie adviesonderdelen;
- echte expertfoto.

**Prioriteit: kritiek/hoog.**

### Bouwtekening digitaliseren — `bouwtekening-digitaliseren.html`

**Nu aanwezig:** één generiek stockbeeld.

**Ontbreekt:**

- echte papieren archieftekening;
- close-up van beschadigde of slecht leesbare bron;
- schoon digitaal resultaat;
- voor/na-slider;
- voorbeeld van PDF- en DWG-output zonder vertrouwelijke projectinformatie.

Dit is een pagina waar een echte voor/na-demonstratie belangrijker is dan een sfeerbeeld.

**Prioriteit: hoog.**

### Aankoopadvies — `aankoopadvies.html`

**Nu aanwezig:** geen pagina-inhoud en geen afbeeldingen.

**Beslissing nodig:** als de dienst wordt aangeboden, zijn een woning-/perceelanalyse, voorbeeldmemo en kaart-/regeluitsnede nodig. Als de dienst niet wordt aangeboden, geen beeld produceren en de pagina definitief doorverwijzen.

**Prioriteit: laag totdat dienstbesluit is genomen.**

### Over ons — `over-ons.html`

**Nu aanwezig:** alleen een redirect; geen eigen beelden.

**Ontbreekt:**

- officieel portret van de adviseur;
- werkfoto achter bouwtekening/beeldscherm;
- overleg- of locatiebeeld;
- eventueel klein beeld dat samenwerking met ALKA Visuals toont;
- geen stockteam of AI-portret.

**Prioriteit: kritiek/hoog.**

### Testimonials — `testimonials.html`

**Nu aanwezig:** geen echte afbeeldingen; reviewkaarten gebruiken lege avatars. Homepage gebruikt wel problematische stockportretten.

**Ontbreekt:** niet noodzakelijk klantportretten. Beter zijn:

- bronlogo of tekstlink naar reviewplatform;
- projectthumbnail bij de review, met toestemming;
- datum en projecttype;
- eventueel initialen wanneer klant geen foto wil.

Gebruik geen gegenereerde of stockfoto's om reviewers menselijker te laten lijken.

**Prioriteit: hoog voor betrouwbaarheid, laag voor nieuwe fotografie.**

### Blogoverzicht — `blog.html`

**Nu aanwezig:** geen afbeeldingen voor zeven zichtbare artikelkaarten.

**Ontbreekt:** één vaste illustratiestijl en een unieke thumbnail per artikel. Gebruik liever technische diagrammen, tekeninguitsneden of eenvoudige 3D-uitlegbeelden dan generieke stockwoningen.

**Aanbevolen set:** acht thumbnails in dezelfde verhouding en visuele stijl.

**Prioriteit: hoog.**

### Blog: aanbouw zonder vergunning

**Nu aanwezig:** geen inhoudelijke afbeeldingen.

**Ontbreekt:** schema van hoofdgebouw/achtererfgebied, voorbeeld van aanbouwvolume en stappenkaart voor officiële check. Vermijd een universele rood/groen-afbeelding die locatieafhankelijkheid verbergt.

**Prioriteit: midden.**

### Blog: bestemmingsplan uitgelegd

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** visuele uitleg van omgevingsplan/Regels op de kaart, geanonimiseerde kaartuitsnede en een beslisdiagram “past / afwijken / overleg”.

**Prioriteit: midden.**

### Blog: bouwtekeningchecklist

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** dé belangrijkste kans voor inhoudelijk beeld:

- plattegrond;
- gevelaanzicht;
- doorsnede;
- situatietekening;
- detailtekening;
- voorbeeld van titelblok en maatvoering.

Gebruik geanonimiseerde echte voorbeelden met genummerde toelichting.

**Prioriteit: hoog.**

### Blog: dakkapel plaatsen

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** voor-/achteraanzicht, tekeningvoorbeeld, bestaande/nieuwe 3D-visualisatie en een niet-definitieve visuele checklist voor officiële vergunningcontrole.

**Prioriteit: midden/hoog.**

### Blog: mantelzorgwoning bouwen

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** vergelijking losstaand/aanbouw/inpandig, toegankelijk 3D-vloerplan en situatieplan in de tuin. Juridische varianten moeten als voorbeelden, niet als algemene toestemming, worden gepresenteerd.

**Prioriteit: midden/hoog.**

### Blog: nokverhoging of dakopbouw

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** één heldere vergelijkingsillustratie, twee doorsneden en twee 3D-volumebeelden. Deze beelden kunnen ook intern linken naar de twee dienstpagina's.

**Prioriteit: hoog.**

### Blog: omgevingsvergunning aanvragen

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** procesdiagram, documentenchecklist en rollenoverzicht. Gebruik geen nagemaakte officiële keurmerken of overheidsinterface.

**Prioriteit: midden.**

### Blog: Omgevingswet-gids

**Nu aanwezig:** geen afbeeldingen.

**Ontbreekt:** actueel schema van activiteiten, Omgevingsloket-route en technische versus ruimtelijke beoordeling. De gids moet eerst inhoudelijk worden geactualiseerd voordat nieuwe beelden worden gemaakt.

**Prioriteit: inhoud eerst hoog; beeld daarna midden.**

### Juridische pagina's — privacy, cookies en voorwaarden

**Nu aanwezig:** alleen het logo.

**Ontbreekt:** geen aanvullende afbeeldingen noodzakelijk. Rust en leesbaarheid zijn belangrijker. Eventueel één klein document-/privacy-icoon, maar alleen als onderdeel van een consistent iconsysteem.

**Prioriteit: laag.**

## 6. Minimale eerste beeldset

Om de grootste gaten te vullen zonder direct tientallen beelden te maken:

| Nr. | Beeld | Type | Hergebruik |
|---:|---|---|---|
| 1 | Hero: bouwtekening naar 3D-eindbeeld | Compositie/3D | Homepage en 3D-pagina |
| 2 | Echte adviseur, professioneel portret | Fotografie | Home en Over ons |
| 3 | Adviseur tijdens tekenwerk | Fotografie | Home, Over ons, advies |
| 4 | Aanbouw bestaande situatie | Echt/bronbeeld | Aanbouwcase |
| 5 | Aanbouw bouwtekening | Echte geanonimiseerde tekening | Aanbouwcase en checklistblog |
| 6 | Aanbouw 3D-vloerplan | ALKA Visuals | Aanbouw en 3D-pagina |
| 7 | Aanbouw fotorealistische render | ALKA Visuals | Home, aanbouw en 3D-pagina |
| 8 | Dakkapel voor/na-render | ALKA Visuals | Dakkapel en blog |
| 9 | Dakopbouw met 3D-vloerplan | ALKA Visuals | Dakopbouw/nok en 3D-pagina |
| 10 | Mantelzorgwoning met toegankelijk vloerplan | ALKA Visuals | Mantelzorg en 3D-pagina |
| 11 | Digitaliseren voor/na | Echte tekening | Digitaliseren |
| 12 | Vergunningprocesdiagram | Illustratie | Vergunningpagina en blog |
| 13–20 | Acht kennisbankthumbnails | Illustratiereeks | Blogoverzicht/artikelen |

Met deze set ontstaat een geloofwaardige basis. Daarna kunnen per dienst echte cases worden toegevoegd.

**Huidige beperking:** Technisch Bouwadvies heeft nog geen teamfoto, testimonials of gerealiseerde eigen projectcases. De bestaande review- en casekaarten mogen in de ontwikkelversie tijdelijk als opvulling blijven staan, maar uitsluitend wanneer ze zichtbaar als demo-inhoud, voorbeeldsituatie, illustratie of visualisatie zijn gelabeld. Presenteer geen nagebootste klantfoto's, klantquotes of projectresultaten als echt bewijs. De adviseursfoto's in deze voorgestelde set worden pas gemaakt en gebruikt wanneer echte fotografie beschikbaar is. Voor publieke eindoplevering wordt tijdelijke demo-inhoud vervangen of verwijderd.

## 7. Technische beeldrichtlijnen

### Bestandsformaten

- Bewaar een hoogwaardig bronbestand buiten of gecontroleerd binnen de website-assets.
- Publiceer primair AVIF of WebP.
- Gebruik PNG alleen voor transparantie of wanneer lijnwerk dit echt vereist.
- Gebruik SVG voor eenvoudige diagrammen en iconen.

### Richtmaten

- Hero: bron minimaal 2000 px breed; publicatievarianten rond 1920, 1280 en 768 px.
- Case/detailbeeld: circa 1200–1600 px breed.
- Kaart/thumbnail: circa 600–900 px breed.
- Reviewavatar indien echt gebruikt: circa 160–320 px.
- 3D-vloerplan: voldoende resolutie voor leesbaarheid, met aparte mobiele uitsnede indien nodig.

### Gewicht

- Hero bij voorkeur onder circa 300 KB in productie.
- Kaartbeelden bij voorkeur onder circa 120 KB.
- Vermijd huidige multi-megabyte PNG's direct in de pagina.
- `placeholderstaalconstructie.png` van bijna 12 MB moet worden vervangen of sterk geoptimaliseerd.

### Naamgeving

Gebruik beschrijvende, stabiele namen:

- `aanbouw-bestaande-situatie.webp`
- `aanbouw-bouwtekening-plattegrond.webp`
- `aanbouw-3d-vloerplan.webp`
- `aanbouw-3d-visualisatie.webp`
- `adviseur-technisch-bouwadvies-portret.webp`

Vermijd spaties, tijdelijke namen, klantnamen zonder toestemming en generieke namen als `image1`.

### Alt-tekst en bijschrift

- Alt-tekst beschrijft wat zichtbaar en functioneel relevant is.
- Bijschrift vermeldt of iets een visualisatie, bouwtekening of gerealiseerd project is.
- Een decoratief beeld krijgt `alt=""`.
- Voeg geen projectplaats, klantnaam, certificering of resultaat toe als dit niet uit het beeld blijkt en niet is bewezen.

## 8. Productiewerkwijze en GitHub

1. Maak eerst een inventaris van alle bestaande beeldtoepassingen op de niet-stadspagina's.
2. Open ieder beeld en controleer visueel of woningtype, ingreep, omgeving en tekstcontext bij elkaar passen.
3. Markeer onbedoelde doublures, verkeerde beelden, kapotte `src`-waarden en misleidende alt-teksten.
4. Selecteer daarna per nieuwe batch maximaal drie tot vijf beelden.
5. Leg doelpagina, uitsnede, stijl, status en tekstfunctie vast.
6. Maak eerst concepten buiten de productie-assets.
7. Laat ieder concept beoordelen op bouwkundige plausibiliteit en merkstijl.
8. Kies definitieve varianten.
9. Exporteer responsive webformaten.
10. Plaats bestanden in bijvoorbeeld `images/projects/`, `images/services/`, `images/3d/` en `images/blog/`.
11. Pas daarna HTML/CSS en alt-teksten aan.
12. Controleer desktop, mobiel, performance, beeldstatus/bijschrift en onbedoeld hergebruik opnieuw.
13. Commit en push pas na expliciete goedkeuring.

## 9. Eerstvolgende aanbevolen stap

Voer vóór nieuwe beeldgeneratie eerst de volledige beeldmapping-audit uit. De eerste inventarisatie laat al zien dat sommige bestanden op dezelfde pagina worden herhaald en dat enkele oudere `src`-waarden of extensies verdacht zijn. Beoordeel die gevallen visueel; vervang niets uitsluitend op basis van de bestandsnaam.

Maak daarna nog niet alle beelden tegelijk. Begin met:

1. Homepagehero.
2. Adviseursportret en werkfoto.
3. Eén complete aanbouwcase met bouwtekening, 3D-vloerplan en render.
4. Eén dakkapel-voor/na-visualisatie.
5. Eén set van acht kennisbankthumbnails.

Na beoordeling van deze visuele richting kunnen de overige dienstpagina's consistent worden aangevuld.
