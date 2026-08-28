import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const consent = fs.readFileSync(new URL('../privacy-consent.js', import.meta.url), 'utf8');
const header = fs.readFileSync(new URL('../site-header.js', import.meta.url), 'utf8');
const contact = fs.readFileSync(new URL('../contact.html', import.meta.url), 'utf8');
const homepage = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const permitPage = fs.readFileSync(new URL('../omgevingsvergunning-aanvragen.html', import.meta.url), 'utf8');
const sharedContact = fs.readFileSync(new URL('../contact-section.js', import.meta.url), 'utf8');
const privacy = fs.readFileSync(new URL('../privacybeleid.html', import.meta.url), 'utf8');
const cookies = fs.readFileSync(new URL('../cookiebeleid.html', import.meta.url), 'utf8');

test('measurement loads only after explicit analytics consent on the production host', () => {
    assert.match(consent, /consent\?\.analytics === 'granted'/);
    assert.match(consent, /PRODUCTION_HOSTS\.has\(window\.location\.hostname\)/);
    assert.match(consent, /if \(!mayLoadAnalytics\(consent\)\) return/);
});

test('consent defaults are denied and measurement grants do not enable personalization', () => {
    assert.match(consent, /ad_storage: 'denied'/);
    assert.match(consent, /ad_user_data: 'denied'/);
    assert.match(consent, /ad_personalization: 'denied'/);
    assert.match(consent, /const adsConsent = consent\.ads === 'granted'/);
    assert.match(consent, /ad_storage: adsConsent/);
    assert.match(consent, /ad_user_data: adsConsent/);
    assert.match(consent, /allow_google_signals: false/);
    assert.match(consent, /allow_ad_personalization_signals: false/);
});

test('consent expires and can change between denied and granted on the same page', () => {
    assert.match(consent, /CONSENT_MAX_AGE_MS = 180 \* 24 \* 60 \* 60 \* 1000/);
    assert.match(consent, /Date\.now\(\) - Date\.parse\(parsed\.updatedAt\) > CONSENT_MAX_AGE_MS/);
    assert.match(consent, /if \(measurementLoaded\) \{/);
    assert.match(consent, /window\.gtag\('consent', 'update', \{/);
    assert.match(consent, /window\.location\.reload\(\)/);
});

test('page measurement permits only Google click identifiers from query strings', () => {
    assert.match(consent, /return window\.location\.pathname \|\| '\/'/);
    assert.match(consent, /new Set\(\['gclid', 'gbraid', 'wbraid'\]\)/);
    assert.match(consent, /\^\[A-Za-z0-9_-\]\{10,200\}\$/);
    assert.match(consent, /page_location: measurementPageLocation\(\)/);
    assert.match(consent, /currentUrl\.searchParams\.get\(parameter\)/);
    assert.match(consent, /CLICK_ID_PATTERN\.test\(value\)/);
    assert.doesNotMatch(consent, /page_location:[^\n]+window\.location\.href/);
});

test('lead measurement is allowlisted and called only after successful form responses', () => {
    assert.match(consent, /new Set\(\['contact', 'contactaanvraag', 'offerteaanvraag'\]\)/);
    assert.match(consent, /window\.gtag\('event', 'generate_lead', \{ form_type: formType \}\)/);
    assert.match(homepage, /<form[^>]+name="contactaanvraag"[^>]+data-unified-contact="true"/);
    assert.match(permitPage, /<form[^>]+name="contactaanvraag"[^>]+data-unified-contact="true"/);

    const contactSuccess = sharedContact.indexOf("if (!response.ok) throw new Error('Formulier kon niet worden verzonden');");
    const contactEvent = sharedContact.indexOf('window.tbaTrackLead');
    assert.ok(contactSuccess >= 0 && contactEvent > contactSuccess);

    const quoteSuccess = contact.indexOf("if (!response.ok) throw new Error('Netlify Forms gaf geen succesvolle status terug.');");
    const quoteEvent = contact.indexOf("window.tbaTrackLead('offerteaanvraag')");
    assert.ok(quoteSuccess >= 0 && quoteEvent > quoteSuccess);
});

test('banner gives accept and reject on one layer and supports reopening settings', () => {
    assert.match(consent, />Weigeren<\/button>/);
    assert.match(consent, />Alleen analyse<\/button>/);
    assert.match(consent, />Analyse \+ conversiemeting<\/button>/);
    assert.match(consent, /data-cookie-settings/);
    assert.match(consent, /banner\.hidden = false/);
});

test('city pages are explicitly excluded from this rollout', () => {
    for (const city of ['amsterdam.html', 'apeldoorn.html', 'arnhem.html', 'breda.html', 'den-haag.html', 'eindhoven.html', 'groningen.html', 'nijmegen.html', 'rotterdam.html', 'tilburg.html', 'utrecht.html']) {
        assert.ok(header.includes(`'${city}'`));
    }
    assert.match(header, /!consentExcludedPages\.has\(consentFilename\)/);
    assert.ok(header.includes("'404.html'"));
});

test('privacy and cookie policies describe the consent-gated implementation', () => {
    assert.match(privacy, /Zonder die toestemming wordt de Google-tag niet geladen/);
    assert.match(privacy, /bestandsinhoud worden niet naar Google Analytics of Google Ads gestuurd/);
    assert.match(privacy, /Verbeterde conversies en user-provided data zijn uitgeschakeld/);
    assert.match(cookies, /Google Ads-cookies en klik-ID's worden alleen gebruikt als u afzonderlijk ook conversiemeting toestaat/);
    assert.match(cookies, /<strong>_ga<\/strong>/);
    assert.match(cookies, /<strong>_ga_\*<\/strong>/);
    assert.match(cookies, /<strong>_gcl_\*<\/strong>/);
});
