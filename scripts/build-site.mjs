import { cp, mkdir, readFile, rm } from 'node:fs/promises';
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
  'css/service-responsive-fixes.css',
  'constructieberekening.css',
  'constructieberekening.js',
  'contact-section.css',
  'contact-section.js',
  'privacy-consent.css',
  'privacy-consent.js',
  'robots.txt',
  'site-footer.css',
  'site-header.css',
  'site-header.js',
  'site-responsive.css',
  'sitemap.xml'
];

const publicDirectories = ['images'];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const pageFile of pageFiles) {
  const source = path.join(repositoryRoot, pageFile);
  const destination = path.join(outputDirectory, pageFile);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
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
