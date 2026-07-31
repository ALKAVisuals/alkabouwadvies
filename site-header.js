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
        'carport-vergunning.html',
        'dakkapel.html',
        'dakopbouw-vergunningen.html',
        'erker.html',
        'kozijnen-vervangen-vergunning.html',
        'mantelzorg.html',
        'nokverhoging.html',
        'omgevingsvergunning-aanvragen.html'
    ]);

    let menuReturnFocus = null;
    let previousScrollY = Math.max(window.scrollY, 0);
    let scrollTicking = false;
    const hideThreshold = 140;
    const directionThreshold = 8;

    function currentFilename() {
        const pathname = window.location.pathname.replace(/\/+$/, '');
        return pathname.split('/').pop() || 'index.html';
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

    setCurrentNavigation();
    prepareSkipLink();
    observeHomepageSections();
    updateHeaderOnScroll();
}());
