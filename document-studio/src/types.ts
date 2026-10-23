export type CompanyId = "alka" | "tba";
export type DocType = "factuur" | "offerte";
export type PriceMode = "services" | "package";
export type PaymentStatus = "Openstaand" | "Betaald" | "Geannuleerd";
export type QuoteStatus =
  "Concept" | "Verzonden" | "Geaccepteerd" | "Afgewezen" | "Vervallen";
export type CustomerCategory = "particulier" | "bedrijf";

export interface Customer {
  id: string;
  category: CustomerCategory;
  companyName: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  kvk: string;
  vatId: string;
  email: string;
  phone: string;
  notes: string;
  linkedCompanies: CompanyId[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLine {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  quantity: number;
  unitPrice: number;
  quantityText?: string;
  unitPriceText?: string;
  custom?: boolean;
}
export interface CompanySettings {
  id: CompanyId;
  name: string;
  legalName: string;
  address: string;
  postalCity: string;
  phone: string;
  email: string;
  website: string;
  kvk: string;
  vatId: string;
  iban: string;
  accountHolder: string;
  paymentDays: number;
  vatRate: number;
  logo: string;
  defaultExclusions: string;
  defaultAdditionalExplanation: string;
  defaultCorrections: string;
  defaultAdditional: string;
  defaultPaymentTerms: string;
  services: string[];
}
export interface DocumentRecord {
  id: string;
  companyId: CompanyId;
  type: DocType;
  status: "concept" | "issued" | "cancelled";
  number: string;
  numberManuallySet?: boolean;
  date: string;
  dueDate: string;
  client: string;
  customerId?: string;
  contact: string;
  clientAddress: string;
  project: string;
  projectAddress: string;
  description: string;
  priceMode: PriceMode;
  lines: ServiceLine[];
  packagePrice: number;
  amountsIncludeVat: boolean;
  vatRate: number;
  subtotal: number;
  vat: number;
  total: number;
  paymentStatus: PaymentStatus;
  paidDate: string;
  quoteStatus: QuoteStatus;
  acceptedDate: string;
  linkedInvoiceNumber: string;
  notes: string;
  exclusions: string;
  additionalExplanation: string;
  corrections: string;
  additionalTerms: string;
  paymentTerms: string;
  pdfBase64?: string;
  source: "app" | "import";
  createdAt: string;
  updatedAt: string;
}
export interface AppState {
  version: number;
  companies: Record<CompanyId, CompanySettings>;
  documents: DocumentRecord[];
  customers: Customer[];
  importFingerprints: string[];
  lastBackup: string;
}
