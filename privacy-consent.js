(function () {
    'use strict';

    const CONSENT_KEY = 'tbaConsent';
    const CONSENT_VERSION = '2026-08-13';
    const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
    const MEASUREMENT_ID = 'G-3LX2KFD76S';
    const PRODUCTION_HOSTS = new Set(['technischbouwadvies.nl', 'www.technischbouwadvies.nl']);
    const ALLOWED_FORMS = new Set(['contact', 'offerteaanvraag']);
    let analyticsLoaded = false;

    function readConsent() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
            if (!parsed || parsed.version !== CONSENT_VERSION) return null;
            if (parsed.analytics !== 'granted' && parsed.analytics !== 'denied') return null;
            if (!parsed.updatedAt || Date.now() - Date.parse(parsed.updatedAt) > CONSENT_MAX_AGE_MS) return null;
            return parsed;
        } catch (error) {
            return null;
        }
    }

    function writeConsent(analytics) {
        const consent = {
            analytics,
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

    function purgeQueryFromAddressBar() {
        if (!window.location.search || typeof window.history?.replaceState !== 'function') return;
        try {
            window.history.replaceState(window.history.state, document.title, `${cleanPath()}${window.location.hash}`);
        } catch (error) {
            // De pagina blijft functioneren als de browser de adresbalk niet laat aanpassen.
        }
    }

    function mayLoadAnalytics(consent) {
        return consent?.analytics === 'granted' && PRODUCTION_HOSTS.has(window.location.hostname);
    }

    function loadAnalytics(consent) {
        if (!mayLoadAnalytics(consent)) return;
        if (analyticsLoaded) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
            });
            return;
        }
        // Formulier- en pakketkeuzes kunnen tijdens het laden nog uit de querystring
        // worden gelezen. Verwijder die pas vlak voordat Analytics wordt gestart.
        purgeQueryFromAddressBar();

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        window.gtag('js', new Date());
        analyticsLoaded = true;
        window.gtag('config', MEASUREMENT_ID, {
            page_location: `${window.location.origin}${cleanPath()}`,
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

    function revokeAnalytics() {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
            });
        }
        document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            if (!/^_ga(?:_|$)/.test(name)) return;
            document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
            document.cookie = `${name}=; Max-Age=0; path=/; domain=.technischbouwadvies.nl; SameSite=Lax`;
        });
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
                    <strong id="tba-consent-title">Uw keuze voor websiteanalyse</strong>
                    <p>Functionele opslag is nodig om uw keuze te onthouden. Met uw toestemming gebruiken we Google Analytics om geaggregeerd websitegebruik en geslaagde aanvragen te meten. We gebruiken geen advertentiemeting. <a href="${policyHref()}">Lees het cookiebeleid</a>.</p>
                </div>
                <div class="tba-consent__actions">
                    <button class="tba-consent__button tba-consent__button--reject" type="button" data-consent-choice="denied">Weigeren</button>
                    <button class="tba-consent__button tba-consent__button--accept" type="button" data-consent-choice="granted">Accepteren</button>
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
        if (existing) loadAnalytics(existing);
        else banner.hidden = false;

        banner.addEventListener('click', (event) => {
            const choice = event.target.closest('[data-consent-choice]')?.dataset.consentChoice;
            if (choice !== 'granted' && choice !== 'denied') return;
            const consent = writeConsent(choice);
            banner.hidden = true;
            if (choice === 'granted') loadAnalytics(consent);
            else revokeAnalytics();
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
