import type { AppState, CompanyId, DocType, DocumentRecord } from "./types";
export function calculate(doc: DocumentRecord) {
  let net =
    doc.priceMode === "package"
      ? finite(doc.packagePrice)
      : doc.lines
          .filter((l) => l.selected)
          .reduce(
            (sum, line) => sum + finite(line.quantity) * finite(line.unitPrice),
            0,
          );
  const rate = Number(doc.vatRate || 0) / 100;
  if (doc.amountsIncludeVat) {
    const gross = net;
    net = gross / (1 + rate);
    return {
      subtotal: round(net),
      vat: round(gross - net),
      total: round(gross),
    };
  }
  return {
    subtotal: round(net),
    vat: round(net * rate),
    total: round(net * (1 + rate)),
  };
}
const finite = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
export function parseNumericInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}
export function hasDuplicateNumber(
  state: AppState,
  document: Pick<DocumentRecord, "id" | "companyId" | "type">,
  number: string,
) {
  const normalized = number.trim().toLocaleUpperCase("nl-NL");
  return state.documents.some(
    (item) =>
      item.id !== document.id &&
      item.companyId === document.companyId &&
      item.status === "issued" &&
      item.number.trim().toLocaleUpperCase("nl-NL") === normalized,
  );
}
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const suffix = (n: number) => {
  let s = "";
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
};
export function nextNumber(
  state: AppState,
  companyId: CompanyId,
  type: DocType,
  date: string,
) {
  const compact = date.split("-").reverse().join("");
  const prefix = type === "factuur" ? "F" : "O";
  const used = new Set(
    state.documents
      .filter(
        (d) =>
          d.companyId === companyId &&
          d.type === type &&
          d.status !== "concept" &&
          d.date === date,
      )
      .map((d) => d.number),
  );
  let i = 0,
    candidate = "";
  do {
    candidate = `${prefix}-${compact}-${suffix(i++)}`;
  } while (used.has(candidate));
  return candidate;
}
export function markPaid(doc: DocumentRecord, date: string): DocumentRecord {
  return {
    ...doc,
    paymentStatus: "Betaald",
    paidDate: date,
    updatedAt: new Date().toISOString(),
  };
}
export function totals(documents: DocumentRecord[]) {
  const invoices = documents.filter(
    (d) => d.type === "factuur" && d.status === "issued",
  );
  const quotes = documents.filter(
    (d) => d.type === "offerte" && d.status === "issued",
  );
  const open = invoices.filter((d) => d.paymentStatus !== "Betaald");
  const paid = invoices.filter((d) => d.paymentStatus === "Betaald");
  return {
    openCount: open.length,
    openTotal: open.reduce((s, d) => s + d.total, 0),
    paidTotal: paid.reduce((s, d) => s + d.total, 0),
    revenue: invoices.reduce((s, d) => s + d.subtotal, 0),
    vat: invoices.reduce((s, d) => s + d.vat, 0),
    quoteCount: quotes.length,
    quoteTotal: quotes.reduce((s, d) => s + d.total, 0),
  };
}
