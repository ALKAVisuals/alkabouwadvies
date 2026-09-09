import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const page = fs.readFileSync(new URL('../constructieberekening.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../constructieberekening.js', import.meta.url), 'utf8');
const style = fs.readFileSync(new URL('../constructieberekening.css', import.meta.url), 'utf8');
const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');

test('construction landing page has focused SEO metadata and one primary heading', () => {
    assert.match(page, /<title>Constructieberekening laten maken \| Technisch Bouwadvies<\/title>/);
    assert.match(page, /<link rel="canonical" href="https:\/\/technischbouwadvies\.nl\/constructieberekening\.html">/);
    assert.equal((page.match(/<h1[ >]/g) || []).length, 1);
    assert.match(page, /Constructie&shy;berekening nodig voor uw verbouwing\?/);
    assert.match(page, /"@type": "Service"/);
    assert.match(sitemap, /https:\/\/technischbouwadvies\.nl\/constructieberekening\.html/);
});

test('public scope and price are accurate without timing or permit guarantees', () => {
    assert.match(page, /€399/);
    assert.doesNotMatch(page, /€482,79|€399 excl\. btw/);
    assert.match(page, /constructieberekening en een duidelijk opgesteld constructierapport/i);
    assert.match(page, /Een constructietekening, principeschets of uitvoeringstekening is niet standaard inbegrepen/);
    assert.doesNotMatch(page, /binnen 24 uur|binnen 3 werkdagen|gegarandeerde reactietijd|gegarandeerde vergunning|vergunning altijd haalbaar/i);
});

test('the existing header, footer and brand assets are reused', () => {
    assert.match(page, /<link rel="stylesheet" href="site-header\.css">/);
    assert.match(page, /<link rel="stylesheet" href="site-footer\.css\?v=20260808-2">/);
    assert.match(page, /<header class="tba-site-header" data-tba-header>/);
    assert.match(page, /<script src="site-header\.js" defer><\/script>/);
    assert.match(page, /<footer>[\s\S]*KVK: 95153756[\s\S]*<\/footer>/i);
});

test('six-step form uses the established Netlify lead channel and dashboard field names', () => {
    assert.equal((page.match(/data-form-step/g) || []).length, 6);
    assert.match(page, /<form name="offerteaanvraag"[^>]+data-netlify="true"[^>]+netlify-honeypot="bot-field"/);
    for (const name of ['projecttype', 'postcode', 'gemeente', 'situatie', 'projectomschrijving', 'bestaandetekeningen', 'pakketadvies', 'naam', 'email', 'telefoon', 'privacy-akkoord']) {
        assert.match(page, new RegExp(`name="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    }
    assert.match(page, /name="diensten\[\]" value="constructieberekening"/);
});

test('uploads are restricted to the existing two-field Netlify flow', () => {
    assert.equal((page.match(/type="file"/g) || []).length, 2);
    assert.match(page, /accept="application\/pdf,image\/jpeg,image\/png,\.pdf,\.jpg,\.jpeg,\.png"/);
    assert.doesNotMatch(page, /\.dwg|\.dxf|\.exe/i);
    assert.match(script, /maxCombinedBytes = 7 \* 1024 \* 1024/);
    assert.match(script, /allowedMimeTypes = new Set\(\['application\/pdf', 'image\/jpeg', 'image\/png'\]\)/);
    assert.match(style, /\.tba-honeypot[^}]+clip: rect\(0 0 0 0\)/);
});

test('lead event fires once only after a successful submission', () => {
    const responseCheck = script.indexOf("if (!response.ok) throw new Error('Netlify Forms gaf geen succesvolle status terug.');");
    const leadEvent = script.indexOf("window.tbaTrackLead('offerteaanvraag')");
    assert.ok(responseCheck >= 0 && leadEvent > responseCheck);
    assert.match(script, /if \(submissionPending\) return/);
    assert.match(script, /submissionPending = true/);
    assert.equal((script.match(/window\.tbaTrackLead\('offerteaanvraag'\)/g) || []).length, 1);
});

test('mobile form and reduced-motion rules are present', () => {
    assert.match(style, /@media \(max-width: 680px\)/);
    assert.match(style, /\.construction-choice-grid \{ grid-template-columns: 1fr; \}/);
    assert.match(style, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(page, /role="status" aria-live="polite"/);
});
