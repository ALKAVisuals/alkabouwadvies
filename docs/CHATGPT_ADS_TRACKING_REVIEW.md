# ChatGPT Ads — veilige herkomstmeting (ontwikkelbranch)

Status: **alleen in `aleks-developer`, niet live**. Dit is een eerste, bewust beperkte implementatie. **Niet naar `main` mergen zonder expliciete goedkeuring.**

## Scope
- Advertentiecampagnes: alleen **Bouwtekeningen** en **Vergunningbegeleiding**.
- Constructieberekeningen blijven buiten ChatGPT-advertentiecampagnes.
- Bestaande Google Ads en GA4-metingen blijven ongewijzigd. De primaire Google Ads-conversieactie heet `GA4 - Offerteformulier verzonden` en is aan `generate_lead` gekoppeld.
- Geen betaalde advertenties aangemaakt en geen wijziging aan Ads Manager.

## Aangebrachte code
- `chatgpt-attribution.js`: afzonderlijke, first-party herkomstregistratie. Een advertentiebezoek wordt alleen geregistreerd bij `utm_source=chatgpt`, nadat de bestaande toestemming voor analyse **en** advertenties is verleend. De code verstuurt zelf **geen** netwerkrequests, GA4-events of OpenAI Pixel-events.
- `site-header.js`: laadt de helper naast de bestaande privacycode; geen wijziging aan Google-code of toestemmingslogica.
- `netlify-forms.html`: registreert vier optionele Netlify-velden bij de bestaande formuliertypen.
- `scripts/build-site.mjs`: kopieert het nieuwe script naar de gebouwde website.
- `tests/chatgpt-attribution.test.mjs`: nieuwe tests voor herkomst, toestemming, sessienavigatie, veilige invoer en het ongemoeid laten van Google-verkeer.

## Formuliervelden
De attributievelden zijn `marketing_source`, `marketing_medium`, `marketing_campaign` en `marketing_content`.
Alleen eenvoudige, begrensde campagnecodes zijn toegestaan (A-Z, a-z, 0-9, streep en underscore, maximaal 100 tekens). Andere URL-parameters, persoonsgegevens uit formulieren en een OpenAI `oppref`-waarde worden **niet** opgeslagen door dit script.
De attributie blijft gedurende de huidige browsersessie in `sessionStorage`, maar wordt verwijderd bij intrekken van relevante toestemming.

## Voorbeeld van een toekomstige landings-URL
Bouwtekeningen:
`https://technischbouwadvies.nl/bouwtekening-laten-maken.html?utm_source=chatgpt&utm_medium=paid&utm_campaign=bouwtekeningen&utm_content=algemeen`

Vergunningbegeleiding:
`https://technischbouwadvies.nl/omgevingsvergunning-aanvragen.html?utm_source=chatgpt&utm_medium=paid&utm_campaign=vergunningbegeleiding&utm_content=algemeen`

Deze URL's zijn voorbeeldvoorstellen, geen geplaatste advertenties. Voeg `oppref` niet zelf toe; OpenAI beheert de klikreferentie.

## Openstaande werkzaamheden vóór publicatie (blokkerend)
1. **Google eerst functioneel valideren:** in Google Ads staat één primaire GA4-conversieactie, maar gedurende de recent gecontroleerde zeven dagen waren er nul toegeschreven conversies. Verifieer via GA4 DebugView en Google Ads of een echte, toegestane testaanvraag wordt gemeten. Nul zegt op zichzelf niet dat de configuratie stuk is.
2. **Tests en build uitvoeren:** `npm run build` en `npm test` op de ontwikkelbranch; controleer de gebouwde JS en Netlify-formulierdefinities.
3. **Functionele Netlify-test:** test zowel `offerteaanvraag` als `contactaanvraag` op een veilige preview. Gebruik expliciete testgegevens en houd productieaanvragen schoon.
4. **Toestemming testen:** weigeren = geen herkomstvelden; alleen analyse = geen herkomstvelden; analyse + conversiemeting = ChatGPT-herkomstvelden. Andere bronnen, waaronder `google`, mogen nooit de nieuwe velden krijgen.
5. **Privacyteksten bijwerken en juridisch controleren:** de bestaande banner en het cookie-/privacybeleid spreken vooral over Google Ads. Vermeld vóór livegang specifiek dat na advertentietoestemming ook ChatGPT-campagneherkomst met een offerteaanvraag kan worden opgeslagen. Zolang dit niet bijgewerkt is, niet publiceren.
6. **GA4-eigen verkeersrapportage separaat beoordelen:** `privacy-consent.js` filtert nu UTM-parameters uit de expliciete `page_location`. Dat is bewust NIET aangepast om Google ongemoeid te laten. Dit blokkeert betrouwbare UTM-campagnerapportage via die pagina-URL; de nieuwe Netlify-velden bieden vooralsnog alleen een beperkte interne herkomstanalyse. Een eventuele GA4-wijziging is een eigen reviewpunt.
7. **OpenAI Pixel/CAPI is nog NIET gekoppeld:** OpenAI Ads Manager heeft nog geen conversiebron of conversie-event. Maak die later aan, voeg `lead_created` uitsluitend na succesvolle formulierverzending toe met passende toestemming, en valideer de debugmeldingen. Deze code doet dat nog niet.
8. **Release-goedkeuring:** geen merge, productiedeploy of Ads-activering zonder expliciete toestemming.

## Acceptatiecriteria
- Google Ads-klik-ID's, GA4-meet-ID, `generate_lead`-events en bestaande cookiekeuzes blijven functioneren zoals vóór de wijziging.
- `utm_source=google` en niet-toegestane bezoekers leveren geen `marketing_*`-velden op.
- Een toegestane ChatGPT-aanvraag heeft correcte campagnevelden in Netlify, zonder persoonlijke URL-querywaarden.
- Geen formulierfouten, dubbele aanvragen of dubbele conversies.
- Na goedkeuring is terugdraaien mogelijk via een gewone revert van de branchwijzigingen.

## Reikwijdte van deze verificatie
Statische code-inspectie en gesimuleerde JavaScript-scenario's zijn uitgevoerd. Een volledige `npm test`-run, een Netlify-previewtest, GA4 DebugView-test en de daadwerkelijke OpenAI Pixel-test zijn nog niet uitgevoerd. Deze verificaties zijn vereist voor een verantwoorde livegang.
