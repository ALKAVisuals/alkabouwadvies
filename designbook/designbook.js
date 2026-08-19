import { designBookConfig, designBookPages } from './designbook-data.js';

const roots = document.querySelectorAll('[data-designbook]');
roots.forEach((root) => initDesignBook(root));

function initDesignBook(root) {
  if (root.dataset.designbookReady === 'true') return;
  root.dataset.designbookReady = 'true';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 760px)');

  root.innerHTML = `
    <div class="db-shell">
      <div class="db-intro">
        <p class="db-eyebrow">VAN CONCEPT NAAR TECHNISCH ONTWERP</p>
        <h2>${escapeHtml(designBookConfig.title)}</h2>
        <p>Een beeldgedreven ontwerpverhaal waarin technische tekeningen, materiaalkeuzes en visualisaties samen één helder geheel vormen.</p>
        <button class="db-open" type="button" data-db-open aria-controls="tba-designbook-book">Open ontwerpboek <span aria-hidden="true">→</span></button>
      </div>

      <div class="db-experience" data-db-experience data-state="closed">
        <div class="db-visually-hidden" aria-live="polite" aria-atomic="true" data-db-live>Ontwerpboek klaar om te openen.</div>
        <div class="db-stage">
          <div class="db-shadow" aria-hidden="true"></div>
          <button class="db-cover" type="button" data-db-cover aria-label="Open het ontwerpboek" aria-controls="tba-designbook-book">
            <span class="db-cover-inner">
              <span class="db-cover-kicker">TECHNISCH ONTWERP</span>
              <span class="db-cover-title">ONTWERPBOEK</span>
              <span class="db-cover-sub">VAN CONCEPT NAAR TECHNISCH ONTWERP</span>
              <span class="db-cover-rule" aria-hidden="true"></span>
              <svg class="db-cover-lineart" viewBox="0 0 420 300" aria-hidden="true">
                <path d="M54 246V118L164 62l112 57v127M54 118l111 60 111-59M165 178v69"/>
                <path d="M276 247v-82l94-24v106M276 165l47-33 47 9M303 160v87M337 151v96"/>
                <path d="M75 129v105M99 141v93M123 153v81M147 165v69M192 164v75M219 151v88M246 137v102" class="thin"/>
                <line x1="32" y1="247" x2="389" y2="247" class="thin"/>
              </svg>
              <span class="db-cover-brand">TECHNISCH BOUWADVIES</span>
            </span>
          </button>

          <div class="db-book" id="tba-designbook-book" data-db-book tabindex="0" role="region" aria-label="Interactief ontwerpboek; gebruik de pijltjestoetsen of swipe om te bladeren">
            <span class="db-stack db-stack-left" aria-hidden="true"></span>
            <span class="db-stack db-stack-right" aria-hidden="true"></span>
            <span class="db-spine" aria-hidden="true"></span>
            <article class="db-page db-page-left" data-db-left aria-live="off"></article>
            <article class="db-page db-page-right" data-db-right aria-live="off"></article>
            <span class="db-turn" data-db-turn aria-hidden="true"></span>
          </div>

          <div class="db-end" data-db-end aria-hidden="true">
            <p class="db-eyebrow">ONTWERPVERHAAL COMPLEET</p>
            <h3>Van eerste idee naar een helder uitgewerkt ontwerp.</h3>
            <p>Bekijk het ontwerpverhaal opnieuw of bespreek uw eigen bouwplan.</p>
            <button class="db-open" type="button" data-db-restart>Bekijk opnieuw <span aria-hidden="true">↻</span></button>
            <a class="db-link" href="#contact">Bespreek uw bouwplan <span aria-hidden="true">→</span></a>
          </div>
        </div>

        <div class="db-controls" aria-label="Boekbediening">
          <button class="db-arrow" type="button" data-db-prev aria-label="Vorige spread" aria-controls="tba-designbook-book">←</button>
          <div class="db-position"><span data-db-count>00 / 08</span><span class="db-progress" aria-hidden="true"><span data-db-progress></span></span></div>
          <button class="db-arrow" type="button" data-db-next aria-label="Volgende spread" aria-controls="tba-designbook-book">→</button>
          <button class="db-autoplay" type="button" data-db-autoplay aria-pressed="false" aria-label="Start automatisch bladeren" aria-controls="tba-designbook-book"><span data-db-play aria-hidden="true">▶</span></button>
        </div>
      </div>
    </div>`;

  const experience = root.querySelector('[data-db-experience]');
  const book = root.querySelector('[data-db-book]');
  const left = root.querySelector('[data-db-left]');
  const right = root.querySelector('[data-db-right]');
  const turn = root.querySelector('[data-db-turn]');
  const openButtons = root.querySelectorAll('[data-db-open], [data-db-cover]');
  const restart = root.querySelector('[data-db-restart]');
  const prev = root.querySelector('[data-db-prev]');
  const next = root.querySelector('[data-db-next]');
  const autoplayButton = root.querySelector('[data-db-autoplay]');
  const playIcon = root.querySelector('[data-db-play]');
  const count = root.querySelector('[data-db-count]');
  const progress = root.querySelector('[data-db-progress]');
  const live = root.querySelector('[data-db-live]');
  const end = root.querySelector('[data-db-end]');

  let pageIndex = 0;
  let state = 'closed';
  let autoplay = false;
  let autoplayTimer = null;
  let pointerStart = null;
  let inViewport = false;
  let hasOpened = false;
  let reducedMotionOptIn = false;
  const preloaded = new Set();

  const isMobile = () => mobileQuery.matches;
  const step = () => isMobile() ? 1 : 2;
  const spreadTotal = Math.ceil(designBookPages.length / 2);
  const normalize = (index) => {
    const clamped = Math.max(0, Math.min(index, designBookPages.length - 1));
    return isMobile() ? clamped : Math.floor(clamped / 2) * 2;
  };

  function setState(nextState) {
    state = nextState;
    experience.dataset.state = nextState;
    const open = nextState === 'open';
    prev.disabled = !open || pageIndex === 0;
    next.disabled = !open;
    autoplayButton.disabled = !open;
    end.setAttribute('aria-hidden', String(nextState !== 'ended'));
    updateStatus();
  }

  function updateStatus() {
    if (state === 'closed' || state === 'opening') {
      count.textContent = `00 / ${String(spreadTotal).padStart(2,'0')}`;
      progress.style.width = '0%';
      live.textContent = 'Ontwerpboek klaar om te openen.';
      return;
    }
    if (state === 'ended') {
      count.textContent = `${String(spreadTotal).padStart(2,'0')} / ${String(spreadTotal).padStart(2,'0')}`;
      progress.style.width = '100%';
      live.textContent = 'Ontwerpverhaal compleet.';
      return;
    }
    const spread = Math.min(spreadTotal, Math.floor(pageIndex / 2) + 1);
    count.textContent = `${String(spread).padStart(2,'0')} / ${String(spreadTotal).padStart(2,'0')}`;
    progress.style.width = `${(spread / spreadTotal) * 100}%`;
    const page = designBookPages[pageIndex];
    live.textContent = `Spread ${spread} van ${spreadTotal}: ${page?.title || page?.kicker || 'ontwerp'}.`;
  }

  function factsMarkup(facts = []) {
    if (!facts.length) return '';
    return `<dl class="db-facts">${facts.map(([label,value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>`;
  }

  function pageMarkup(page) {
    if (!page) return '<div class="db-page-inner"></div>';
    const kicker = page.kicker ? `<p class="db-kicker">${escapeHtml(page.kicker)}</p>` : '';
    const title = page.title ? `<h3 class="db-title">${escapeHtml(page.title)}</h3>` : '';
    const copy = page.copy ? `<p class="db-copy">${escapeHtml(page.copy)}</p>` : '';

    if (page.type === 'image') {
      return `<div class="db-page-inner db-visual-fill"><img src="${escapeHtml(page.src)}" alt="${escapeHtml(page.alt || '')}" loading="lazy" decoding="async"></div>`;
    }
    if (page.type === 'image-contain') {
      return `<div class="db-page-inner"><div class="db-image-contain"><img src="${escapeHtml(page.src)}" alt="${escapeHtml(page.alt || '')}" loading="lazy" decoding="async"></div></div>`;
    }
    if (page.type === 'gallery') {
      return `<div class="db-page-inner"><div class="db-gallery">${page.items.map(([src,label]) => `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(label)}</figcaption></figure>`).join('')}</div></div>`;
    }
    if (page.type === 'drawing') {
      return `<div class="db-page-inner"><div class="db-drawing-wrap">${page.html}</div></div>`;
    }
    if (page.type === 'drawing-title') {
      return `<div class="db-page-inner">${kicker}${title}<div class="db-drawing-wrap">${page.html}</div></div>`;
    }
    if (page.type === 'materials') {
      return `<div class="db-page-inner">${kicker}${title}<span class="db-rule" aria-hidden="true"></span>${copy}<div class="db-materials" aria-label="Materiaalpalet"><span></span><span></span><span></span><span></span><span></span></div></div>`;
    }
    if (page.type === 'html') {
      return `<div class="db-page-inner db-visual-fill">${page.html}</div>`;
    }
    if (page.type === 'cta') {
      return `<div class="db-page-inner">${kicker}${title}<span class="db-rule" aria-hidden="true"></span>${copy}<a class="db-link" href="${escapeHtml(page.href || '#contact')}">${escapeHtml(page.cta || 'Meer weten')} <span aria-hidden="true">→</span></a></div>`;
    }
    return `<div class="db-page-inner">${kicker}${title}<span class="db-rule" aria-hidden="true"></span>${copy}${factsMarkup(page.facts)}</div>`;
  }

  function render() {
    pageIndex = normalize(pageIndex);
    left.innerHTML = pageMarkup(designBookPages[pageIndex]);
    left.dataset.page = String(pageIndex + 1).padStart(2,'0');
    const rightPage = designBookPages[pageIndex + 1];
    right.innerHTML = pageMarkup(rightPage);
    right.dataset.page = rightPage ? String(pageIndex + 2).padStart(2,'0') : '—';
    right.hidden = isMobile();
    updateStatus();
    prev.disabled = state !== 'open' || pageIndex === 0;
    schedulePreload();
  }

  function setAutoplay(value, { explicit = false } = {}) {
    if (prefersReducedMotion.matches && value && !explicit) value = false;
    if (explicit && value) reducedMotionOptIn = true;
    autoplay = value;
    autoplayButton.setAttribute('aria-pressed', String(value));
    autoplayButton.setAttribute('aria-label', value ? 'Pauzeer automatisch bladeren' : 'Start automatisch bladeren');
    playIcon.textContent = value ? 'Ⅱ' : '▶';
    restartAutoplay();
  }

  function pauseAutoplay() {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }

  function restartAutoplay() {
    pauseAutoplay();
    if (!autoplay || state !== 'open' || !inViewport || document.hidden) return;
    autoplayTimer = window.setTimeout(() => goNext(false), designBookConfig.autoplayMs);
  }

  function openBook(userInitiated = false) {
    if (state === 'opening' || state === 'open') return;
    pageIndex = 0;
    render();
    setState('opening');
    const delay = prefersReducedMotion.matches ? 0 : 1080;
    window.setTimeout(() => {
      setState('open');
      hasOpened = true;
      setAutoplay(!prefersReducedMotion.matches);
      if (userInitiated) book.focus({ preventScroll:true });
    }, delay);
  }

  function animate(direction) {
    if (prefersReducedMotion.matches) return;
    turn.classList.remove('is-next','is-prev');
    void turn.offsetWidth;
    turn.classList.add(direction > 0 ? 'is-next' : 'is-prev');
  }

  function goTo(target, direction) {
    if (state !== 'open') return;
    const normalized = normalize(target);
    if (normalized === pageIndex) return;
    pauseAutoplay();
    animate(direction);
    window.setTimeout(() => {
      pageIndex = normalized;
      render();
      restartAutoplay();
    }, prefersReducedMotion.matches ? 0 : 500);
  }

  function isLastView() { return pageIndex + step() >= designBookPages.length; }
  function goNext(userInitiated = true) {
    if (state === 'closed' || state === 'ended') { openBook(userInitiated); return; }
    if (state !== 'open') return;
    if (isLastView()) { finish(); return; }
    goTo(pageIndex + step(), 1);
  }
  function goPrev() { if (state === 'open' && pageIndex > 0) goTo(pageIndex - step(), -1); }

  function finish() {
    pauseAutoplay();
    setAutoplay(false);
    setState('ended');
  }

  function restart() {
    pauseAutoplay();
    pageIndex = 0;
    setState('closed');
    render();
    window.setTimeout(() => openBook(true), prefersReducedMotion.matches ? 0 : 250);
  }

  function assetSources(page) {
    if (!page) return [];
    if (page.src) return [page.src];
    if (page.items) return page.items.map(([src]) => src);
    return [];
  }

  function schedulePreload() {
    if (navigator.connection?.saveData) return;
    const start = pageIndex + step();
    const indexes = isMobile() ? [start] : [start, start + 1];
    const sources = indexes.flatMap((index) => assetSources(designBookPages[index]));
    const load = () => sources.forEach((src) => {
      if (!src || preloaded.has(src)) return;
      preloaded.add(src);
      const image = new Image(); image.decoding = 'async'; image.src = src;
    });
    if ('requestIdleCallback' in window) window.requestIdleCallback(load,{timeout:1200}); else window.setTimeout(load,250);
  }

  openButtons.forEach((button) => button.addEventListener('click', () => openBook(true)));
  restart.addEventListener('click', restart);
  prev.addEventListener('click', goPrev);
  next.addEventListener('click', () => goNext(true));
  autoplayButton.addEventListener('click', (event) => setAutoplay(!autoplay, { explicit: event.isTrusted }));

  book.addEventListener('mouseenter', pauseAutoplay);
  book.addEventListener('mouseleave', restartAutoplay);
  book.addEventListener('focusin', pauseAutoplay);
  book.addEventListener('focusout', restartAutoplay);
  book.addEventListener('pointerdown', (event) => { pointerStart = { x:event.clientX, y:event.clientY }; });
  book.addEventListener('pointerup', (event) => {
    if (!pointerStart || state !== 'open') return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
    dx < 0 ? goNext(true) : goPrev();
  });
  book.addEventListener('pointercancel', () => { pointerStart = null; });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); goNext(true); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goPrev(); }
    if (event.key === 'Escape' && autoplay) setAutoplay(false);
  });

  document.addEventListener('visibilitychange', () => document.hidden ? pauseAutoplay() : restartAutoplay());
  mobileQuery.addEventListener?.('change', () => { pageIndex = normalize(pageIndex); render(); restartAutoplay(); });
  prefersReducedMotion.addEventListener?.('change', () => {
    reducedMotionOptIn = false;
    if (prefersReducedMotion.matches) setAutoplay(false);
  });

  const viewportObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting && entry.intersectionRatio >= .35;
    if (!inViewport) pauseAutoplay(); else restartAutoplay();
  }, { threshold:[0,.35,.6] });
  viewportObserver.observe(root);

  render();
  setState('closed');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
