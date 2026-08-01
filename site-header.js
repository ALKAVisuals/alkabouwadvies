(function () {
    'use strict';

    const header = document.querySelector('[data-tba-header]');
    if (!header) return;

    const nav = header.querySelector('#tba-site-nav');
    const menuToggle = header.querySelector('#tba-menu-toggle');
    const mobilePanel = header.querySelector('#tba-mobile-panel');
    const menuClose = header.querySelector('#tba-menu-close');
    const menuBackdrop = header.querySelector('.tba-menu-backdrop');
    const servicesItem = header.querySelector('.tba-services-item');
    const servicesTrigger = header.querySelector('#tba-services-trigger');
    const skipLink = header.querySelector('.tba-skip-link');
    const mobileBreakpoint = window.matchMedia('(max-width: 1120px)');
    const servicePages = new Set([
        'aanbouw-uitbouw.html',
        'bed-breakfast.html',
        'bijgebouw.html',
        'bouwkundig-advies.html',
        'bouwtekening-digitaliseren.html',
        '3d-visualisaties-vloerplannen.html',
        'carport-vergunning.html',
        'dakkapel.html',
        'dakopbouw-vergunningen.html',
        'erker.html',
        'kozijnen-vervangen-vergunning.html',
        'mantelzorg.html',
        'nokverhoging.html',
        'omgevingsvergunning-aanvragen.html'
    ]);
    const cityPages = new Set([
        'amsterdam.html',
        'apeldoorn.html',
        'arnhem.html',
        'breda.html',
        'den-haag.html',
        'democity.html',
        'demo-city-reference.html',
        'eindhoven.html',
        'groningen.html',
        'nijmegen.html',
        'rotterdam.html',
        'tilburg.html',
        'utrecht.html'
    ]);
    const desktopServiceGroups = [
        {
            label: 'Bouwtekeningen',
            description: 'Ontwerp en tekenwerk voor verbouwing en uitbreiding.',
            services: [
                ['dakkapel.html', 'Dakkapel', 'Meer licht en ruimte op zolder'],
                ['aanbouw-uitbouw.html', 'Aanbouw & uitbouw', 'Vergroot uw woonoppervlak zorgvuldig'],
                ['dakopbouw-vergunningen.html', 'Dakopbouw', 'Een complete extra verdieping'],
                ['bijgebouw.html', 'Bijgebouw', 'Schuur, garage of tuinkamer'],
                ['nokverhoging.html', 'Nokverhoging', 'Maximale hoogte en bruikbare ruimte'],
                ['erker.html', 'Erker', 'Karakter en daglicht aan de gevel'],
                ['mantelzorg.html', 'Mantelzorgwoning', 'Zorgvuldig wonen dichtbij huis'],
                ['bed-breakfast.html', 'Bed & Breakfast', 'Professioneel ontwerp voor verblijf']
            ]
        },
        {
            label: 'Vergunningen',
            description: 'Van vergunningcheck tot complete aanvraag bij de gemeente.',
            services: [
                ['omgevingsvergunning-aanvragen.html', 'Omgevingsvergunning', 'Aanvraag en gemeentecontact binnen afgesproken scope'],
                ['kozijnen-vervangen-vergunning.html', 'Kozijnen vervangen', 'Duidelijkheid over regels en aanvraag'],
                ['carport-vergunning.html', 'Carport', 'Snel weten wat er op uw perceel kan']
            ]
        },
        {
            label: 'Advies, 3D & digitaliseren',
            description: 'Technische zekerheid en een begrijpelijk beeld van uw plan.',
            services: [
                ['bouwkundig-advies.html', 'Bouwkundig advies', 'Praktisch advies van ervaren vakmensen'],
                ['3d-visualisaties-vloerplannen.html', '3D-visualisaties & vloerplannen', 'Bekijk uitstraling en indeling vooraf'],
                ['bouwtekening-digitaliseren.html', 'Tekeningen digitaliseren', 'Van papieren archief naar bruikbaar bestand']
            ]
        }
    ];

    let menuReturnFocus = null;
    let desktopCategoryButtons = [];
    let previousScrollY = Math.max(window.scrollY, 0);
    let scrollTicking = false;
    const hideThreshold = 140;
    const directionThreshold = 8;

    function currentFilename() {
        const pathname = window.location.pathname.replace(/\/+$/, '');
        return pathname.split('/').pop() || 'index.html';
    }

    function prepareDesktopServicesMenu() {
        const dropdownInner = header.querySelector('.tba-dropdown-inner');
        if (!dropdownInner) return;

        const filename = currentFilename();
        const activeGroupIndex = Math.max(0, desktopServiceGroups.findIndex((group) =>
            group.services.some(([href]) => href === filename)
        ));

        const categories = document.createElement('div');
        categories.className = 'tba-service-categories';
        categories.setAttribute('role', 'tablist');
        categories.setAttribute('aria-label', 'Dienstcategorieën');

        const panels = document.createElement('div');
        panels.className = 'tba-service-panels';

        desktopServiceGroups.forEach((group, index) => {
            const tabId = `tba-service-tab-${index}`;
            const panelId = `tba-service-panel-${index}`;
            const category = document.createElement('button');
            category.className = 'tba-service-category';
            category.type = 'button';
            category.id = tabId;
            category.setAttribute('role', 'tab');
            category.setAttribute('aria-controls', panelId);
            category.innerHTML = `
                <span>
                    <strong>${group.label}</strong>
                    <small>${group.services.length} ${group.services.length === 1 ? 'dienst' : 'diensten'}</small>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            `;
            categories.appendChild(category);

            const panel = document.createElement('section');
            panel.className = 'tba-service-panel';
            panel.id = panelId;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', tabId);
            panel.innerHTML = `
                <div class="tba-service-panel-head">
                    <span class="tba-dropdown-label">${group.label}</span>
                    <p>${group.description}</p>
                </div>
                <div class="tba-service-panel-links">
                    ${group.services.map(([href, title, description]) => `
                        <a href="${href}" class="tba-service-option">
                            <strong>${title}</strong>
                            <span>${description}</span>
                        </a>
                    `).join('')}
                </div>
            `;
            panels.appendChild(panel);
        });

        dropdownInner.replaceChildren(categories, panels);
        desktopCategoryButtons = Array.from(categories.querySelectorAll('.tba-service-category'));
        const servicePanels = Array.from(panels.querySelectorAll('.tba-service-panel'));

        const activateCategory = (index, options) => {
            const settings = Object.assign({ focus: false }, options);
            desktopCategoryButtons.forEach((button, buttonIndex) => {
                const isActive = buttonIndex === index;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-selected', String(isActive));
                button.tabIndex = isActive ? 0 : -1;
            });
            servicePanels.forEach((panel, panelIndex) => {
                const isActive = panelIndex === index;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
            if (settings.focus) desktopCategoryButtons[index]?.focus();
        };

        desktopCategoryButtons.forEach((button, index) => {
            button.addEventListener('mouseenter', () => activateCategory(index));
            button.addEventListener('focus', () => activateCategory(index));
            button.addEventListener('click', () => activateCategory(index));
            button.addEventListener('keydown', (event) => {
                let nextIndex = null;
                if (event.key === 'ArrowDown') nextIndex = (index + 1) % desktopCategoryButtons.length;
                if (event.key === 'ArrowUp') nextIndex = (index - 1 + desktopCategoryButtons.length) % desktopCategoryButtons.length;
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = desktopCategoryButtons.length - 1;
                if (nextIndex === null) return;
                event.preventDefault();
                activateCategory(nextIndex, { focus: true });
            });
        });

        activateCategory(activeGroupIndex);
    }

    function prepareMobileServicesMenu() {
        const list = header.querySelector('.tba-mobile-service-list');
        if (!list) return;

        const links = document.createDocumentFragment();
        desktopServiceGroups.forEach((group) => {
            group.services.forEach(([href, title]) => {
                const link = document.createElement('a');
                link.href = href;
                link.textContent = title;
                links.appendChild(link);
            });
        });
        list.replaceChildren(links);
    }

    function addVisualisationUpsell() {
        const supportedPages = new Set([
            'aanbouw-uitbouw.html',
            'bed-breakfast.html',
            'bijgebouw.html',
            'dakkapel.html',
            'dakopbouw-vergunningen.html',
            'erker.html',
            'mantelzorg.html',
            'nokverhoging.html'
        ]);
        if (!supportedPages.has(currentFilename())) return;

        const contact = document.getElementById('contact');
        if (!contact || document.querySelector('.tba-visualisation-upsell')) return;

        const section = document.createElement('section');
        section.className = 'tba-visualisation-upsell';
        section.setAttribute('aria-label', 'Bekijk uw bouwplan vooraf in 3D');
        section.innerHTML = `
            <div class="tba-visualisation-upsell-inner">
                <div class="tba-visualisation-upsell-copy">
                    <span class="tba-visualisation-upsell-label">Aanvullende 3D-dienst</span>
                    <h2>Zie vooraf hoe uw plan eruit kan zien.</h2>
                    <p>Voeg een realistische 3D-visualisatie of een ingericht 3D-vloerplan toe. Zo worden uitstraling, indeling en ruimtelijke keuzes begrijpelijk naast de technische tekening.</p>
                    <a href="3d-visualisaties-vloerplannen.html">Bekijk de 3D-mogelijkheden <span aria-hidden="true">→</span></a>
                </div>
                <div class="tba-visualisation-upsell-images">
                    <img src="images/website-2026/3d-visualisatie-aanbouw-schets-naar-realisatie.webp" alt="3D-visualisatie van een woningaanbouw" loading="lazy" decoding="async">
                    <img src="images/website-2026/3d-vloerplan-woning-met-aanbouw.webp" alt="3D-vloerplan van een woning met aanbouw" loading="lazy" decoding="async">
                </div>
            </div>
        `;
        contact.before(section);
    }

    function routePrimaryContactLinks() {
        const filename = currentFilename();
        if (filename === 'contact.html' || cityPages.has(filename)) return;

        const contactHref = window.location.pathname.includes('/blog/') ? '../contact.html' : 'contact.html';
        header.querySelectorAll('.tba-nav-cta, .tba-mobile-cta').forEach((link) => {
            link.href = contactHref;
        });
        header.querySelectorAll('.tba-mobile-secondary a').forEach((link) => {
            if (link.textContent.trim().toLowerCase() === 'contact') link.href = contactHref;
        });
    }

    function routeSectionLinks() {
        const filename = currentFilename();
        if (filename === 'index.html' || cityPages.has(filename)) return;

        const homeHref = window.location.pathname.includes('/blog/') ? '../index.html' : 'index.html';
        header.querySelectorAll('a[href^="#"]').forEach((link) => {
            if (link === skipLink) return;

            const hash = link.getAttribute('href');
            if (!hash || hash === '#' || document.querySelector(hash)) return;

            if (hash === '#prijzen' || hash === '#investering') {
                const pricingSection = document.querySelector('#prijzen, #pakketten, section.pricing');
                if (pricingSection) {
                    if (!pricingSection.id) pricingSection.id = 'prijzen';
                    link.href = `#${pricingSection.id}`;
                    return;
                }
            }

            link.href = `${homeHref}${hash}`;
        });
    }

    function formatEuro(amount) {
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function parseEuroAmount(value) {
        const match = value.match(/€\s*([\d.]+(?:,\d{1,2})?)/);
        if (!match) return null;
        const parsed = Number(match[1].replace(/\./g, '').replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : null;
    }

    function normalisePricePresentation() {
        if (!servicePages.has(currentFilename())) return;

        document.querySelectorAll('.price-card .price-value').forEach((price) => {
            if (price.dataset.tbaVatNormalised === 'true') return;
            if (price.closest('.price-card')?.querySelector('.price-vat')) {
                price.dataset.tbaVatNormalised = 'true';
                return;
            }
            const excludingVat = parseEuroAmount(price.textContent);
            if (excludingVat === null) return;

            const includingVat = Math.round(excludingVat * 121) / 100;
            price.innerHTML = `${formatEuro(excludingVat)}<span>/ eenmalig excl. btw</span><small class="tba-price-in-vat">${formatEuro(includingVat)} incl. 21% btw</small>`;
            price.dataset.tbaVatNormalised = 'true';
        });

        document.querySelectorAll('.hero-right-badge').forEach((badge) => {
            const label = badge.querySelector('span');
            const amount = badge.querySelector('strong');
            if (!label || !amount || !/excl\.?\s*btw/i.test(label.textContent)) return;
            const excludingVat = parseEuroAmount(amount.textContent);
            if (excludingVat === null) return;

            amount.textContent = formatEuro(excludingVat);
            label.textContent = 'Vanaf — excl. btw';
            const includingLabel = document.createElement('small');
            includingLabel.className = 'tba-hero-price-in-vat';
            includingLabel.textContent = `${formatEuro(Math.round(excludingVat * 121) / 100)} incl. 21% btw`;
            badge.appendChild(includingLabel);
        });

        const pricingSection = Array.from(document.querySelectorAll('section.pricing')).find((section) => section.querySelector('.price-card'));
        const firstPriceCard = pricingSection?.querySelector('.price-card');
        const priceGrid = firstPriceCard?.parentElement;
        if (!pricingSection || !priceGrid || pricingSection.querySelector('.tba-price-scope')) return;

        const scope = document.createElement('aside');
        scope.className = 'tba-price-scope';
        scope.setAttribute('aria-label', 'Uitleg over prijzen en opdrachtscope');
        scope.innerHTML = `
            <strong>De getoonde bedragen zijn projectgebonden vanafprijzen.</strong>
            <p>Uw offerte legt de exacte tekeningen en bestanden, eventuele inmeting, indiening, correctierondes en planning vast. Gemeentelijke leges, archiefkosten, uitvoering en externe specialisten zijn alleen inbegrepen wanneer dat uitdrukkelijk in de offerte staat.</p>
            <a href="contact.html">Vraag een projectspecifieke offerte aan <span aria-hidden="true">→</span></a>
        `;
        priceGrid.before(scope);
    }

    function setCurrentNavigation() {
        const filename = currentFilename();
        const isBlog = filename === 'blog.html' || window.location.pathname.includes('/blog/');

        header.querySelectorAll('a[href]').forEach((link) => {
            const linkUrl = new URL(link.href, window.location.href);
            const linkFilename = linkUrl.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
            if (linkFilename === filename && !linkUrl.hash) {
                link.setAttribute('aria-current', 'page');
            }
        });

        if (servicePages.has(filename)) {
            servicesTrigger?.classList.add('is-current');
            servicesTrigger?.setAttribute('aria-current', 'page');
        }

        if (isBlog) {
            header.querySelectorAll('[data-tba-page="blog"]').forEach((link) => {
                link.classList.add('is-current');
                link.setAttribute('aria-current', 'page');
            });
        }

        if (filename === 'testimonials.html') {
            header.querySelectorAll('[data-tba-page="reviews"]').forEach((link) => {
                link.classList.add('is-current');
                link.setAttribute('aria-current', 'page');
            });
        }
    }

    function prepareSkipLink() {
        if (!skipLink) return;
        const target = document.querySelector('#main-content, main, article, .error');
        if (!target) {
            skipLink.hidden = true;
            return;
        }
        if (!target.id) target.id = 'tba-page-content';
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        skipLink.href = `#${target.id}`;
        skipLink.addEventListener('click', () => {
            window.setTimeout(() => target.focus({ preventScroll: true }), 0);
        });
    }

    function observeHomepageSections() {
        if (currentFilename() !== 'index.html' || !('IntersectionObserver' in window)) return;

        const linksBySection = new Map();
        header.querySelectorAll('.tba-nav-link[href*="#"], .tba-mobile-link[href*="#"]').forEach((link) => {
            const url = new URL(link.href, window.location.href);
            if (!url.hash) return;
            const target = document.querySelector(url.hash);
            if (!target) return;
            const sectionId = url.hash.slice(1);
            if (!linksBySection.has(sectionId)) linksBySection.set(sectionId, []);
            linksBySection.get(sectionId).push(link);
        });

        const setActiveSection = (sectionId) => {
            linksBySection.forEach((links, id) => {
                links.forEach((link) => link.classList.toggle('is-current', id === sectionId));
            });
        };

        const observer = new IntersectionObserver((entries) => {
            const visibleEntry = entries.find((entry) => entry.isIntersecting);
            if (visibleEntry) setActiveSection(visibleEntry.target.id);
        }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });

        linksBySection.forEach((links, sectionId) => {
            const section = document.getElementById(sectionId);
            if (section) observer.observe(section);
        });
    }

    function setServicesOpen(isOpen, returnFocus) {
        if (!servicesItem || !servicesTrigger) return;
        servicesItem.classList.toggle('is-open', isOpen);
        servicesTrigger.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen && returnFocus) servicesTrigger.focus();
    }

    servicesTrigger?.addEventListener('click', (event) => {
        event.preventDefault();
        setServicesOpen(!servicesItem.classList.contains('is-open'));
    });

    servicesItem?.addEventListener('mouseenter', () => {
        if (!mobileBreakpoint.matches) setServicesOpen(true);
    });

    servicesItem?.addEventListener('mouseleave', () => {
        if (!servicesItem.contains(document.activeElement)) setServicesOpen(false);
    });

    servicesItem?.addEventListener('focusout', (event) => {
        if (!servicesItem.contains(event.relatedTarget)) setServicesOpen(false);
    });

    servicesItem?.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' && event.target === servicesTrigger) {
            event.preventDefault();
            setServicesOpen(true);
            desktopCategoryButtons.find((button) => button.tabIndex === 0)?.focus();
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            setServicesOpen(false, true);
        }
    });

    document.addEventListener('pointerdown', (event) => {
        if (servicesItem && !servicesItem.contains(event.target)) setServicesOpen(false);
    }, { passive: true });

    function getFocusableMenuElements() {
        return Array.from(mobilePanel.querySelectorAll(
            'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        )).filter((element) => !element.hidden && element.getClientRects().length > 0);
    }

    function openMobileMenu() {
        menuReturnFocus = document.activeElement;
        nav.classList.remove('tba-nav-hidden');
        mobilePanel.classList.add('is-open');
        menuBackdrop.classList.add('is-open');
        mobilePanel.removeAttribute('inert');
        mobilePanel.setAttribute('aria-hidden', 'false');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Menu sluiten');
        document.body.classList.add('tba-menu-open');
        window.setTimeout(() => menuClose.focus(), 60);
    }

    function closeMobileMenu(options) {
        const settings = Object.assign({ restoreFocus: true }, options);
        mobilePanel.classList.remove('is-open');
        menuBackdrop.classList.remove('is-open');
        mobilePanel.setAttribute('inert', '');
        mobilePanel.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Menu openen');
        document.body.classList.remove('tba-menu-open');
        if (settings.restoreFocus && menuReturnFocus instanceof HTMLElement) menuReturnFocus.focus();
    }

    menuToggle?.addEventListener('click', () => {
        if (mobilePanel.classList.contains('is-open')) closeMobileMenu();
        else openMobileMenu();
    });

    menuClose?.addEventListener('click', () => closeMobileMenu());
    menuBackdrop?.addEventListener('click', () => closeMobileMenu());

    mobilePanel?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMobileMenu({ restoreFocus: false }));
    });

    header.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link || link.classList.contains('tba-skip-link')) return;

        const linkUrl = new URL(link.href, window.location.href);
        const normalizedPath = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '/');
        const isSamePage = linkUrl.origin === window.location.origin &&
            normalizedPath(linkUrl.pathname) === normalizedPath(window.location.pathname);
        const target = linkUrl.hash ? document.querySelector(linkUrl.hash) : null;

        if (!isSamePage || !target) return;
        event.preventDefault();

        const offset = mobileBreakpoint.matches ? 76 : 92;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: targetTop, behavior: reducedMotion ? 'auto' : 'smooth' });
        window.history.pushState(null, '', linkUrl.hash);
    });

    document.addEventListener('keydown', (event) => {
        if (!mobilePanel.classList.contains('is-open')) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeMobileMenu();
            return;
        }
        if (event.key !== 'Tab') return;

        const focusable = getFocusableMenuElements();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    function handleBreakpointChange(event) {
        if (!event.matches && mobilePanel.classList.contains('is-open')) {
            closeMobileMenu({ restoreFocus: false });
        }
    }

    if (typeof mobileBreakpoint.addEventListener === 'function') {
        mobileBreakpoint.addEventListener('change', handleBreakpointChange);
    } else {
        mobileBreakpoint.addListener(handleBreakpointChange);
    }

    function updateHeaderOnScroll() {
        const currentScrollY = Math.max(window.scrollY, 0);
        const scrollDelta = currentScrollY - previousScrollY;
        const menuIsOpen = mobilePanel.classList.contains('is-open');
        const headerHasKeyboardFocus = Boolean(nav.querySelector(':focus-visible'));

        nav.classList.toggle('tba-scrolled', currentScrollY > 50);

        if (currentScrollY <= hideThreshold || menuIsOpen || headerHasKeyboardFocus) {
            nav.classList.remove('tba-nav-hidden');
            previousScrollY = currentScrollY;
        } else if (scrollDelta > directionThreshold) {
            nav.classList.add('tba-nav-hidden');
            previousScrollY = currentScrollY;
        } else if (scrollDelta < -directionThreshold) {
            nav.classList.remove('tba-nav-hidden');
            previousScrollY = currentScrollY;
        }

        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(updateHeaderOnScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    nav.addEventListener('focusin', () => nav.classList.remove('tba-nav-hidden'));

    prepareDesktopServicesMenu();
    prepareMobileServicesMenu();
    routePrimaryContactLinks();
    routeSectionLinks();
    addVisualisationUpsell();
    normalisePricePresentation();
    setCurrentNavigation();
    prepareSkipLink();
    observeHomepageSections();
    updateHeaderOnScroll();
}());
