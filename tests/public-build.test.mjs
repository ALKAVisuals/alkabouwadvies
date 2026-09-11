import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testsDirectory, '..');
const outputDirectory = path.join(repositoryRoot, '_site');
const hiddenCityPages = [
  'amsterdam.html',
  'apeldoorn.html',
  'arnhem.html',
  'breda.html',
  'den-haag.html',
  'eindhoven.html',
  'groningen.html',
  'nijmegen.html',
  'rotterdam.html',
  'tilburg.html',
  'utrecht.html'
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test('public build contains every sitemap page', async () => {
  const sitemap = await readFile(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));

  for (const url of urls) {
    const relativePath = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1);
    assert.equal(await exists(path.join(outputDirectory, relativePath)), true, `${relativePath} is missing`);
  }
});

test('public build contains required platform files and assets', async () => {
  for (const relativePath of [
    '404.html',
    '_redirects',
    'accessibility-fixes.css',
    'fonts.css',
    'fonts/inter-latin-variable.woff2',
    'page-styles/home.css',
    'robots.txt',
    'sitemap.xml',
    'images/favicon.svg'
  ]) {
    assert.equal(await exists(path.join(outputDirectory, relativePath)), true, `${relativePath} is missing`);
  }
});

test('public pages receive the shared accessibility layer and semantic corrections', async () => {
  const htmlFiles = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));
  const removedLabels = [
    'Technisch Bouwadvies - Home',
    'Bekijk uw prijsindicatie',
    'Bekijk voorbeelden',
    'Gratis en vrijblijvend adviesgesprek aanvragen',
    'Bel ons op +31 6 49 24 04 12',
    'Bel Technisch Bouwadvies op +31 6 49 24 04 12',
    'Verstuur uw aanvraag; onze streeftijd is één werkdag'
  ];

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    const relativePage = path.relative(outputDirectory, htmlFile);
    const expectedStylesheet = relativePage.includes(path.sep)
      ? '../accessibility-fixes.css?v=20260911-2'
      : 'accessibility-fixes.css?v=20260911-2';
    assert.equal(
      html.includes(`href="${expectedStylesheet}"`),
      true,
      `${relativePage} does not use ${expectedStylesheet}`
    );

    for (const label of removedLabels) {
      assert.equal(html.includes(`aria-label="${label}"`), false, `${path.basename(htmlFile)} keeps ${label}`);
    }

    for (const heading of html.matchAll(/<h([45])\b([^>]*)>/g)) {
      assert.match(heading[2], /role="heading"/);
      assert.match(heading[2], /aria-level="[23]"/);
    }
  }
});

test('legacy section and blog card headings expose a sequential public level', async () => {
  const affectedPages = [
    'aanbouw-uitbouw.html',
    'bed-breakfast.html',
    'bijgebouw.html',
    'blog.html',
    'dakopbouw-vergunningen.html',
    'erker.html',
    'mantelzorg.html',
    'nokverhoging.html',
    '3d-visualisaties-vloerplannen.html',
    path.join('blog', 'dakkapel-plaatsen-2026.html')
  ];

  for (const relativePage of affectedPages) {
    const html = await readFile(path.join(outputDirectory, relativePage), 'utf8');
    const targetHeadings = [
      ...html.matchAll(/<div class="(?:waardestijging-content|complexiteit-content|roi-content|blog-toc|blog-card-content)"[^>]*>[\s\S]*?<h3([^>]*)>/g),
      ...html.matchAll(/<a[^>]*class="choice-card"[^>]*>[\s\S]*?<h3([^>]*)>/g)
    ];

    assert.ok(targetHeadings.length > 0, `${relativePage} has no expected legacy heading`);
    for (const heading of targetHeadings) {
      assert.match(heading[1], /role="heading"/);
      assert.match(heading[1], /aria-level="2"/);
    }
  }
});

test('Google font stylesheets do not block first paint', async () => {
  const htmlFiles = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    const scriptEnabledHtml = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
    assert.doesNotMatch(
      scriptEnabledHtml,
      /<link href="https:\/\/fonts\.googleapis\.com\/[^\"]+" rel="stylesheet"(?: crossorigin)?>/
    );
  }

  const homepage = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
  assert.doesNotMatch(homepage, /fonts\.googleapis\.com/);
  assert.match(homepage, /<link rel="preload" href="fonts\/inter-latin-variable\.woff2" as="font"/);
  assert.match(homepage, /href="page-styles\/home\.css\?v=20260911"/);
  assert.equal((homepage.match(/<style\b/gi) || []).length, 0);
  const homepageStyles = await readFile(path.join(outputDirectory, 'page-styles', 'home.css'), 'utf8');
  assert.match(homepageStyles, /@media \(max-width: 767px\)[\s\S]*?\.hero h1,[\s\S]*?opacity: 1;/);
  assert.match(homepage, /const enableRichMotion = !prefersReducedMotion && window\.matchMedia\('\(min-width: 768px\)'\)\.matches/);
  assert.match(homepage, /if \(enableRichMotion\) \{[\s\S]*?initHeroAnimations\(\);[\s\S]*?initScrollAnimations\(\);/);
});

