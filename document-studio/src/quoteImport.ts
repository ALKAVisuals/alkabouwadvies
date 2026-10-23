import type { ServiceLine } from "./types";

export interface ParsedQuoteLine {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ParsedQuote {
  client: string;
  contact: string;
  clientAddress: string;
  project: string;
  projectAddress: string;
  description: string;
  lines: ParsedQuoteLine[];
  priceMode: "services" | "package";
  packagePrice: number;
  vatRate?: number;
  warnings: string[];
  usedOcr: boolean;
}

interface ExtractedDocument {
  rows: string[];
  usedOcr: boolean;
}

const moneyPattern =
  /-?\s*€?\s*\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\s*€?\s*\d+(?:[.,]\d{2})/g;
const postcodePattern = /\b[1-9]\d{3}\s?[A-Za-z]{2}\b/;
const datePattern = /^(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}-\d{2}-\d{2})$/;

const clean = (value: string) =>
  value
    .replace(/\u00a0/g, " ")
    .replace(/[ \f\v]+/g, " ")
    .trim();
const plain = (value: string) =>
  clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function normalizeMoneyText(value: string): string {
  return value
    .split("\t")
    .map((part) => {
      const normalizedEuro = part.replace(
        /€\s*([\d\s.,-]+)/g,
        (_, amount: string) => `€ ${amount.replace(/\s/g, "")}`,
      );
      return /^[\d\s.,-]+$/.test(normalizedEuro.trim())
        ? normalizedEuro.replace(/\s/g, "")
        : normalizedEuro;
    })
    .join("\t");
}

