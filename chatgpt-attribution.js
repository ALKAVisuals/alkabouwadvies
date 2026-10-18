(function () {
  'use strict';

  // Aanvulling voor ChatGPT Ads; wijzigt geen Google Ads- of GA4-tags.
  const STORAGE_KEY = 'tbaChatgptAttribution';
  const CONSENT_KEY = 'tbaConsent';
  const CONSENT_VERSION = '2026-10-02';
  const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
  const FORM_NAMES = new Set(['offerteaanvraag', 'contactaanvraag']);
  const SAFE_VALUE = /^[A-Za-z0-9_-]{1,100}$/;
  const FIELDS = {
    source: 'marketing_source',
    medium: 'marketing_medium',
    campaign: 'marketing_campaign',
    content: 'marketing_content'
  };

  function hasAdvertisingConsent() {
    try {
      const consent = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || 'null');
      const age = Date.now() - Date.parse(consent && consent.updatedAt);
      return Boolean(
        consent &&
        consent.version === CONSENT_VERSION &&
        consent.analytics === 'granted' &&
        consent.ads === 'granted' &&
        Number.isFinite(age) &&
        age >= 0 &&
        age <= CONSENT_MAX_AGE_MS
      );
    } catch (error) {
      return false;
    }
  }

  function sanitized(value) {
    return typeof value === 'string' && SAFE_VALUE.test(value) ? value : '';
  }

  function clearAttribution() {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Browseropslag is optioneel; de formulieren blijven bruikbaar.
    }
  }

  function readAttribution() {
    try {
      const raw = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || raw.source !== 'chatgpt') return null;
      return {
        source: 'chatgpt',
        medium: sanitized(raw.medium),
        campaign: sanitized(raw.campaign),
        content: sanitized(raw.content)
      };
    } catch (error) {
      return null;
    }
  }

  function captureAttribution() {
    if (!hasAdvertisingConsent()) {
      clearAttribution();
      return null;
    }
    const params = new URL(window.location.href).searchParams;
    if ((params.get('utm_source') || '').toLowerCase() !== 'chatgpt') return readAttribution();

    const campaign = {
      source: 'chatgpt',
      medium: sanitized(params.get('utm_medium')) || 'paid',
      campaign: sanitized(params.get('utm_campaign')),
      content: sanitized(params.get('utm_content'))
    };
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(campaign));
    } catch (error) {
      // Kan zonder opslag alleen op deze landingspagina worden gebruikt.
    }
    return campaign;
  }

  function addHidden(form, name, value) {
    if (!value) return;
    const existing = form.querySelector('input[name="' + name + '"]');
    if (existing) {
      if (existing.type === 'hidden') existing.value = value;
      return;
    }
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  // Capturing-fase: vult velden voordat bestaande formulierhandlers FormData lezen.
  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!form || form.tagName !== 'FORM' || !FORM_NAMES.has(form.getAttribute('name'))) return;
    const attribution = captureAttribution();
    if (!attribution) return;
    Object.keys(FIELDS).forEach((key) => addHidden(form, FIELDS[key], attribution[key]));
  }, true);

  // De bestaande toestemmingsbanner verwerkt de keuze tijdens bubbling;
  // de documentlistener leest de bijgewerkte toestemming na die verwerking.
  document.addEventListener('click', function (event) {
    const button = event.target && event.target.closest && event.target.closest('[data-consent-choice]');
    if (!button) return;
    const choice = button.getAttribute('data-consent-choice');
    if (choice === 'ads') captureAttribution();
    if (choice === 'denied' || choice === 'analytics') clearAttribution();
  });

  captureAttribution();
}());