test('Font Awesome does not block first paint', async () => {
  const htmlFiles = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    if (!/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/.test(html)) continue;
    const scriptEnabledHtml = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');

    assert.doesNotMatch(
      scriptEnabledHtml,
      /<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^\"]+\/css\/all\.min\.css">/
    );
    assert.match(
      scriptEnabledHtml,
      /<link rel="preload" as="style" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^\"]+\/css\/all\.min\.css"/
    );
  }
});

test('service hero carousels load only the active image on compact screens', async () => {
  const carouselPages = [
    'aanbouw-uitbouw.html',
    'bed-breakfast.html',
    'bijgebouw.html',
    'dakkapel.html',
    'dakopbouw-vergunningen.html',
    'erker.html',
    'mantelzorg.html',
    'nokverhoging.html'
  ];

  for (const page of carouselPages) {
    const html = await readFile(path.join(outputDirectory, page), 'utf8');
    const inactiveSlides = [...html.matchAll(/<img\b[^>]*\bhero-design-slide\b[^>]*>/g)]
      .filter(([imageTag]) => !/\bis-active\b/.test(imageTag));

    assert.ok(inactiveSlides.length > 0, `${page} should expose inactive hero slides`);
    for (const [imageTag] of inactiveSlides) {
      assert.doesNotMatch(imageTag, /\ssrc=/);
      assert.match(imageTag, /\sdata-src=/);
    }

    assert.match(html, /const compactViewport = window\.matchMedia\('\(max-width: 767px\)'\);/);
    assert.match(html, /if \(compactViewport\.matches\) return;/);
  }
});

test('public pages apply every style before body content can paint', async () => {
  const htmlFiles = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    const body = html.slice(html.indexOf('<body'));
    assert.doesNotMatch(body, /<style\b/i, `${htmlFile} contains a late style block`);
  }
});

test('consent UI assets are discovered before first paint', async () => {
  const pages = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const page of pages) {
    if (page.endsWith('404.html')) continue;
    const html = await readFile(page, 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    const prefix = page.includes(`${path.sep}blog${path.sep}`) ? '../' : '';

    assert.match(head, new RegExp(`<link rel="stylesheet" href="${prefix}privacy-consent\\.css">`));
    assert.match(head, new RegExp(`<script src="${prefix}privacy-consent\\.js" defer></script>`));
    assert.match(html, /<section class="tba-consent" id="tba-consent" role="dialog"/);
    assert.doesNotMatch(html, /<section class="tba-consent" id="tba-consent"[^>]* hidden/);
  }
});