function parseMoney(value: string): number {
  const normalized = value
    .replace(/[€\s]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function labelValue(cells: string[], labels: RegExp[]): string {
  for (let index = 0; index < cells.length; index += 1) {
    const cell = clean(cells[index]);
    for (const label of labels) {
      const match = cell.match(label);
      if (!match) continue;
      const inline = clean(match[1] || "");
      if (inline) return inline;
      const next = clean(cells[index + 1] || "");
      if (
        next &&
        !/^(offerte|factuur|datum|project|omschrijving|werkzaamheden)\b/i.test(
          next,
        )
      )
        return next;
    }
  }
  return "";
}

function addressValue(cells: string[], labels: RegExp[]): string {
  for (let index = 0; index < cells.length; index += 1) {
    const cell = clean(cells[index]);
    for (const label of labels) {
      const match = cell.match(label);
      if (!match) continue;
      const values: string[] = [];
      if (clean(match[1] || "")) values.push(clean(match[1]));
      for (
        let cursor = index + 1;
        cursor < Math.min(cells.length, index + 4);
        cursor += 1
      ) {
        const next = clean(cells[cursor]);
        if (
          !next ||
          /^(opdrachtgever|contact|project|offerte|factuur|datum|omschrijving)\b/i.test(
            next,
          )
        )
          break;
        if (
          !values.length ||
          postcodePattern.test(next) ||
          /^(nederland|netherlands)$/i.test(next)
        )
          values.push(next);
        else break;
      }
      return values.join("\n");
    }
  }
  return "";
}

function recipientBlock(rows: string[]) {
  const start = rows.findIndex((row) =>
    /^(offerte|factuur) aan$/i.test(clean(row.split("\t")[0])),
  );
  if (start < 0) return { client: "", contact: "", address: "" };

  const block: string[] = [];
  for (
    let index = start + 1;
    index < Math.min(rows.length, start + 10);
    index += 1
  ) {
    const value = clean(rows[index].split("\t")[0]);
    if (!value) continue;
    if (
      /^(offerte|factuur)(nummer)?\b/i.test(value) ||
      /^project\b/i.test(value) ||
      datePattern.test(value)
    )
      break;
    block.push(value);
  }

  let client = "";
  let contact = "";
  const address: string[] = [];
  for (const value of block) {
    if (/^t\.?a\.?v\.?\s+/i.test(value)) {
      contact = value.replace(/^t\.?a\.?v\.?\s+/i, "").trim();
    } else if (
      postcodePattern.test(value) ||
      /\d/.test(value) ||
      /^(nederland|netherlands)$/i.test(value)
    ) {
      address.push(value);
    } else if (!client) {
      client = value;
    } else if (!contact) {
      contact = value;
    }
  }
  return { client, contact, address: address.join("\n") };
}

function sectionText(rows: string[], headings: RegExp[]): string {
  const index = rows.findIndex((row) =>
    headings.some((heading) => heading.test(clean(row))),
  );
  if (index < 0) return "";
  const values: string[] = [];
  for (
    let cursor = index + 1;
    cursor < Math.min(rows.length, index + 8);
    cursor += 1
  ) {
    const value = clean(rows[cursor]);
    if (!value) continue;
    if (
      /omschrijving.*aantal|werkzaamheden.*aantal|subtotaal|btw\s*\(?\d|totaal incl/i.test(
        value,
      )
    )
      break;
    values.push(value.replace(/\t+/g, " "));
  }
  return values.join("\n");
}

function parseServiceRows(rows: string[]): ParsedQuoteLine[] {
  const parsed: ParsedQuoteLine[] = [];
  let quantityOnlyTable = false;
  for (const raw of rows) {
    const row = clean(normalizeMoneyText(raw));
    if (!row) continue;
    if (/^(omschrijving|werkzaamheden)\b/i.test(row)) {
      quantityOnlyTable =
        /aantal/i.test(row) && !/prijs|bedrag|totaal/i.test(row);
      continue;
    }
    if (/^(subtotaal|btw|totaal)/i.test(row)) {
      quantityOnlyTable = false;
      continue;
    }
    const matches = [...row.matchAll(moneyPattern)];
    if (matches.length >= 2) {
      const prefix = clean(row.slice(0, matches[0].index));
      const quantityMatch = prefix.match(
        /^(.*?)(?:\s+|\t)(-?\d+(?:[.,]\d+)?)$/,
      );
      if (!quantityMatch) continue;
      const description = clean(quantityMatch[1]);
      if (!description || /^(datum|nummer|offerte|factuur)/i.test(description))
        continue;
      const quantity = Number(quantityMatch[2].replace(",", "."));
      let unitPrice = parseMoney(matches[0][0]);
      if (/korting|discount/i.test(description))
        unitPrice = -Math.abs(unitPrice);
      parsed.push({
        name: description,
        description,
        quantity: Number.isFinite(quantity) ? quantity : 1,
        unitPrice,
      });
      continue;
    }

    if (quantityOnlyTable) {
      const quantityOnly = row.match(/^(.*?)(?:\s+|\t)(\d+(?:[.,]\d+)?)$/);
      if (quantityOnly) {
        const description = clean(quantityOnly[1]);
        parsed.push({
          name: description,
          description,
          quantity: Number(quantityOnly[2].replace(",", ".")),
          unitPrice: 0,
        });
        continue;
      }
    }

    if (/korting|discount/i.test(row) && matches.length === 1) {
      const description = clean(row.slice(0, matches[0].index)) || "Korting";
      parsed.push({
        name: description,
        description,
        quantity: 1,
        unitPrice: -Math.abs(parseMoney(matches[0][0])),
      });
    } else if (
      parsed.length &&
      matches.length < 2 &&
      !/^(omschrijving|werkzaamheden|subtotaal|btw|totaal|contactgegevens|betalingsvoorwaarden)\b/i.test(
        row,
      )
    ) {
      const detail = clean(row.replace(/\t+inbegrepen$/i, ""));
      if (detail && !/^inbegrepen$/i.test(detail))
        parsed.at(-1)!.description += ` - ${detail}`;
    }
  }
  return parsed;
}

function amountAfter(rows: string[], pattern: RegExp): number | undefined {
  for (let index = 0; index < rows.length; index += 1) {
    const row = normalizeMoneyText(rows[index]);
    if (!pattern.test(plain(row))) continue;
    const amounts = [...row.matchAll(moneyPattern)];
    if (amounts.length) return parseMoney(amounts.at(-1)![0]);
    for (
      let cursor = index + 1;
      cursor < Math.min(rows.length, index + 3);
      cursor += 1
    ) {
      const following = normalizeMoneyText(rows[cursor]);
      const followingAmounts = [...following.matchAll(moneyPattern)];
      if (followingAmounts.length)
        return parseMoney(followingAmounts.at(-1)![0]);
    }
  }
  return undefined;
}

export function parseQuoteText(rows: string[], usedOcr = false): ParsedQuote {
  const cleanedRows = rows.map(clean).filter(Boolean);
  const cells = cleanedRows.flatMap((row) =>
    row.split("\t").map(clean).filter(Boolean),
  );
  const recipient = recipientBlock(cleanedRows);

  const client =
    labelValue(cells, [
      /^opdrachtgever\s*[:\-]?\s*(.*)$/i,
      /^klant(?:naam)?\s*[:\-]?\s*(.*)$/i,
      /^customer\s*[:\-]?\s*(.*)$/i,
    ]) || recipient.client;
  const contact =
    labelValue(cells, [
      /^contactpersoon\s*[:\-]?\s*(.*)$/i,
      /^contact\s*[:\-]?\s*(.*)$/i,
      /^t\.?a\.?v\.?\s*[:\-]?\s*(.*)$/i,
    ]) || recipient.contact;
  const clientAddress =
    addressValue(cells, [
      /^(?:adres opdrachtgever|factuuradres|klantadres|adres)\s*[:\-]?\s*(.*)$/i,
    ]) || recipient.address;
  const projectAddress = addressValue(cells, [
    /^projectadres\s*[:\-]?\s*(.*)$/i,
    /^locatie\s*[:\-]?\s*(.*)$/i,
  ]);
  const project = labelValue(cells, [
    /^projectnaam\s*[:\-]?\s*(.*)$/i,
    /^project\s*[:\-]\s*(.*)$/i,
    /^project\s+(.+)$/i,
  ]);
  const description = sectionText(cleanedRows, [
    /^omschrijving(?: opdracht)?$/i,
    /^werkzaamheden$/i,
    /^opdrachtomschrijving$/i,
  ]);
  const lines = parseServiceRows(cleanedRows);
  const explicitPackage = amountAfter(
    cleanedRows,
    /pakketprijs|package price|afgesproken totaalprijs/,
  );
  const subtotal = amountAfter(cleanedRows, /^subtotaal\b|totaal excl/);
  const statedTotal = amountAfter(cleanedRows, /totaal.*incl/);
  const vatCell = cells.find(
    (cell) => /btw|vat/i.test(cell) && /\d+(?:[.,]\d+)?\s*%/.test(cell),
  );
  const vatRateMatch = vatCell?.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const vatRate = vatRateMatch
    ? Number(vatRateMatch[1].replace(",", "."))
    : undefined;
  const hasPricedLines = lines.some((line) => line.unitPrice !== 0);
  const priceMode =
    explicitPackage !== undefined || (!hasPricedLines && subtotal !== undefined)
      ? "package"
      : "services";
  const packagePrice =
    explicitPackage ?? (priceMode === "package" ? subtotal || 0 : 0);
  const warnings: string[] = [];

  if (usedOcr)
    warnings.push(
      "Deze offerte is met lokale OCR uitgelezen. Controleer namen en bedragen extra zorgvuldig.",
    );
  if (!client) warnings.push("Opdrachtgever niet met zekerheid herkend.");
  if (!project) warnings.push("Projectnaam niet met zekerheid herkend.");
  if (!lines.length && !packagePrice)
    warnings.push("Geen betrouwbare dienstregels of pakketprijs gevonden.");
  if (lines.length && subtotal !== undefined && priceMode === "services") {
    const lineTotal =
      Math.round(
        lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) *
          100,
      ) / 100;
    if (Math.abs(lineTotal - subtotal) > 0.02)
      warnings.push(
        `Som van de herkende regels (€ ${lineTotal.toFixed(2)}) wijkt af van het subtotaal (€ ${subtotal.toFixed(2)}).`,
      );
  }
  if (
    subtotal !== undefined &&
    statedTotal !== undefined &&
    vatRate !== undefined
  ) {
    const expected = Math.round(subtotal * (1 + vatRate / 100) * 100) / 100;
    if (Math.abs(expected - statedTotal) > 0.02)
      warnings.push(
        "Subtotaal, btw-percentage en totaalbedrag sluiten niet op elkaar aan.",
      );
  }

  return {
    client,
    contact,
    clientAddress,
    project,
    projectAddress,
    description,
    lines,
    priceMode,
    packagePrice,
    vatRate,
    warnings,
    usedOcr,
  };
}

export function mergeImportedLines(
  existing: ServiceLine[],
  imported: ParsedQuoteLine[],
  makeId: () => string,
): ServiceLine[] {
  const normalized = (value: string) => plain(value).replace(/[^a-z0-9]/g, "");
  const unused = [...imported];
  const merged = existing.map((line) => {
    const lineName = normalized(line.name);
    const index = unused.findIndex((candidate) => {
      const candidateName = normalized(candidate.name);
      return (
        candidateName === lineName ||
        candidateName.includes(lineName) ||
        lineName.includes(candidateName)
      );
    });
    if (index < 0)
      return {
        ...line,
        selected: false,
        quantity: 1,
        unitPrice: 0,
        quantityText: undefined,
        unitPriceText: undefined,
      };
    const [match] = unused.splice(index, 1);
    return {
      ...line,
      selected: true,
      description: match.description,
      quantity: match.quantity,
      unitPrice: match.unitPrice,
      quantityText: undefined,
      unitPriceText: undefined,
    };
  });
  return [
    ...merged,
    ...unused.map((line) => ({
      id: makeId(),
      ...line,
      selected: true,
      custom: true,
    })),
  ];
}

function joinPdfItems(
  items: Array<{ str: string; transform: number[]; width?: number }>,
): string[] {
  const rows = new Map<
    number,
    Array<{ text: string; x: number; width: number }>
  >();
  for (const item of items) {
    const text = clean(item.str);
    if (!text) continue;
    const y = Math.round(item.transform[5] / 3) * 3;
    const row = rows.get(y) || [];
    row.push({ text, x: item.transform[4], width: item.width || 0 });
    rows.set(y, row);
  }
  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) => {
      const ordered = row.sort((a, b) => a.x - b.x);
      const segments: string[] = [];
      let segment = "";
      let end = -Infinity;
      for (const item of ordered) {
        if (segment && item.x - end > 22) {
          segments.push(clean(segment));
          segment = "";
        }
        segment += `${segment ? " " : ""}${item.text}`;
        end = item.x + item.width;
      }
      if (segment) segments.push(clean(segment));
      return segments.join("\t");
    })
    .filter(Boolean);
}

