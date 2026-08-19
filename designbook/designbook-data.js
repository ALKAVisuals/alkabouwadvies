export const designBookConfig = {
  autoplayMs: 6200,
  title: 'Bekijk hoe een ontwerp tot leven komt.',
  subtitle: 'Van eerste idee naar technisch uitgewerkt ontwerp.'
};

const technicalPlan = `
<svg class="tba-db-drawing" viewBox="0 0 640 430" role="img" aria-label="Schematische plattegrond van een woninguitbreiding">
  <g fill="none" stroke="currentColor">
    <rect x="98" y="62" width="438" height="292"/>
    <path d="M98 202h438M252 62v140M398 62v140M186 202v152M402 202v152"/>
    <path d="M402 246h134v108H402z" class="accent"/>
    <path d="M422 273h92v81M252 202a48 48 0 0 1 48 48M186 270a37 37 0 0 0-37 37"/>
    <path d="M98 382h438M98 374v16M536 374v16M70 62v292M62 62h16M62 354h16" class="thin"/>
  </g>
  <g fill="currentColor" font-family="Arial,sans-serif" font-size="11">
    <text x="118" y="92">WOONKAMER</text><text x="280" y="92">EETKAMER</text><text x="427" y="92">KEUKEN</text>
    <text x="285" y="224">HAL</text><text x="425" y="226">UITBOUW</text><text x="277" y="410">11.200 mm</text>
  </g>
</svg>`;

const elevation = `
<svg class="tba-db-drawing" viewBox="0 0 640 430" role="img" aria-label="Schematisch gevelaanzicht">
  <g fill="none" stroke="currentColor">
    <path d="M92 336V177l178-89 178 89v159z"/><path d="M448 336v-112h111v112z" class="accent"/>
    <rect x="135" y="214" width="66" height="80"/><rect x="337" y="214" width="66" height="80"/><rect x="230" y="245" width="76" height="91"/>
    <path d="M468 244h72v92M492 244v92M516 244v92"/><line x1="64" y1="336" x2="580" y2="336"/>
    <path d="M67 365h491M67 357v16M558 357v16" class="thin"/>
  </g>
  <text x="72" y="398" fill="currentColor" font-family="Arial,sans-serif" font-size="11">GEVEL ZUID · NIEUWE SITUATIE</text>
</svg>`;

const section = `
<svg class="tba-db-drawing" viewBox="0 0 640 430" role="img" aria-label="Schematische doorsnede van de woning">
  <g fill="none" stroke="currentColor">
    <path d="M106 337V173l161-86 161 86v164M428 337v-106h111v106"/>
    <path d="M106 173l161 86 161-86M267 87v250"/>
    <path d="M428 231h111v106M428 231l53-37 58 37" class="accent"/>
    <path d="M80 337h485M77 354h491M144 337v-71h83v71M318 337v-71h68v71"/>
    <path d="M575 88v249M567 88h16M567 337h16" class="thin"/>
  </g>
  <g fill="currentColor" font-family="Arial,sans-serif" font-size="11"><text x="82" y="392">DOORSNEDE A-A</text><text x="589" y="220" transform="rotate(-90 589 220)">ca. 5.600 mm</text></g>
</svg>`;

const interiorScene = `
<div class="tba-db-interior" role="img" aria-label="Gestileerde interieurvisualisatie met warme materialen en grote tuinpui">
  <div class="tba-db-window"></div><div class="tba-db-sofa"></div><div class="tba-db-table"></div><div class="tba-db-kitchen"></div>
</div>`;

