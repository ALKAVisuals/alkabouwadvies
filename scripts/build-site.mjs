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
      '</head>',
      '    <link rel="stylesheet" href="accessibility-fixes.css?v=20260911-2">\n</head>'
    );

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
