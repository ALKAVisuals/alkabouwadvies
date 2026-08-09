# End-to-end-test contactformulier

**Uitgevoerd:** 9 augustus 2026
**Testkenmerk:** `H4-CODEX-20260809`
**Status:** GEREED — serververwerking en registratie in Netlify bevestigd
**Buiten scope:** stadspagina's, bestandsuploads, wijzigingen aan Netlify en meerdere testinzendingen

## Uitgevoerde test

Na expliciete toestemming van de gebruiker is exact één herkenbare testaanvraag naar `https://technischbouwadvies.nl/` verzonden voor het formulier `offerteaanvraag`.

De aanvraag bevatte uitsluitend testgegevens, geen bestanden en geen persoonlijke gegevens. In de naam en projectomschrijving stond duidelijk dat het om een technische test ging die niet behandeld hoefde te worden.

## Serverreactie

- HTTP-status: `200`
- Definitieve URL: `https://technischbouwadvies.nl/`
- Redirect: geen
- Content-Type: `text/html`
- Tweede inzending uitgevoerd: nee

De succesvolle HTTP-status bewijst dat de live server het formulierverzoek heeft geaccepteerd. Deze reactie bewijst niet zelfstandig dat een Netlify-notificatie of e-mail daadwerkelijk in de ontvangende mailbox is afgeleverd.

## Ontvangstbevestiging

De gebruiker heeft op 9 augustus 2026 met een schermafbeelding bevestigd dat de aanvraag met testkenmerk `H4-CODEX-20260809` in Netlify zichtbaar is. De getoonde registratie bevatte onder meer de testbron, het projecttype, de postcode, de gemeente, de situatie, de gekozen dienst, de projectomschrijving, de naam, het e-mailadres en het privacyakkoord.

Daarmee is bewezen dat de aanvraag niet alleen met HTTP-status `200` door de live server is geaccepteerd, maar ook correct als formulierinzending is geregistreerd. H4 is daarom afgerond.

De live pagina gebruikt op het testmoment nog de oude versie met de bekende JavaScript-fout rond het ontbrekende element `year`. De lokale reparatie uit H3 is nog niet gepubliceerd. Na de latere publicatie wordt de succes- en foutmelding daarom als releasecontrole nog eenmaal via de live gebruikersinterface gecontroleerd; dit verandert de geslaagde backendregistratie van deze H4-test niet.