export const designBookPages = [
  { spread: 1, side: 'left', type: 'text', kicker: '01 — PROJECTINTRO', title: 'Een helder vertrekpunt', copy: 'Een ontwerp begint met de bestaande situatie, de wensen en de ruimtelijke kansen. Die basis bepaalt welke keuzes technisch én visueel logisch zijn.', facts: [['Project','Woninguitbreiding'],['Fase','Concept & ontwerp'],['Doel','Meer licht en tuinrelatie']] },
  { spread: 1, side: 'right', type: 'image', src: 'images/website-2026/projecten/illustratieve-case-aanbouw-rijwoning.webp', alt: 'Illustratieve woninguitbreiding als projectintro' },

  { spread: 2, side: 'left', type: 'text', kicker: '02 — VARIANTEN', title: 'Richting vergelijken', copy: 'Meerdere ontwerpvarianten maken verschillen in uitstraling, volume en materiaalgebruik direct zichtbaar.', facts: [['A','Strak antraciet'],['B','Warm hout'],['C','Metselwerk + hout']] },
  { spread: 2, side: 'right', type: 'gallery', items: [
    ['images/website-2026/diensten/aanbouw-ontwerp-antraciet.webp','Variant A — antraciet'],
    ['images/website-2026/diensten/aanbouw-ontwerp-houten-lamellen.webp','Variant B — houten lamellen'],
    ['images/website-2026/diensten/aanbouw-ontwerp-metselwerk-hout.webp','Variant C — metselwerk en hout']
  ]},

  { spread: 3, side: 'left', type: 'text', kicker: '03 — PLATTEGROND', title: 'Begane grond', copy: 'Functie, looplijnen en maatvoering komen samen in één controleerbare technische basis.', facts: [['Lijn','Bestaand'],['Accent','Nieuwe situatie'],['Presentatie','Schaalvast uitwerken']] },
  { spread: 3, side: 'right', type: 'drawing', html: technicalPlan },

  { spread: 4, side: 'left', type: 'drawing-title', kicker: '04 — GEVEL', title: 'Aanzicht', html: elevation },
  { spread: 4, side: 'right', type: 'drawing-title', kicker: '04 — DOORSNEDE', title: 'Ruimtelijke controle', html: section },

  { spread: 5, side: 'left', type: 'text', kicker: '05 — BOUWDETAIL', title: 'Van lijn naar aansluiting', copy: 'Kritische aansluitingen krijgen extra aandacht zodat materiaalopbouw en uitvoering begrijpelijk worden.', facts: [['Detail','Gevel / fundering'],['Focus','Aansluiting'],['Doel','Technische helderheid']] },
  { spread: 5, side: 'right', type: 'image-contain', src: 'images/website-2026/diensten/erker-fundering-gevelaansluiting-detail.webp', alt: 'Technisch bouwdetail van fundering en gevelaansluiting' },

  { spread: 6, side: 'left', type: 'materials', kicker: '06 — INTERIEUR & MATERIALEN', title: 'Rust in materiaal en licht', copy: 'Materiaalkeuzes ondersteunen de architectuur zonder de technische leesbaarheid te verdringen.' },
  { spread: 6, side: 'right', type: 'html', html: interiorScene },

  { spread: 7, side: 'left', type: 'text', kicker: '07 — EXTERIEUR', title: 'Exterieur impressie', copy: 'De technische keuzes worden vertaald naar een overtuigend totaalbeeld met materiaal, licht en context.' },
  { spread: 7, side: 'right', type: 'image', src: 'images/website-2026/3d-visualisatie-aanbouw-schets-naar-realisatie.webp', alt: '3D-visualisatie van een moderne woningaanbouw' },

  { spread: 8, side: 'left', type: 'cta', kicker: '08 — RESULTAAT', title: 'Van concept naar een helder ontwerp', copy: 'Technisch tekenwerk en visualisatie vormen samen één begrijpelijk ontwerpverhaal.', href: '#contact', cta: 'Bespreek uw bouwplan' },
  { spread: 8, side: 'right', type: 'image', src: 'images/website-2026/projecten/voor-en-na-aanbouw-woning.webp', alt: 'Illustratieve overgang van bestaande woning naar ontwerp met aanbouw' }
];
