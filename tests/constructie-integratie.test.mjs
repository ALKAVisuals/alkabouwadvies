import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const homepage = read('index.html');
const landing = read('constructieberekening.html');
const landingStyles = read('constructieberekening.css');
const contact = read('contact.html');
const about = read('over-ons.html');
const header = read('site-header.js');
const sitemap = read('sitemap.xml');
const relevantServicePages = [
    'aanbouw-uitbouw.html',
    'dakkapel.html',
    'dakopbouw-vergunningen.html',
    'erker.html',
    'nokverhoging.html'
].map(read);

test('the corrected public construction price is used consistently', () => {
    for (const source of [homepage, landing]) {
        assert.match(source, /€399|&euro;399/);
        assert.doesNotMatch(source, /€482,79|&euro;482,79/);
    }
    assert.match(landing, /"price": "399"/);
    assert.match(homepage, /if \(route === 'constructionOnly'\) return \{ including: 399, excluding: 329\.75 \}/);
});

test('shared navigation and footer expose construction as a core service', () => {
    assert.ok(header.includes("'constructieberekening.html'"));
    assert.match(header, /label: 'Constructieberekeningen'/);
    assert.match(header, /function ensureFooterConstructionLink\(\)/);
    assert.match(header, /link\.textContent = 'Constructieberekeningen'/);
    assert.match(header, /filename === 'constructieberekening\.html'/);
    assert.match(header, /Persoonlijk bureau voor bouwtekeningen, constructieberekeningen en vergunningbegeleiding/);
    assert.match(homepage, /Persoonlijk bureau voor bouwtekeningen, constructieberekeningen en vergunningbegeleiding/);
});

test('homepage presents the three modular core services', () => {
    assert.match(homepage, /Drie kerndiensten, afgestemd op uw bouwplan/);
    assert.match(homepage, /<h3>Bouwtekeningen<\/h3>/);
    assert.match(homepage, /<h3>Constructieberekeningen<\/h3>/);
    assert.match(homepage, /<h3>Vergunningbegeleiding<\/h3>/);
    assert.match(homepage, /Kies alleen de ondersteuning die uw project nodig heeft/);
    assert.doesNotMatch(homepage, /data-package-name="Pakket [ABC]/);
    assert.match(homepage, /\.dienst-card::after/);
    assert.match(homepage, /Vanafprijs inclusief btw/);
    assert.doesNotMatch(homepage, /Vanaf, inclusief/);
    assert.match(homepage, /id="btw-toggle"/);
    assert.match(homepage, /data-price-including="250" data-price-excluding="206\.61"/);
    assert.doesNotMatch(homepage, /<div class="prijs-amount">&euro;&#8239;302,50<\/div>/);
});

test('construction visuals and process numbering remain honest and accessible', () => {
    assert.match(landing, /Illustratief constructiebeeld/);
    assert.match(landing, /Illustratieve technische werksituatie/);
    assert.equal((landing.match(/class="construction-process__number" aria-hidden="true"/g) || []).length, 4);
    assert.doesNotMatch(landingStyles, /counter\(process/);
    assert.match(landingStyles, /@media \(min-width: 1021px\) and \(max-height: 800px\)/);
});

test('the service chooser exposes every standalone and combined route', () => {
    const routes = [...new Set([...homepage.matchAll(/data-route="([^"]+)"/g)].map((match) => match[1]))];
    assert.deepEqual(routes, [
        'drawing',
        'constructionOnly',
        'permitOnly',
        'drawingConstruction',
        'drawingPermit',
        'constructionPermit',
        'all',
        'advice'
    ]);
    assert.match(homepage, /Prijs na beoordeling van de scope/);
    assert.match(homepage, /services: \['constructieberekening'\]/);
    assert.doesNotMatch(homepage, /legacyPriceKey/);
    assert.match(homepage, /if \(route !== 'drawing'\) return null/);
});

test('general request forms recognize construction without a parallel lead flow', () => {
    assert.match(contact, /name="diensten\[\]" value="constructieberekening"/);
    assert.doesNotMatch(contact, /name="diensten\[\]" value="constructieve-afstemming"/);
    assert.match(homepage, /<option value="constructieberekening">Constructieberekening<\/option>/);
    assert.match(landing, /<form name="offerteaanvraag"[^>]+data-netlify="true"/);
    assert.match(landing, /name="diensten\[\]" value="constructieberekening"/);
});

test('company positioning, FAQ and crawl paths include construction', () => {
    assert.match(about, /bouwkundig tekenwerk, constructieberekeningen/);
    assert.match(about, /De basisdienst bestaat uit een constructieberekening en een opgesteld constructierapport/);
    assert.match(homepage, /Wat krijg ik bij een constructieberekening\?/);
    assert.match(sitemap, /https:\/\/technischbouwadvies\.nl\/constructieberekening\.html/);
    for (const page of relevantServicePages) {
        assert.match(page, /href="constructieberekening\.html">Bekijk de losse constructieberekening<\/a>/);
    }
});

test('relevant service pages use modular language instead of rigid packages', () => {
    const pages = [
        'aanbouw-uitbouw.html', 'bed-breakfast.html', 'bijgebouw.html', 'dakkapel.html',
        'dakopbouw-vergunningen.html', 'erker.html', 'mantelzorg.html', 'nokverhoging.html',
        'omgevingsvergunning-aanvragen.html', 'carport-vergunning.html',
        'kozijnen-vervangen-vergunning.html'
    ].map(read).join('\n');
    assert.doesNotMatch(pages, /Pakket [ABC]|Alles uit basispakket|Alles uit constructiepakket|Full.?Service Vergunning/);
    assert.match(header, /function addConstructionCrossSell\(\)/);
});

test('homepage structured data remains valid JSON', () => {
    const blocks = [...homepage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(blocks.length, 1);
    for (const block of blocks) assert.doesNotThrow(() => JSON.parse(block[1]));
});
