# Functionele QA niet-stadspagina's

**Uitgevoerd:** 9 augustus 2026
**Status:** geslaagd na correcties
**Buiten scope:** alle stadspagina's, een echte formulierverzending en wijzigingen aan Netlify

## Doel en scope

Alle 31 niet-stadspagina's zijn in een lokale browser gecontroleerd op desktop en mobiel. De controle omvatte de homepage, dienstpagina's, 3D-visualisaties en vloerplannen, over ons, contact, blog en blogartikelen, juridische pagina's, de 404-pagina en de bewuste redirectpagina voor aankoopadvies.

Per pagina zijn minimaal de volgende onderdelen gecontroleerd:

- hoofdinhoud, H1 en visuele opbouw;
- desktop- en mobiele navigatie;
- footer en juridische links;
- horizontale overloop en kapotte afbeeldingen;
- zichtbare interne links en ankers;
- browserfouten en waarschuwingen;
- hero-loops, pakketkiezer, btw-schakelaar, FAQ en formulierstappen waar aanwezig.

## Gevonden en herstelde punten

### 1. Contactformulier werd niet geïnitialiseerd

Een verouderde regel probeerde een niet-bestaand element met `id="year"` bij te werken. Daardoor stopte het script voordat de formulierstappen werden geactiveerd. De verouderde regel is verwijderd op de contactpagina. Dezelfde onnodige regel is ook verwijderd op de pagina's over ons en 3D-visualisaties en vloerplannen, zodat deze pagina's geen browserfout meer geven.

Daarnaast zijn stap 2 tot en met 4 nu al in de oorspronkelijke HTML verborgen. Een specifieke CSS-regel bewaakt dit ook wanneer andere stijlen worden geladen. De stapfunctie werkt bij iedere overgang zowel `hidden` als `aria-hidden` bij. Daardoor kan er ook tijdens het laden nooit meer dan één formulierstap tegelijk zichtbaar zijn.

### 2. Pakketkiezer gaf de actieve stap technisch niet door

De zichtbare stap veranderde wel, maar `aria-selected` bleef op stap 1 staan. De actieve status wordt nu bij iedere stap bijgewerkt. De definitieve CTA bevat daarnaast direct het gekozen project, de gekozen diensten en het pakket in de contact-URL. De bestaande klikafhandeling blijft als extra terugval functioneren.

### 3. Blogartikelen gebruikten een verouderde footer

Alle acht blogartikelen gebruikten nog een ingekorte footer met minder diensten en een afwijkende kolomindeling. Deze footers zijn gelijkgetrokken met de homepagefooter. Alleen de relatieve paden zijn aangepast voor de blogmap.

### 4. Dubbele hero-benaming op drie dienstpagina's

Op dakkapel, aanbouw en dakopbouw stond twee keer achter elkaar `Zorgvuldige voorbereiding`. Het derde punt heet nu `Duidelijke opdrachtscope`, passend bij de bestaande toelichting over de afgesproken scope.

## Definitieve validatie

### Pagina's en schermformaten

- 31 niet-stadspagina's gecontroleerd op desktop.
- 31 niet-stadspagina's gecontroleerd op mobiel.
- 62 van 62 schermcontroles geslaagd.
- Geen horizontale overloop gevonden.
- Geen kapotte afbeeldingen gevonden.
- Iedere inhoudspagina heeft één zichtbare H1 en hoofdinhoud; `aankoopadvies.html` is bewust een redirect naar de homepage.
- Geen browserfouten of waarschuwingen meer gevonden in de definitieve controle.

### Navigatie en footers

- Desktopmenu opent, toont de dienstcategorieën en navigeert naar de gekozen dienst.
- Mobiel menu opent en sluit correct, sluit ook met `Escape` en toont na openen van `Diensten` de dienstlinks.
- Alle 31 gecontroleerde routes tonen dezelfde footertekst en dezelfde 24 footerlinks als de homepage.
- De mobiele blogfooter is visueel gecontroleerd na de correctie.

### Hero-loops

- Acht diensthero's gecontroleerd: dakkapel, dakopbouw, aanbouw, erker, mantelzorgwoning, B&B, nokverhoging en bijgebouw.
- Iedere hero bevat vier unieke beelden en precies één actief beeld.
- Iedere hero wisselt automatisch, zonder knoppen of links over het beeld.
- De dakkapelhero is gedurende een volledige cyclus getest en keert na beeld 4 terug naar beeld 1.
- De animatie pauzeert niet bij hover of toetsenbordfocus; alleen een verborgen browsertab of de systeemvoorkeur voor minder beweging onderbreekt de cyclus.

### Prijzen, pakketkiezer en FAQ

- Prijzen worden standaard exclusief btw getoond, met het bedrag inclusief btw eronder.
- De btw-schakelaar zet Pakket A correct om van €250 exclusief naar €302,50 inclusief btw en toont daarna €250 exclusief als tweede bedrag.
- De pakketroute `Dakkapel → Pakket B` geeft €330 exclusief en €399,30 inclusief btw.
- De actieve calculatorstap eindigt correct op stap 3.
- De offerte-link geeft `project=dakkapel`, `dienst=bouwtekening,vergunningbegeleiding` en `pakket=pakket-b` door.
- Het contactformulier selecteert deze waarden correct voor.
- De FAQ opent en werkt de status van de gekozen vraag correct bij.

### Contactformulier zonder verzending

- Alle vier formulierstappen zijn functioneel doorlopen zonder te verzenden.
- Bij het openen en na iedere volgende- of terugactie is exact één formulierstap zichtbaar.
- Stap 1 blokkeert correct bij ontbrekend projecttype, postcode, gemeente en situatie.
- Stap 2 vereist minimaal één dienst.
- Stap 3 vereist een korte projectomschrijving; bestanden blijven optioneel.
- Stap 4 toont de verwachte naam-, e-mail-, telefoon- en privacyvelden.
- Een echte verzending en ontvangstcontrole vallen onder H4.

### Links en foutpagina

- 192 zichtbare lokale links met een anker zijn gecontroleerd; geen ontbrekende ankerdoelen gevonden.
- De 404-pagina toont een duidelijke melding en een werkende link terug naar de homepage.
- De eerdere bestandscontrole van 2.651 lokale verwijzingen blijft zonder ontbrekende doelen.

## Niet gewijzigd

- Geen stadspagina aangepast.
- Geen `width`- of `height`-attributen aan afbeeldingen toegevoegd.
- Geen Netlify-instellingen of externe systemen gewijzigd.
- Geen formulier verzonden.
- Niets gecommit of gepusht.

## Eerstvolgende punt

**H4 — Contactformulier end-to-end:** een echte testaanvraag versturen, de serverreactie controleren en bevestigen dat de aanvraag in de ontvangende mailbox aankomt. Voor de laatste ontvangstcontrole is medewerking van de gebruiker of toegang tot de ontvangende mailbox nodig.
