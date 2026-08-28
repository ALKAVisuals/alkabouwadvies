(function () {
    'use strict';

    const CONSENT_KEY = 'tbaConsent';
    const CONSENT_VERSION = '2026-08-28';
    const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
    const MEASUREMENT_ID = 'G-3LX2KFD76S';
    const PRODUCTION_HOSTS = new Set(['technischbouwadvies.nl', 'www.technischbouwadvies.nl']);
    const ALLOWED_FORMS = new Set(['contact', 'contactaanvraag', 'offerteaanvraag']);
    const ALLOWED_CLICK_IDS = new Set(['gclid', 'gbraid', 'wbraid']);
    const CLICK_ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;
    let measurementLoaded = false;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500
    });

    function readConsent() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
            if (!parsed || parsed.version !== CONSENT_VERSION) return null;
            if (parsed.analytics !== 'granted' && parsed.analytics !== 'denied') return null;
            if (parsed.ads !== 'granted' && parsed.ads !== 'denied') return null;
            if (!parsed.updatedAt || Date.now() - Date.parse(parsed.updatedAt) > CONSENT_MAX_AGE_MS) return null;
            return parsed;
        } catch (error) {
            return null;
        }
    }

    function writeConsent(choice) {
        const consent = {
            analytics: choice === 'denied' ? 'denied' : 'granted',
            ads: choice === 'ads' ? 'granted' : 'denied',
            version: CONSENT_VERSION,
            updatedAt: new Date().toISOString()
        };
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
            localStorage.removeItem('cookieConsent');
        } catch (error) {
            // De keuze blijft voor deze pagina actief wanneer browseropslag niet beschikbaar is.
        }
        return consent;
    }

    function cleanPath() {
        return window.location.pathname || '/';
    }

    function measurementPageLocation() {
        const measuredUrl = new URL(`${window.location.origin}${cleanPath()}`);
        const currentUrl = new URL(window.location.href);
        ALLOWED_CLICK_IDS.forEach((parameter) => {
            const value = currentUrl.searchParams.get(parameter);
            if (value && CLICK_ID_PATTERN.test(value)) measuredUrl.searchParams.set(parameter, value);
        });
        return measuredUrl.toString();
    }

    function mayLoadAnalytics(consent) {
        return consent?.analytics === 'granted' && PRODUCTION_HOSTS.has(window.location.hostname);
    }

    function loadMeasurement(consent) {
        if (!mayLoadAnalytics(consent)) return;
        const adsConsent = consent.ads === 'granted' ? 'granted' : 'denied';
        if (measurementLoaded) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: adsConsent,
                ad_user_data: adsConsent,
                ad_personalization: 'denied'
            });
            return;
        }
        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: adsConsent,
            ad_user_data: adsConsent,
            ad_personalization: 'denied'
        });
        window.gtag('js', new Date());
        measurementLoaded = true;
        window.gtag('config', MEASUREMENT_ID, {
            page_location: measurementPageLocation(),
            page_path: cleanPath(),
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            send_page_view: true
        });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
        script.dataset.tbaAnalytics = 'true';
        document.head.appendChild(script);
    }

    function removeGoogleCookies(includeAnalytics) {
        const cookiePattern = includeAnalytics
            ? /^(?:_ga(?:_|$)|_gcl_(?:au|aw|dc)$)/
            : /^_gcl_(?:au|aw|dc)$/;
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            if (!cookiePattern.test(name)) return;
            document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
            document.cookie = `${name}=; Max-Age=0; path=/; domain=.technischbouwadvies.nl; SameSite=Lax`;
        });
    }

    function revokeMeasurement() {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
            });
        }
        removeGoogleCookies(true);
        window.setTimeout(() => window.location.reload(), 0);
    }

    function policyHref() {
        return window.location.pathname.includes('/blog/') ? '../cookiebeleid.html' : 'cookiebeleid.html';
    }

    function createBanner() {
        document.querySelectorAll('#cookie-consent, .cookie-consent').forEach((oldBanner) => oldBanner.remove());
        const banner = document.createElement('section');
        banner.className = 'tba-consent';
        banner.id = 'tba-consent';
        banner.hidden = true;
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'false');
        banner.setAttribute('aria-labelledby', 'tba-consent-title');
        banner.innerHTML = `
            <div class="tba-consent__inner">
                <div class="tba-consent__copy">
                    <strong id="tba-consent-title">Uw keuze voor analyse en conversiemeting</strong>
                    <p>Functionele opslag is nodig om uw keuze te onthouden. Kies alleen websiteanalyse of ook Google Ads-conversiemeting. Formulierinhoud wordt niet met Google gedeeld en advertentiepersonalisatie blijft uit. <a href="${policyHref()}">Lees het cookiebeleid</a>.</p>
                </div>
                <div class="tba-consent__actions">
                    <button class="tba-consent__button tba-consent__button--reject" type="button" data-consent-choice="denied">Weigeren</button>
                    <button class="tba-consent__button tba-consent__button--reject" type="button" data-consent-choice="analytics">Alleen analyse</button>
                    <button class="tba-consent__button tba-consent__button--accept" type="button" data-consent-choice="ads">Analyse + conversiemeting</button>
                </div>
            </div>`;
        document.body.appendChild(banner);
        return banner;
    }

    function ensureSettingsLinks() {
        document.querySelectorAll('.footer-legal').forEach((footer) => {
            if (footer.querySelector('[data-cookie-settings]')) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'tba-cookie-settings';
            button.dataset.cookieSettings = '';
            button.textContent = 'Cookie-instellingen';
            footer.appendChild(button);
        });
    }

    function ensureAsset(type, href) {
        const selector = type === 'style'
            ? `link[rel="stylesheet"][href$="${href}"]`
            : `script[src$="${href}"]`;
        if (document.querySelector(selector)) return;
        const asset = document.createElement(type === 'style' ? 'link' : 'script');
        if (type === 'style') {
            asset.rel = 'stylesheet';
            asset.href = href;
            document.head.appendChild(asset);
            return;
        }
        asset.src = href;
        asset.defer = true;
        document.body.appendChild(asset);
    }

    function initialiseConsent() {
        ensureSettingsLinks();

        const banner = createBanner();
        const existing = readConsent();
        if (existing) loadMeasurement(existing);
        else banner.hidden = false;

        banner.addEventListener('click', (event) => {
            const choice = event.target.closest('[data-consent-choice]')?.dataset.consentChoice;
            if (!['denied', 'analytics', 'ads'].includes(choice)) return;
            const consent = writeConsent(choice);
            banner.hidden = true;
            if (choice === 'denied') revokeMeasurement();
            else {
                loadMeasurement(consent);
                if (choice === 'analytics') removeGoogleCookies(false);
            }
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('[data-cookie-settings]')) return;
            banner.hidden = false;
            banner.querySelector('[data-consent-choice="denied"]')?.focus();
        });
    }

    window.tbaTrackLead = function (formType) {
        if (!ALLOWED_FORMS.has(formType) || !mayLoadAnalytics(readConsent()) || typeof window.gtag !== 'function') return false;
        window.gtag('event', 'generate_lead', { form_type: formType });
        return true;
    };

    ensureAsset('style', window.location.pathname.includes('/blog/') ? '../privacy-consent.css' : 'privacy-consent.css');

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseConsent);
    else initialiseConsent();
}());
