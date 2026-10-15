import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testsDirectory, '..');
const outputDirectory = path.join(repositoryRoot, '_site');

function formsIn(html) {
  return [...html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map(([markup]) => {
    const openingTag = markup.match(/<form\b[^>]*>/i)?.[0] || '';
    const hiddenName = markup.match(/name=["']form-name["'][^>]*value=["']([^"']+)/i)?.[1];
    const formName = hiddenName || openingTag.match(/\bname=["']([^"']+)/i)?.[1];
    const fields = [...markup.matchAll(/<(?:input|select|textarea)\b[^>]*\bname=["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((name) => name !== 'form-name');
    return { fields: new Set(fields), formName, markup, openingTag };
  });
}

test('canonical Netlify definitions cover every field submitted by public forms', async () => {
  const detector = await readFile(path.join(repositoryRoot, 'netlify-forms.html'), 'utf8');
  const canonicalForms = new Map(formsIn(detector).map((form) => [form.formName, form]));
  assert.deepEqual([...canonicalForms.keys()], ['offerteaanvraag', 'contactaanvraag']);

  const sitemap = await readFile(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
  const publicPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1);
  });

  for (const page of publicPages) {
    const html = await readFile(path.join(repositoryRoot, page), 'utf8');
    for (const form of formsIn(html)) {
      if (!form.formName || !canonicalForms.has(form.formName)) continue;
      assert.match(form.markup, new RegExp(`name=["']form-name["'][^>]*value=["']${form.formName}["']`));
      const canonical = canonicalForms.get(form.formName);
      for (const field of form.fields) {
        assert.equal(canonical.fields.has(field), true, `${page}: ${form.formName} misses ${field}`);
      }
    }
  }
});

test('built site exposes only the canonical forms to Netlify detection', async () => {
  const entries = await readdir(outputDirectory, { recursive: true, withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => path.join(entry.parentPath, entry.name));
  const detectorPath = path.join(outputDirectory, 'netlify-forms.html');

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    if (htmlFile === detectorPath) {
      assert.equal((html.match(/data-netlify="true"/g) || []).length, 2);
      assert.equal((html.match(/netlify-honeypot="bot-field"/g) || []).length, 2);
      continue;
    }
    assert.doesNotMatch(html, /data-netlify=["']true["']/i, `${htmlFile} redefines a Netlify form`);
    assert.doesNotMatch(html, /netlify-honeypot=/i, `${htmlFile} redefines a honeypot`);
  }
});

test('built visible forms retain matching submission identities', async () => {
  for (const page of ['index.html', 'contact.html', 'constructieberekening.html', 'bouwtekening-laten-maken.html', 'blog.html']) {
    const html = await readFile(path.join(outputDirectory, page), 'utf8');
    for (const form of formsIn(html)) {
      if (!['offerteaanvraag', 'contactaanvraag'].includes(form.formName)) continue;
      const declaredName = form.openingTag.match(/\bname=["']([^"']+)/i)?.[1];
      assert.equal(declaredName, form.formName, `${page} has conflicting form identities`);
    }
  }
});
