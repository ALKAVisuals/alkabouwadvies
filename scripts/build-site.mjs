import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const outputDirectory = path.resolve(repositoryRoot, '_site');
const relativeOutput = path.relative(repositoryRoot, outputDirectory);

if (!relativeOutput || relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) {
  throw new Error(`Unsafe output directory: ${outputDirectory}`);
}

const sitemapSource = await readFile(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemapSource.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
const pageFiles = new Set(['404.html']);

for (const url of sitemapUrls) {
  if (url.origin !== 'https://technischbouwadvies.nl') {
    throw new Error(`Unexpected sitemap origin: ${url.href}`);
  }

  const decodedPath = decodeURIComponent(url.pathname);
  const pagePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\//, '');

  if (!pagePath.endsWith('.html')) {
    throw new Error(`Sitemap page is not an HTML file: ${url.href}`);
  }

  pageFiles.add(pagePath);
}

const publicRootFiles = [
  '_redirects',
  'accessibility-fixes.css',
  'css/service-responsive-fixes.css',
  'constructieberekening.css',
  'constructieberekening.js',
  'contact-section.css',
  'contact-section.js',
  'fonts.css',
  'privacy-consent.css',
  'privacy-consent.js',
  'robots.txt',
  'site-footer.css',
  'site-header.css',
  'site-header.js',
  'site-responsive.css',
  'sitemap.xml'
];

const publicDirectories = ['fonts', 'images'];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const pageFile of pageFiles) {
  const source = path.join(repositoryRoot, pageFile);
  const destination = path.join(outputDirectory, pageFile);
  let html = await readFile(source, 'utf8');

  const redundantAccessibleNames = [
    'Technisch Bouwadvies - Home',
    'Bekijk uw prijsindicatie',
    'Bekijk voorbeelden',
    'Gratis en vrijblijvend adviesgesprek aanvragen',
    'Bel ons op +31 6 49 24 04 12',
    'Bel Technisch Bouwadvies op +31 6 49 24 04 12',
    'Verstuur uw aanvraag; onze streeftijd is één werkdag'
  ];

  for (const accessibleName of redundantAccessibleNames) {
    html = html.replaceAll(` aria-label="${accessibleName}"`, '');
  }

  html = html.replace(/<img\b[^>]*\bhero-design-slide\b[^>]*>/g, (imageTag) => {
    if (/\bis-active\b/.test(imageTag)) return imageTag;

    return imageTag
      .replace(/\bsrcset=/, 'data-srcset=')
      .replace(/\bsrc=/, 'data-src=');
  });

  html = html.replace(
    /(const carousel = document\.querySelector\('\[data-hero-design-carousel\]'\);\s*if \(!carousel\) return;)(\s*const slides = Array\.from\(carousel\.querySelectorAll\('\[data-hero-design-slide\]'\)\);)/g,
    '$1\n\n            const compactViewport = window.matchMedia(\'(max-width: 767px)\');$2\n' +
      '            if (compactViewport.matches) return;\n\n' +
      '            slides.forEach((slide) => {\n' +
      '                if (slide.dataset.src) { slide.src = slide.dataset.src; delete slide.dataset.src; }\n' +
      '                if (slide.dataset.srcset) { slide.srcset = slide.dataset.srcset; delete slide.dataset.srcset; }\n' +
      '            });'
  );

  const closingHeadIndex = html.indexOf('</head>');
  if (closingHeadIndex !== -1) {
    const documentHead = html.slice(0, closingHeadIndex);
    let documentBody = html.slice(closingHeadIndex + '</head>'.length);
    const lateStyles = [];

    documentBody = documentBody.replace(/<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi, (styleTag) => {
      lateStyles.push(styleTag);
      return '';
    });

    if (lateStyles.length > 0) {
      html = `${documentHead}\n${lateStyles.join('\n')}\n</head>${documentBody}`;
    }
  }

  const accessibilityStylesheet = pageFile.includes('/')
    ? '../accessibility-fixes.css?v=20260911-2'
    : 'accessibility-fixes.css?v=20260911-2';
  const assetPrefix = pageFile.includes('/') ? '../' : '';
  const consentAssets = pageFile === '404.html'
    ? ''
    : `    <link rel="stylesheet" href="${assetPrefix}privacy-consent.css">\n` +
      `    <script src="${assetPrefix}privacy-consent.js" defer></script>\n`;
  const consentMarkup = pageFile === '404.html'
    ? ''
    : `<section class="tba-consent" id="tba-consent" role="dialog" aria-modal="false" aria-labelledby="tba-consent-title">
    <div class="tba-consent__inner">
        <div class="tba-consent__copy">
            <strong id="tba-consent-title">Uw keuze voor analyse en conversiemeting</strong>
            <p>Functionele opslag is nodig om uw keuze te onthouden. Kies alleen websiteanalyse of ook Google Ads-conversiemeting. Formulierinhoud wordt niet met Google gedeeld en advertentiepersonalisatie blijft uit. <a href="${assetPrefix}cookiebeleid.html">Lees het cookiebeleid</a>.</p>
        </div>
        <div class="tba-consent__actions">
            <button class="tba-consent__button tba-consent__button--reject" type="button" data-consent-choice="denied">Weigeren</button>
            <button class="tba-consent__button tba-consent__button--reject" type="button" data-consent-choice="analytics">Alleen analyse</button>
            <button class="tba-consent__button tba-consent__button--accept" type="button" data-consent-choice="ads">Analyse + conversiemeting</button>
        </div>
    </div>
</section>`;

  if (pageFile === 'index.html') {
    const inlineStyles = [];
    html = html.replace(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi, (_match, css) => {
      inlineStyles.push(css.trim());
      return inlineStyles.length === 1
        ? '<link rel="stylesheet" href="page-styles/home.css?v=20260911">'
        : '';
    });

    const homepageStyles = path.join(outputDirectory, 'page-styles', 'home.css');
    await mkdir(path.dirname(homepageStyles), { recursive: true });
    await writeFile(homepageStyles, `${inlineStyles.join('\n\n')}\n`);
  }

  html = html
    .replace(
      /(<div class="(?:waardestijging-content|complexiteit-content|roi-content|blog-toc|blog-card-content)"[^>]*>[\s\S]*?)<h3(?![^>]*\baria-level=)([^>]*)>/g,
      '$1<h3 role="heading" aria-level="2"$2>'
    )
    .replace(
      /(<a[^>]*class="choice-card"[^>]*>[\s\S]*?)<h3(?![^>]*\baria-level=)([^>]*)>/g,
      '$1<h3 role="heading" aria-level="2"$2>'
    )
    .replace(/<h4(?![^>]*\baria-level=)([^>]*)>/g, '<h4 role="heading" aria-level="3"$1>')
    .replace(/<h5(?![^>]*\baria-level=)([^>]*)>/g, '<h5 role="heading" aria-level="3"$1>')
    .replace(/(<div class="footer-nav">\s*<h5 role="heading" aria-level=")3/g, '$12')
    .replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@300;400;500;600;700;800(?:&|&amp;)display=swap" rel="stylesheet"(?: crossorigin)?>/g,
      '<link rel="preload" href="/fonts/inter-latin-variable.woff2" as="font" type="font/woff2" crossorigin>' +
        '<link rel="stylesheet" href="/fonts.css?v=20260911">'
    )
    .replace(
      /<link href="(https:\/\/fonts\.googleapis\.com\/[^\"]+)" rel="stylesheet"(?: crossorigin)?>/g,
      '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'">' +
        '<noscript><link href="$1" rel="stylesheet"></noscript>'
    )
    .replace(
      /<link rel="stylesheet" href="(https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^\"]+\/css\/all\.min\.css)">/g,
      '<link rel="preload" as="style" href="$1" crossorigin="anonymous" onload="this.onload=null;this.rel=\'stylesheet\'">' +
        '<noscript><link rel="stylesheet" href="$1" crossorigin="anonymous"></noscript>'
    )
    .replace(
      '</head>',
      `${consentAssets}    <link rel="stylesheet" href="${accessibilityStylesheet}">\n</head>`
    )
    .replace(/<body([^>]*)>/i, `<body$1>\n${consentMarkup}`);

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html);
}

for (const file of publicRootFiles) {
  const destination = path.join(outputDirectory, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(repositoryRoot, file), destination);
}

for (const directory of publicDirectories) {
  await cp(path.join(repositoryRoot, directory), path.join(outputDirectory, directory), {
    recursive: true
  });
}

await rm(path.join(outputDirectory, 'images', 'website-2026', 'README.md'), { force: true });

console.log(`Built ${pageFiles.size} HTML pages in ${relativeOutput}.`);
