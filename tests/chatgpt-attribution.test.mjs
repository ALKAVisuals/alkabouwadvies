import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const attribution = readFileSync(new URL('../chatgpt-attribution.js', import.meta.url), 'utf8');
const googleTracking = readFileSync(new URL('../privacy-consent.js', import.meta.url), 'utf8');
const netlifyForms = readFileSync(new URL('../netlify-forms.html', import.meta.url), 'utf8');
const builder = readFileSync(new URL('../scripts/build-site.mjs', import.meta.url), 'utf8');

function sandbox({ url = 'https://technischbouwadvies.nl/', analytics = 'granted', ads = 'granted' } = {}) {
  const listeners = new Map();
  const consentStore = new Map();
  const sessionStore = new Map();
  const createStore = (values) => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  });
  const win = {
    location: { href: url },
    localStorage: createStore(consentStore),
    sessionStorage: createStore(sessionStore)
  };
  function setConsent(analyticsChoice, adsChoice) {
    if (!analyticsChoice) return consentStore.delete('tbaConsent');
    consentStore.set('tbaConsent', JSON.stringify({
      analytics: analyticsChoice,
      ads: adsChoice,
      version: '2026-10-02',
      updatedAt: new Date().toISOString()
    }));
  }
  setConsent(analytics, ads);
  const document = {
    addEventListener: (name, handler) => {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(handler);
    },
    createElement: (tag) => ({ tagName: tag.toUpperCase() })
  };
  vm.runInNewContext(attribution, { window: win, document, URL, Date, JSON, Set, Object }, { filename: 'chatgpt-attribution.js' });
  function submit(formName = 'offerteaanvraag') {
    const fields = new Map();
    const form = {
      tagName: 'FORM',
      getAttribute: (key) => key === 'name' ? formName : null,
      querySelector: (selector) => {
        const name = /^input\[name="([^"]+)"\]$/.exec(selector)?.[1];
        return name ? fields.get(name) || null : null;
      },
      appendChild: (input) => fields.set(input.name, input)
    };
    (listeners.get('submit') || []).forEach((handler) => handler({ target: form }));
    return Object.fromEntries([...fields.entries()].map(([key, field]) => [key, field.value]));
  }
  function choose(choice) {
    setConsent(choice === 'denied' ? 'denied' : 'granted', choice === 'ads' ? 'granted' : 'denied');
    (listeners.get('click') || []).forEach((handler) => handler({
      target: { closest: () => ({ getAttribute: () => choice }) }
    }));
  }
  return { submit, choose, win, sessionStore, setConsent };
}

test('only ChatGPT visits with conversion consent receive Netlify attribution fields', () => {
  const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=chatgpt&utm_medium=paid&utm_campaign=bouwtekeningen&utm_content=aanbouw' });
  assert.deepEqual(s.submit(), {
    marketing_source: 'chatgpt',
    marketing_medium: 'paid',
    marketing_campaign: 'bouwtekeningen',
    marketing_content: 'aanbouw'
  });
});

test('Google campaign traffic is untouched', () => {
  const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=google&utm_medium=cpc&gclid=abcdefghi12345' });
  assert.deepEqual(s.submit(), {});
  assert.equal(s.sessionStore.size, 0);
  assert.match(googleTracking, /MEASUREMENT_ID = 'G-3LX2KFD76S'/);
  assert.match(googleTracking, /window\.gtag\('event', 'generate_lead', \{ form_type: formType \}\)/);
});

test('later Google or another explicit campaign takes over a ChatGPT session', () => {
  const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=chatgpt&utm_campaign=bouwtekeningen' });
  assert.equal(s.submit().marketing_source, 'chatgpt');

  // Een latere Google Ads-klik moet alle oude ChatGPT-toeschrijving verwijderen.
  s.win.location.href = 'https://technischbouwadvies.nl/contact.html?gclid=abcdefghijk';
  assert.deepEqual(s.submit(), {});
  assert.equal(s.sessionStore.size, 0);

  // Ook een expliciete campagne van een andere herkomst wint.
  s.win.location.href = 'https://technischbouwadvies.nl/?utm_source=chatgpt&utm_campaign=vergunningbegeleiding';
  assert.equal(s.submit().marketing_source, 'chatgpt');
  s.win.location.href = 'https://technischbouwadvies.nl/contact.html?utm_source=google&utm_medium=cpc';
  assert.deepEqual(s.submit(), {});
  assert.equal(s.sessionStore.size, 0);
});

test('denied and analytics-only consent prevent ChatGPT attribution', () => {
  for (const ads of ['denied']) {
    const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=chatgpt&utm_campaign=bouwtekeningen', ads });
    assert.deepEqual(s.submit('contactaanvraag'), {});
    assert.equal(s.sessionStore.size, 0);
  }
});

test('accepting marketing consent on the landing page captures campaign context', () => {
  const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=chatgpt&utm_campaign=vergunningen', analytics: 'denied', ads: 'denied' });
  assert.deepEqual(s.submit(), {});
  s.choose('ads');
  assert.equal(s.submit().marketing_campaign, 'vergunningen');
  s.choose('analytics');
  assert.deepEqual(s.submit(), {});
  assert.equal(s.sessionStore.size, 0);
});

test('ChatGPT session survives internal navigation, without storing personal query values', () => {
  const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=chatgpt&utm_campaign=bouwtekeningen&utm_content=een%40email.nl' });
  s.win.location.href = 'https://technischbouwadvies.nl/aanbouw-uitbouw.html';
  const fields = s.submit('contactaanvraag');
  assert.equal(fields.marketing_campaign, 'bouwtekeningen');
  assert.equal(fields.marketing_content, undefined);
});

test('unknown forms do not receive additional fields', () => {
  const s = sandbox({ url: 'https://technischbouwadvies.nl/?utm_source=chatgpt' });
  assert.deepEqual(s.submit('ander-formulier'), {});
});

test('central Netlify form definitions and build include isolated script', () => {
  for (const field of ['marketing_source', 'marketing_medium', 'marketing_campaign', 'marketing_content']) {
    assert.equal((netlifyForms.match(new RegExp('name="' + field + '"', 'g')) || []).length, 2);
  }
  assert.match(builder, /'chatgpt-attribution\.js'/);
  assert.doesNotMatch(attribution, /\bgtag\s*\(|\bfetch\s*\(/);
});