test('public Inter pages use the self-hosted font without a layout-shifting swap', async () => {
  const htmlFiles = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    if (!/font-family:\s*['"]?Inter/i.test(html)) continue;
    assert.doesNotMatch(html, /fonts\.googleapis\.com\/css2\?family=Inter:wght@300;400;500;600;700;800/);
    assert.match(html, /href="\/fonts\/inter-latin-variable\.woff2"/);
    assert.match(html, /href="\/fonts\.css\?v=20260911"/);
  }
});

test('homepage serves right-sized responsive images', async () => {
  const homepage = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
  const responsiveImages = [
    'homepage-hero-ontwerp-naar-realisatie-768.webp',
    'dakkapel-dakopbouw-van-schets-naar-realisatie-640.webp',
    'Dakopbouw_-homepage-640.webp',
    'uitbouw-homepage-640.webp',
    'erker-gevelaanzicht-en-bouwdetail-640.webp',
    'mantelzorgwoning-plattegrond-en-gevel-640.webp',
    'B&B_-homepage-640.webp',
    'nokverhoging-woning-dakdoorsnede-640.webp',
    'bijgebouw-tuinkantoor-plan-en-gevel-640.webp'
  ];

  for (const imageName of responsiveImages) {
    assert.match(homepage, new RegExp(`${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (?:640|768)w`));
    const relativePath = imageName === 'Dakopbouw_-homepage-640.webp' ||
      imageName === 'uitbouw-homepage-640.webp' ||
      imageName === 'B&B_-homepage-640.webp'
      ? path.join('images', imageName)
      : imageName.startsWith('homepage-hero-')
        ? path.join('images', 'website-2026', imageName)
        : path.join('images', 'website-2026', 'diensten', imageName);
    assert.equal(await exists(path.join(outputDirectory, relativePath)), true, `${relativePath} is missing`);
  }

  for (const imageTag of homepage.matchAll(/<img\b[^>]*class="categorie-image"[^>]*>/g)) {
    assert.match(imageTag[0], /\bwidth="\d+"/);
    assert.match(imageTag[0], /\bheight="\d+"/);
    assert.match(imageTag[0], /\bsrcset="[^"]+"/);
    assert.match(imageTag[0], /\bsizes="[^"]+"/);
  }
});

test('dakkapel hero slider reserves space and serves responsive images', async () => {
  const page = await readFile(path.join(outputDirectory, 'dakkapel.html'), 'utf8');
  const slides = [...page.matchAll(/<img\b[^>]*class="hero-right-img hero-design-slide[^"]*"[^>]*>/g)];
  assert.equal(slides.length, 4);

  for (const slide of slides) {
    assert.match(slide[0], /\bwidth="1280"/);
    assert.match(slide[0], /\bheight="853"/);
    assert.match(slide[0], /\bsrcset="[^"]+-800\.webp 800w,[^"]+\.webp 1280w"/);
    assert.match(slide[0], /\bsizes="\(max-width: 767px\) calc\(100vw - 42px\), 50vw"/);
  }
});

test('legacy service heroes reserve space and serve right-sized mobile images', async () => {
  const pages = [
    ['aanbouw-uitbouw.html', 'aanbouw-ontwerp-metselwerk-hout-800.webp'],
    ['erker.html', 'erker-ontwerp-glazen-hoek-800.webp'],
    ['bijgebouw.html', 'bijgebouw-ontwerp-warm-hout-800.webp'],
    ['dakopbouw-vergunningen.html', 'dakopbouw-ontwerp-hout-panorama-800.webp'],
    ['nokverhoging.html', 'nokverhoging-ontwerp-antraciet-metaal-800.webp'],
    ['bed-breakfast.html', 'bb-ontwerp-warm-hout-800.webp'],
    ['mantelzorg.html', 'mantelzorgwoning-ontwerp-lichte-baksteen-800.webp'],
    ['carport-vergunning.html', 'carport-woning-van-schets-naar-realisatie-800.webp'],
    ['kozijnen-vervangen-vergunning.html', 'kozijnen-gevelwijziging-bouwdetail-800.webp'],
    ['3d-visualisaties-vloerplannen.html', '3d-visualisatie-aanbouw-schets-naar-realisatie-800.webp'],
    ['bouwkundig-advies.html', 'werkwijze-bouwadvies-tekeningen-bespreken-800.webp'],
    ['bouwtekening-digitaliseren.html', 'bouwtekeningen-plattegrond-gevel-doorsnede-800.webp']
  ];

  for (const [page, mobileImage] of pages) {
    const html = await readFile(path.join(outputDirectory, page), 'utf8');
    assert.match(html, new RegExp(`imagesrcset="[^"]*${mobileImage.replace('.', '\\.')} 800w`));
    assert.match(html, new RegExp(`srcset="[^"]*${mobileImage.replace('.', '\\.')} 800w`));
    assert.match(html, /<img[^>]+\bwidth="\d+"[^>]+\bheight="\d+"/);
  }
});

test('image-heavy service sections avoid loading oversized originals on mobile', async () => {
  const pages = [
    ['erker.html', [
      'erker-modern-daglicht-rijwoning-800.webp',
      'erker-tot-vloerniveau-rijwoning-800.webp',
      'erker-klassiek-jaren-dertig-800.webp'
    ]],
    ['bijgebouw.html', [
      'Bijgebouw_-homepage-800.webp',
      'bijgebouw-opslag-hobbyruimte-800.webp'
    ]]
  ];

  for (const [page, responsiveImages] of pages) {
    const html = await readFile(path.join(outputDirectory, page), 'utf8');
    for (const responsiveImage of responsiveImages) {
      assert.match(html, new RegExp(`srcset="[^"]*${responsiveImage.replace('.', '\\.')} 800w`));
    }
  }
});

test('permit service hero reserves space and serves a responsive image', async () => {
  const page = await readFile(path.join(outputDirectory, 'omgevingsvergunning-aanvragen.html'), 'utf8');
  const heroImage = page.match(/<img\b[^>]*class="hero-right-img"[^>]*>/)?.[0] || '';

  assert.match(heroImage, /\bwidth="1857"/);
  assert.match(heroImage, /\bheight="847"/);
  assert.match(heroImage, /\bsrcset="[^"]+-800\.webp 800w,[^"]+\.webp 1857w"/);
  assert.match(heroImage, /\bsizes="\(max-width: 767px\) calc\(100vw - 30px\), 50vw"/);
});

test('construction service hero serves a responsive image', async () => {
  const page = await readFile(path.join(outputDirectory, 'constructieberekening.html'), 'utf8');
  const heroImage = page.match(/<img\b[^>]*class="construction-hero__image"[^>]*>/)?.[0] || '';

  assert.match(heroImage, /\bwidth="1717"/);
  assert.match(heroImage, /\bheight="916"/);
  assert.match(heroImage, /\bsrcset="[^"]+-900\.webp 900w,[^"]+\.webp 1717w"/);
  assert.match(heroImage, /\bsizes="\(max-width: 1020px\) calc\(100vw - 32px\), 46vw"/);
});

test('public build excludes internal and retired source material', async () => {
  for (const relativePath of [
    'ANALYSE.md',
    'README.md',
    'verbeterpunten site.pdf',
    'analyses',
    'concurrentie-analyse',
    'tests',
    'Vervallen',
    'css/styles.css',
    'js/animations.js',
    'images/website-2026/README.md',
    ...hiddenCityPages
  ]) {
    assert.equal(await exists(path.join(outputDirectory, relativePath)), false, `${relativePath} was published`);
  }
});

test('hidden city pages are absent from the sitemap and public navigation', async () => {
  const sitemap = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
  const htmlFiles = (await readdir(outputDirectory, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const cityPage of hiddenCityPages) {
    assert.equal(sitemap.includes(cityPage), false, `${cityPage} remains in the sitemap`);

    for (const htmlFile of htmlFiles) {
      const html = await readFile(htmlFile, 'utf8');
      assert.equal(html.includes(`href="${cityPage}`), false, `${path.basename(htmlFile)} links to ${cityPage}`);
      assert.equal(html.includes(`href='${cityPage}`), false, `${path.basename(htmlFile)} links to ${cityPage}`);
    }
  }
});

test('every local page resource in the public build resolves', async () => {
  const sitemap = await readFile(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
  const redirects = await readFile(path.join(outputDirectory, '_redirects'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  const redirectSources = redirects
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(/\s+/)[0]);

  const hasRedirect = (pathname) => redirectSources.some((source) => {
    if (source.startsWith('http')) return false;
    if (source.endsWith('*')) return pathname.startsWith(source.slice(0, -1));
    return pathname === source;
  });

  for (const pageUrl of urls) {
    const relativePage = pageUrl.pathname === '/' ? 'index.html' : decodeURIComponent(pageUrl.pathname).slice(1);
    const html = await readFile(path.join(outputDirectory, relativePage), 'utf8');
    const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map((match) => match[1]);

    for (const reference of references) {
      if (/^(?:#|mailto:|tel:|data:|javascript:)/i.test(reference)) continue;

      const targetUrl = new URL(reference, pageUrl);
      if (targetUrl.origin !== 'https://technischbouwadvies.nl') continue;

      const targetPath = decodeURIComponent(targetUrl.pathname).replace(/^\//, '');
      const candidates = targetPath
        ? [targetPath, `${targetPath}.html`, path.join(targetPath, 'index.html')]
        : ['index.html'];
      const resolved = await Promise.all(candidates.map((candidate) => exists(path.join(outputDirectory, candidate))));

      assert.equal(
        resolved.some(Boolean) || hasRedirect(targetUrl.pathname),
        true,
        `${relativePage} references missing local target ${reference}`
      );
    }
  }
});

test('canonical and Open Graph URLs match sitemap URLs', async () => {
  const sitemap = await readFile(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  for (const sitemapUrl of urls) {
    const url = new URL(sitemapUrl);
    const relativePage = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1);
    const html = await readFile(path.join(outputDirectory, relativePage), 'utf8');
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
    const openGraphUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1];

    assert.equal(canonical, sitemapUrl, `${relativePage} canonical differs from sitemap`);
    assert.equal(openGraphUrl, sitemapUrl, `${relativePage} og:url differs from sitemap`);
  }
});

test('every local CSS asset in the public build resolves', async () => {
  const entries = await readdir(outputDirectory, { recursive: true, withFileTypes: true });
  const cssFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  for (const cssFile of cssFiles) {
    const css = await readFile(cssFile, 'utf8');
    const references = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) => match[1]);

    for (const reference of references) {
      if (/^(?:data:|https?:|#)/i.test(reference)) continue;

      const targetPath = path.resolve(path.dirname(cssFile), decodeURIComponent(reference.split(/[?#]/)[0]));
      assert.equal(await exists(targetPath), true, `${path.relative(outputDirectory, cssFile)} references ${reference}`);
    }
  }
});
