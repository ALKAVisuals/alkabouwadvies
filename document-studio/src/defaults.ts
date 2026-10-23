import type {
  AppState,
  CompanyId,
  CompanySettings,
  DocumentRecord,
  DocType,
  ServiceLine,
} from "./types";
export const todayAmsterdam = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(
    new Date(),
  );
export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
export const uid = () => crypto.randomUUID();
const alkaServices = [
  "Interieurrenders",
  "Exterieurrenders",
  "3D-visualisaties",
  "3D-vloerplannen",
  "Vogelvluchtvisualisaties",
  "Overige werkzaamheden",
];
const tbaServices = [
  "Bouwtekeningen",
  "Constructieberekeningen",
  "Vergunningbegeleiding",
  "Inmeting op locatie",
  "3D-visualisaties",
  "3D-vloerplannen",
  "Extra ontwerpvariant",
  "Extra correctieronde",
  "Digitaliseren van bestaande tekeningen",
  "Aanvullend bouwkundig advies",
];
export const TBA_ADDITIONAL_EXPLANATION =
  "Na keuze van een voorkeursvariant kan Technisch Bouwadvies, indien gewenst, een afzonderlijke offerte uitbrengen voor uitsluitend de werkzaamheden die op dat moment binnen onze dienstverlening vallen. Eventuele werkzaamheden van externe specialisten worden alleen meegenomen indien dit vooraf uitdrukkelijk en schriftelijk is overeengekomen.";
export const settings: Record<CompanyId, CompanySettings> = {
  alka: {
    id: "alka",
    name: "ALKA Visuals",
    legalName: "ALKA Visuals VOF",
    address: "Schutkolk 4D",
    postalCity: "6582 DB Heumen",
    phone: "",
    email: "",
    website: "",
    kvk: "95153756",
    vatId: "NL867022346B01",
    iban: "NL41 RABO 0386 9870 25",
    accountHolder: "Alka Group",
    paymentDays: 14,
    vatRate: 21,
    logo: "/assets/alka-logo.png",
    defaultExclusions: "",
    defaultAdditionalExplanation: "",
    defaultCorrections: "",
    defaultAdditional: "",
    defaultPaymentTerms:
      "Gelieve binnen 14 dagen te betalen onder vermelding van het documentnummer.",
    services: alkaServices,
  },
  tba: {
    id: "tba",
    name: "Technisch Bouwadvies",
    legalName: "Alka Group",
    address: "Schutkolk 4D",
    postalCity: "6582 DB Heumen",
    phone: "06 49 24 04 12",
    email: "info@technischbouwadvies.nl",
    website: "www.technischbouwadvies.nl",
    kvk: "",
    vatId: "",
    iban: "",
    accountHolder: "",
    paymentDays: 14,
    vatRate: 21,
    logo: "/assets/tba-logo.png",
    defaultExclusions: "",
    defaultAdditionalExplanation: TBA_ADDITIONAL_EXPLANATION,
    defaultCorrections:
      "Binnen de aangeboden prijs is een beperkte correctieronde inbegrepen. Deze correctieronde is bedoeld voor kleine opmerkingen, verduidelijkingen en beperkte aanpassingen aan het rapport.",
    defaultAdditional: "",
    defaultPaymentTerms:
      "Betaling dient te geschieden binnen 14 dagen na factuurdatum, tenzij anders is overeengekomen. Na akkoord op deze offerte gaat u tevens akkoord met de algemene voorwaarden van Technisch Bouwadvies.",
    services: tbaServices,
  },
};
export const makeLines = (c: CompanyId): ServiceLine[] =>
  settings[c].services.map((name) => ({
    id: uid(),
    name,
    description: name,
    selected: false,
    quantity: 1,
    unitPrice: 0,
  }));
export const emptyDoc = (
  companyId: CompanyId,
  type: DocType = "offerte",
): DocumentRecord => {
  const date = todayAmsterdam(),
    c = settings[companyId];
  return {
    id: uid(),
    companyId,
    type,
    status: "concept",
    number: "",
    numberManuallySet: false,
    date,
    dueDate: addDays(date, c.paymentDays),
    client: "",
    contact: "",
    clientAddress: "",
    project: "",
    projectAddress: "",
    description: "",
    priceMode: "services",
    lines: makeLines(companyId),
    packagePrice: 0,
    amountsIncludeVat: false,
    vatRate: c.vatRate,
    subtotal: 0,
    vat: 0,
    total: 0,
    paymentStatus: "Openstaand",
    paidDate: "",
    quoteStatus: "Concept",
    acceptedDate: "",
    linkedInvoiceNumber: "",
    notes: "",
    exclusions: c.defaultExclusions,
    additionalExplanation: c.defaultAdditionalExplanation,
    corrections: c.defaultCorrections,
    additionalTerms: c.defaultAdditional,
    paymentTerms: c.defaultPaymentTerms,
    source: "app",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
export const initialState: AppState = {
  version: 3,
  companies: settings,
  documents: [],
  customers: [],
  importFingerprints: [],
  lastBackup: "",
};