async function ocrPage(page: any): Promise<string[]> {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("De scan kon niet worden gerenderd.");
  await page.render({ canvasContext: context, viewport }).promise;
  const { createWorker, OEM } = await import("tesseract.js");
  const origin = window.location.origin;
  const worker = await createWorker(["nld", "eng"], OEM.LSTM_ONLY, {
    workerPath: `${origin}/ocr/worker.min.js`,
    corePath: `${origin}/ocr/tesseract-core-lstm.wasm.js`,
    langPath: `${origin}/ocr`,
    gzip: true,
  });
  try {
    const result = await worker.recognize(canvas);
    return result.data.text.split(/\r?\n/).map(clean).filter(Boolean);
  } finally {
    await worker.terminate();
  }
}

async function extractPdf(file: File): Promise<ExtractedDocument> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const document = await pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  }).promise;
  const rows: string[] = [];
  let usedOcr = false;
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageRows = joinPdfItems(
      content.items.filter((item: any) => typeof item.str === "string") as any,
    );
    if (pageRows.join(" ").replace(/\s/g, "").length < 35) {
      rows.push(...(await ocrPage(page)));
      usedOcr = true;
    } else {
      rows.push(...pageRows);
    }
  }
  return { rows, usedOcr };
}

async function extractDocx(file: File): Promise<ExtractedDocument> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({
    arrayBuffer: await file.arrayBuffer(),
  });
  const html = new DOMParser().parseFromString(result.value, "text/html");
  const rows: string[] = [];
  for (const element of [...html.body.children]) {
    if (element.tagName === "TABLE") {
      for (const row of [...element.querySelectorAll("tr")]) {
        rows.push(
          [...row.querySelectorAll("th,td")]
            .map((cell) => clean(cell.textContent || ""))
            .filter(Boolean)
            .join("\t"),
        );
      }
    } else {
      const value = clean(element.textContent || "");
      if (value) rows.push(value);
    }
  }
  return { rows, usedOcr: false };
}

export async function importQuoteFile(file: File): Promise<ParsedQuote> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "docx")
    throw new Error("Kies een PDF- of DOCX-bestand.");
  const extracted =
    extension === "pdf" ? await extractPdf(file) : await extractDocx(file);
  if (!extracted.rows.join("").trim())
    throw new Error(
      "Er kon geen leesbare tekst in deze offerte worden gevonden.",
    );
  return parseQuoteText(extracted.rows, extracted.usedOcr);
}
