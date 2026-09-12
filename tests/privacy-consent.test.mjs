import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const consent = fs.readFileSync(new URL('../privacy-consent.js', import.meta.url), 'utf8');
const header = fs.readFileSync(new URL('../site-header.js', import.meta.url), 'utf8');
const contact = fs.readFileSync(new URL('../contact.html', import.meta.url), 'utf8');
const homepage = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const permitPage = fs.readFileSync(new URL('../omgevingsvergunning-aanvragen.html', import.meta.url), 'utf8');
const sharedContact = fs.readFileSync(new URL('../contact-section.js', import.meta.url), 'utf8');
const privacy = fs.readFileSync(new URL('../privacybeleid.html', import.meta.url), 'utf8');
const cookies = fs.readFileSync(new URL('../cookiebeleid.html', import.meta.url), 'utf8');

function createClassList() {
    return { toggle() {} };
}

function createField(value) {
    return {
        value,
        classList: createClassList(),
        focus() {},
        getAttribute() { return null; },
        matches() { return true; },
        setAttribute() {}
    };
}

async function submitUnifiedContact({ consentChoice, responseOk = true, valid = true }) {
    const consentStore = new Map();
    if (consentChoice) {
        consentStore.set('tbaConsent', JSON.stringify({
            analytics: 'granted',
            ads: consentChoice === 'ads' ? 'granted' : 'denied',
            version: '2026-08-28',
            updatedAt: new Date().toISOString()
        }));
    }

    const fields = {
        name: createField(valid ? 'Testpersoon Privacycontrole' : ''),
        email: createField(valid ? 'privacycontrole@example.com' : 'ongeldig'),
        subject: createField(valid ? 'dakkapel' : ''),
        gemeente: createField(valid ? 'Testgemeente' : ''),
        message: createField(valid ? 'Unieke testinhoud die niet naar analytics mag.' : '')
    };
    const submitButton = { textContent: 'Verstuur aanvraag', disabled: false };
    const status = { textContent: '', classList: createClassList() };
    const handlers = new Map();
    let fetchCalls = 0;

    const form = {
        addEventListener(type, handler) { handlers.set(type, handler); },
        getAttribute(name) { return name === 'name' ? 'contactaanvraag' : null; },
        querySelector(selector) {
            const fieldName = selector.match(/^\[name="(.+)"\]$/)?.[1];
            if (fieldName) return fields[fieldName];
            if (selector === '[type="submit"]') return submitButton;
            if (selector === '.contact-status') return status;
            return null;
        },
        reset() {}
    };

    let exposeForm = false;
    const document = {
        body: { appendChild() {} },
        cookie: '',
        head: { appendChild() {} },
        readyState: 'loading',
        addEventListener() {},
        createElement() {
            return {
                dataset: {},
                classList: createClassList(),
                addEventListener() {},
                appendChild() {},
                setAttribute() {}
            };
        },
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll(selector) {
            return exposeForm && selector === 'form[data-unified-contact="true"]' ? [form] : [];
        }
    };
    const dataLayer = [];
    const window = {
        dataLayer,
        location: {
            hostname: 'technischbouwadvies.nl',
            href: 'https://technischbouwadvies.nl/?gclid=abcdefghijk',
            origin: 'https://technischbouwadvies.nl',
            pathname: '/',
            reload() {}
        },
        setTimeout(callback) { callback(); }
    };
    const context = vm.createContext({
        Date,
        FormData: class FormData {},
        JSON,
        Set,
        URL,
        URLSearchParams: class URLSearchParams {
            toString() { return 'form-name=contactaanvraag'; }
        },
        document,
        encodeURIComponent,
        fetch: async () => {
            fetchCalls += 1;
            return { ok: responseOk };
        },
        localStorage: {
            getItem(key) { return consentStore.get(key) ?? null; },
            removeItem(key) { consentStore.delete(key); },
            setItem(key, value) { consentStore.set(key, value); }
        },
        window
    });

    vm.runInContext(consent, context, { filename: 'privacy-consent.js' });
    exposeForm = true;
    vm.runInContext(sharedContact, context, { filename: 'contact-section.js' });

    await handlers.get('submit')({
        preventDefault() {},
        stopImmediatePropagation() {}
    });

    const leadEvents = dataLayer
        .map((entry) => Array.from(entry))
        .filter((entry) => entry[0] === 'event' && entry[1] === 'generate_lead');

    return { fetchCalls, leadEvents };
}

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
    assert.match(consent, /return mayLoadAnalytics\(consent\) && consent\?\.ads === 'granted'/);
    assert.match(consent, /!mayTrackLead\(readConsent\(\)\)/);
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

test('a successful form POST produces exactly one privacy-safe lead only with analytics and ads consent', async (t) => {
    await t.test('no consent submits successfully without generate_lead', async () => {
        const result = await submitUnifiedContact({ consentChoice: null });
        assert.equal(result.fetchCalls, 1);
        assert.equal(result.leadEvents.length, 0);
    });

    await t.test('analytics-only consent submits successfully without generate_lead', async () => {
        const result = await submitUnifiedContact({ consentChoice: 'analytics' });
        assert.equal(result.fetchCalls, 1);
        assert.equal(result.leadEvents.length, 0);
    });

    await t.test('analytics and ads consent submits successfully with exactly one generate_lead', async () => {
        const result = await submitUnifiedContact({ consentChoice: 'ads' });
        assert.equal(result.fetchCalls, 1);
        assert.equal(result.leadEvents.length, 1);
        assert.equal(JSON.stringify(result.leadEvents[0][2]), JSON.stringify({ form_type: 'contactaanvraag' }));
        assert.doesNotMatch(JSON.stringify(result.leadEvents), /Testpersoon|privacycontrole@example\.com|Testgemeente|Unieke testinhoud/);
    });

    await t.test('a failed POST does not produce generate_lead', async () => {
        const result = await submitUnifiedContact({ consentChoice: 'ads', responseOk: false });
        assert.equal(result.fetchCalls, 1);
        assert.equal(result.leadEvents.length, 0);
    });

    await t.test('an invalid submission neither posts nor produces generate_lead', async () => {
        const result = await submitUnifiedContact({ consentChoice: 'ads', valid: false });
        assert.equal(result.fetchCalls, 0);
        assert.equal(result.leadEvents.length, 0);
    });
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
    assert.match(privacy, /Wanneer wij een contact- of offerteaanvraag intern beoordelen en opvolgen/);
    assert.match(privacy, /Dashboardkopie van een contact- of offerteaanvraag/);
    assert.match(cookies, /Google Ads-cookies en klik-ID's worden alleen gebruikt als u afzonderlijk ook conversiemeting toestaat/);
    assert.match(cookies, /<strong>_ga<\/strong>/);
    assert.match(cookies, /<strong>_ga_\*<\/strong>/);
    assert.match(cookies, /<strong>_gcl_\*<\/strong>/);
});
