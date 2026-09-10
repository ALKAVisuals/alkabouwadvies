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
  for (const relativePath of ['404.html', '_redirects', 'robots.txt', 'sitemap.xml', 'images/favicon.svg']) {
    assert.equal(await exists(path.join(outputDirectory, relativePath)), true, `${relativePath} is missing`);
  }
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
