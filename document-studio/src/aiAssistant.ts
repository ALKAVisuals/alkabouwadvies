import { invoke } from "@tauri-apps/api/core";
import { addDays, emptyDoc, uid } from "./defaults";
import { customerAddress, customerContact, customerName } from "./customers";
import type {
  AppState,
  Customer,
  CustomerCategory,
  DocumentRecord,
  DocType,
  ServiceLine,
} from "./types";

export type AiRole = "user" | "assistant";
export interface AiMessage {
  role: AiRole;
  content: string;
}
export interface OllamaStatus {
  connected: boolean;
  modelAvailable: boolean;
  model: string;
  message: string;
}
export interface AiDiagnostics {
  requestId: string;
  requestCount: number;
  totalMs: number;
  ollamaRequestMs: number;
  promptTokens: number;
  generatedTokens: number;
  promptEvalMs: number;
  generationMs: number;
  loadMs: number;
  retries: number;
  timedOut: boolean;
  cancelled: boolean;
  jsonValidationMs?: number;
  formApplyMs?: number;
}
export interface AiCustomerData {
  existing_query: string | null;
  category: CustomerCategory | null;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  kvk: string | null;
  vat_id: string | null;
}
export interface AiLineAction {
  action: "add" | "update" | "remove" | "move_to_exclusions";
  match: string | null;
  description: string | null;
  quantity: number | string | null;
  unit_price: number | null;
  price_includes_vat: boolean;
  optional: boolean;
}
export interface AiPlan {
  intent: "offerte" | "factuur" | "update" | "clarify";
  new_document: boolean;
  customer: AiCustomerData;
  document: {
    project: string | null;
    project_address: string | null;
    description: string | null;
    exclusions: string | null;
    additional_explanation: string | null;
    corrections: string | null;
    additional_terms: string | null;
    payment_terms: string | null;
    price_mode: "services" | "package" | null;
    package_price: number | null;
    package_price_includes_vat: boolean;
    vat_rate: number | null;
  };
  line_actions: AiLineAction[];
  reference_quote_query: string | null;
  missing: string[];
  questions: string[];
  summary: string;
  confidence: number;
}

const textOrNull = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;
const numberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const stringList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export function parseAiPlan(raw: string): AiPlan {
  let value: Record<string, unknown>;
  try {
    value = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("De lokale AI gaf geen geldige gestructureerde uitvoer.");
  }
  const intent = ["offerte", "factuur", "update", "clarify"].includes(
    String(value.intent),
  )
    ? (value.intent as AiPlan["intent"])
    : "clarify";
  const sourceCustomer = (value.customer || {}) as Record<string, unknown>;
  const category = ["particulier", "bedrijf"].includes(
    String(sourceCustomer.category),
  )
    ? (sourceCustomer.category as CustomerCategory)
    : null;
  const sourceDocument = (value.document || {}) as Record<string, unknown>;
  const priceMode = ["services", "package"].includes(
    String(sourceDocument.price_mode),
  )
    ? (sourceDocument.price_mode as "services" | "package")
    : null;
  const lineActions = Array.isArray(value.line_actions)
    ? value.line_actions.flatMap((candidate) => {
        if (!candidate || typeof candidate !== "object") return [];
        const line = candidate as Record<string, unknown>;
        if (
          !["add", "update", "remove", "move_to_exclusions"].includes(
            String(line.action),
          )
        )
          return [];
        return [
          {
            action: line.action as AiLineAction["action"],
            match: textOrNull(line.match),
            description: textOrNull(line.description),
            quantity:
              typeof line.quantity === "number" ||
              typeof line.quantity === "string"
                ? line.quantity
                : null,
            unit_price: numberOrNull(line.unit_price),
            price_includes_vat: line.price_includes_vat === true,
            optional: line.optional === true,
          },
        ];
      })
    : [];
  const confidence = numberOrNull(value.confidence) ?? 0;
  return {
    intent,
    new_document: value.new_document === true,
    customer: {
      existing_query: textOrNull(sourceCustomer.existing_query),
      category,
      company_name: textOrNull(sourceCustomer.company_name),
      first_name: textOrNull(sourceCustomer.first_name),
      last_name: textOrNull(sourceCustomer.last_name),
      street: textOrNull(sourceCustomer.street),
      house_number: textOrNull(sourceCustomer.house_number),
      postal_code: textOrNull(sourceCustomer.postal_code),
      city: textOrNull(sourceCustomer.city),
      country: textOrNull(sourceCustomer.country),
      email: textOrNull(sourceCustomer.email),
      phone: textOrNull(sourceCustomer.phone),
      kvk: textOrNull(sourceCustomer.kvk),
      vat_id: textOrNull(sourceCustomer.vat_id),
    },
    document: {
      project: textOrNull(sourceDocument.project),
      project_address: textOrNull(sourceDocument.project_address),
      description: textOrNull(sourceDocument.description),
      exclusions: textOrNull(sourceDocument.exclusions),
      additional_explanation: textOrNull(
        sourceDocument.additional_explanation,
      ),
      corrections: textOrNull(sourceDocument.corrections),
      additional_terms: textOrNull(sourceDocument.additional_terms),
      payment_terms: textOrNull(sourceDocument.payment_terms),
      price_mode: priceMode,
      package_price: numberOrNull(sourceDocument.package_price),
      package_price_includes_vat:
        sourceDocument.package_price_includes_vat === true,
      vat_rate: numberOrNull(sourceDocument.vat_rate),
    },
    line_actions: lineActions,
    reference_quote_query: textOrNull(value.reference_quote_query),
    missing: stringList(value.missing),
    questions: stringList(value.questions).filter(
      (question) => question.includes(" ") && !/^[a-z_]+$/i.test(question),
    ),
    summary: textOrNull(value.summary) || "Opdracht verwerkt.",
    confidence: Math.max(0, Math.min(1, confidence)),
  };
}

const normalized = (value = "") =>
  value
    .toLocaleLowerCase("nl-NL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function findCustomers(customers: Customer[], query: string) {
  const needle = normalized(query);
  if (!needle) return [];
  const exact = customers.filter((customer) =>
    [customerName(customer), customer.companyName, customerContact(customer)]
      .map(normalized)
      .includes(needle),
  );
  if (exact.length) return exact;
  return customers.filter((customer) =>
    normalized(
      `${customerName(customer)} ${customerContact(customer)} ${customer.companyName} ${customer.city} ${customer.email}`,
    ).includes(needle),
  );
}

export function findQuotes(documents: DocumentRecord[], query: string) {
  const needle = normalized(query);
  return documents.filter(
    (document) =>
      document.companyId === "tba" &&
      document.type === "offerte" &&
      document.status !== "cancelled" &&
      normalized(
        `${document.number} ${document.client} ${document.contact} ${document.project} ${document.projectAddress}`,
      ).includes(needle),
  );
}

function mentioned(source: string, value: string | null) {
  return Boolean(value && normalized(source).includes(normalized(value)));
}

function customerFormData(data: AiCustomerData, sourceMessage: string) {
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
  const address = [
    [
      mentioned(sourceMessage, data.street) ? data.street : null,
      mentioned(sourceMessage, data.house_number) ? data.house_number : null,
    ]
      .filter(Boolean)
      .join(" "),
    [
      mentioned(sourceMessage, data.postal_code) ? data.postal_code : null,
      mentioned(sourceMessage, data.city) ? data.city : null,
    ]
      .filter(Boolean)
      .join(" "),
    mentioned(sourceMessage, data.country) ? data.country : null,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    client: data.category === "bedrijf" ? data.company_name || name : name,
    contact: data.category === "bedrijf" ? name : "",
    clientAddress: address,
  };
}

function cloneQuoteAsInvoice(quote: DocumentRecord, current: DocumentRecord) {
  return {
    ...quote,
    id: current.id,
    type: "factuur" as const,
    status: "concept" as const,
    number: current.number,
    numberManuallySet: current.numberManuallySet,
    date: current.date,
    dueDate: current.dueDate,
    paymentStatus: "Openstaand" as const,
    paidDate: "",
    quoteStatus: "Concept" as const,
    linkedInvoiceNumber: "",
    pdfBase64: undefined,
    lines: quote.lines.map((line) => ({ ...line, id: uid() })),
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

const lineMatches = (line: ServiceLine, query: string | null) => {
  if (!query) return false;
  const needle = normalized(query);
  return normalized(`${line.name} ${line.description}`).includes(needle);
};

function netPrice(price: number, includesVat: boolean, vatRate: number) {
  if (!includesVat || vatRate <= 0) return price;
  return Math.round((price / (1 + vatRate / 100)) * 100) / 100;
}

export interface ApplyAiResult {
  document: DocumentRecord;
  applied: boolean;
  changes: string[];
  warnings: string[];
  needsClarification: string[];
  preparedCustomer: boolean;
}

export function applyAiPlan(
  plan: AiPlan,
  current: DocumentRecord,
  state: AppState,
  sourceMessage = "",
): ApplyAiResult {
  const questions = plan.intent === "clarify" ? [...plan.questions] : [];
  const warnings: string[] = [];
  if (plan.intent === "clarify" || plan.confidence < 0.55) {
    return {
      document: current,
      applied: false,
      changes: [],
      warnings,
      needsClarification: questions.length
        ? questions
        : ["De opdracht is nog niet duidelijk genoeg om veilig toe te passen."],
      preparedCustomer: false,
    };
  }
  let document = current;
  const changes: string[] = [];
  let preparedCustomer = false;

  if (plan.reference_quote_query) {
    const quotes = findQuotes(state.documents, plan.reference_quote_query);
    if (quotes.length !== 1) {
      const detail = quotes.length
        ? `Meerdere offertes passen bij “${plan.reference_quote_query}”: ${quotes.map((quote) => quote.number || quote.project).join(", ")}. Welke bedoel je?`
        : `Ik kon geen offerte vinden voor “${plan.reference_quote_query}”.`;
      return {
        document: current,
        applied: false,
        changes: [],
        warnings,
        needsClarification: [detail],
        preparedCustomer: false,
      };
    }
    document = cloneQuoteAsInvoice(quotes[0], current);
    changes.push(`Offerte ${quotes[0].number || quotes[0].project} overgenomen`);
  } else if (plan.new_document) {
    const type: DocType = plan.intent === "factuur" ? "factuur" : "offerte";
    const fresh = emptyDoc("tba", type);
    document = {
      ...fresh,
      date: current.date,
      dueDate: addDays(current.date, state.companies.tba.paymentDays),
    };
    changes.push(`Nieuw ${type}concept geopend`);
  } else if (plan.intent === "offerte" || plan.intent === "factuur") {
    document = { ...document, type: plan.intent };
    changes.push(`${plan.intent === "factuur" ? "Factuur" : "Offerte"} geselecteerd`);
  }

  const explicitlyNewCustomer =
    /\b(?:nieuwe|nieuw)\s+(?:klant|opdrachtgever)\b/i.test(sourceMessage);
  if (plan.customer.existing_query && !explicitlyNewCustomer) {
    const matches = findCustomers(state.customers, plan.customer.existing_query);
    if (matches.length !== 1) {
      const detail = matches.length
        ? `Meerdere klanten passen bij “${plan.customer.existing_query}”: ${matches.map(customerName).join(", ")}. Welke bedoel je?`
        : `Geen bestaande klant gevonden voor “${plan.customer.existing_query}”. Geef aanvullende klantgegevens.`;
      return {
        document: current,
        applied: false,
        changes: [],
        warnings,
        needsClarification: [detail],
        preparedCustomer: false,
      };
    }
    const customer = matches[0];
    document = {
      ...document,
      customerId: customer.id,
      client: customerName(customer),
      contact: customerContact(customer),
      clientAddress: customerAddress(customer),
    };
    changes.push(`Klant ${customerName(customer)} geselecteerd`);
  } else {
    const form = customerFormData(plan.customer, sourceMessage);
    if (form.client || form.contact || form.clientAddress) {
      document = {
        ...document,
        ...(form.client ? { client: form.client } : {}),
        ...(form.contact ? { contact: form.contact } : {}),
        ...(form.clientAddress ? { clientAddress: form.clientAddress } : {}),
        customerId: undefined,
      };
      preparedCustomer = true;
      changes.push("Nieuwe klantgegevens voorbereid (nog niet opgeslagen)");
    }
  }

  const fieldMap: Array<[keyof AiPlan["document"], keyof DocumentRecord, string]> = [
    ["project", "project", "Projectnaam"],
    ["project_address", "projectAddress", "Projectadres"],
    ["description", "description", "Opdrachtomschrijving"],
    ["exclusions", "exclusions", "Niet inbegrepen"],
    ["additional_explanation", "additionalExplanation", "Aanvullende toelichting"],
    ["corrections", "corrections", "Correctierondes"],
    ["additional_terms", "additionalTerms", "Aanvullende afspraken"],
    ["payment_terms", "paymentTerms", "Betalingsvoorwaarden"],
  ];
  for (const [source, target, label] of fieldMap) {
    const value = plan.document[source];
    if (typeof value === "string" && value.trim()) {
      const relevantPattern: Partial<
        Record<keyof AiPlan["document"], RegExp>
      > = {
        exclusions: /niet inbegrepen|uitgesloten|buiten (?:deze )?opdracht/i,
        additional_explanation: /aanvullende toelichting|toelichting toevoegen/i,
        corrections: /correctieronde|correctie/i,
        additional_terms: /aanvullende afspraak|extra afspraak/i,
        payment_terms: /betalingsvoorwaarde|betalingstermijn|binnen \d+ dagen/i,
      };
      if (
        relevantPattern[source] &&
        (!sourceMessage || !relevantPattern[source]!.test(sourceMessage))
      ) {
        warnings.push(
          `${label} is niet aangepast omdat dit niet expliciet was gevraagd.`,
        );
        continue;
      }
      document = { ...document, [target]: value.trim() };
      changes.push(label);
    }
  }
  if (plan.document.vat_rate !== null) {
    if (plan.document.vat_rate < 0 || plan.document.vat_rate > 100) {
      warnings.push("Het herkende btw-percentage is ongeldig en is genegeerd.");
    } else {
      document = { ...document, vatRate: plan.document.vat_rate };
      changes.push(`Btw ${plan.document.vat_rate}%`);
    }
  }
  const vatRate = document.vatRate;
  const explicitlyPackagePrice =
    /pakketprijs|totaalprijs|totaalbedrag|afgesproken totaal|vaste prijs/i.test(
      sourceMessage,
    );
  if (
    plan.document.price_mode === "services" ||
    (plan.document.price_mode === "package" && explicitlyPackagePrice)
  ) {
    document = { ...document, priceMode: plan.document.price_mode };
  }
  if (
    plan.document.package_price !== null &&
    plan.document.price_mode === "package" &&
    explicitlyPackagePrice
  ) {
    if (plan.document.package_price < 0) {
      warnings.push("Een negatief pakketbedrag is genegeerd.");
    } else {
      document = {
        ...document,
        priceMode: "package",
        packagePrice: netPrice(
          plan.document.package_price,
          plan.document.package_price_includes_vat,
          vatRate,
        ),
        amountsIncludeVat: false,
      };
      changes.push("Pakketprijs");
    }
  } else if (
    plan.document.package_price !== null &&
    plan.line_actions.some((action) => action.unit_price !== null)
  ) {
    warnings.push(
      "Een niet-expliciete pakketprijs is genegeerd; de herkende dienstprijzen zijn gebruikt.",
    );
  }

  let lines = [...document.lines];
  let exclusions = document.exclusions;
  for (const action of plan.line_actions) {
    if (action.optional && action.action === "add") {
      warnings.push(
        `${action.description || action.match || "Optionele dienst"} is als mogelijkheid herkend en niet als betaalde regel toegevoegd.`,
      );
      continue;
    }
    const matchingIndexes = lines
      .map((line, index) => (lineMatches(line, action.match) ? index : -1))
      .filter((index) => index >= 0);
    if (action.action !== "add" && matchingIndexes.length !== 1) {
      questions.push(
        matchingIndexes.length
          ? `Welke regel bedoel je met “${action.match}”?`
          : `De regel “${action.match}” is niet gevonden.`,
      );
      continue;
    }
    if (action.action === "remove") {
      lines = lines.filter((_, index) => index !== matchingIndexes[0]);
      changes.push(`Regel verwijderd: ${action.match}`);
      continue;
    }
    if (action.action === "move_to_exclusions") {
      const line = lines[matchingIndexes[0]];
      const label = action.description || line.description || line.name;
      lines = lines.filter((_, index) => index !== matchingIndexes[0]);
      exclusions = [exclusions.trim(), label].filter(Boolean).join("\n");
      changes.push(`Naar Niet inbegrepen verplaatst: ${label}`);
      continue;
    }
    const description = action.description || action.match || "Nieuwe dienst";
    const quantityText =
      typeof action.quantity === "string" ? action.quantity : undefined;
    const quantity =
      typeof action.quantity === "number" ? action.quantity : quantityText ? 0 : 1;
    const unitPrice =
      action.unit_price === null
        ? 0
        : netPrice(action.unit_price, action.price_includes_vat, vatRate);
    if (action.unit_price === null) warnings.push(`Prijs ontbreekt voor ${description}.`);
    if (action.action === "update") {
      lines = lines.map((line, index) =>
        index === matchingIndexes[0]
          ? {
              ...line,
              ...(action.description ? { description: action.description } : {}),
              ...(action.quantity !== null ? { quantity, quantityText } : {}),
              ...(action.unit_price !== null ? { unitPrice, unitPriceText: undefined } : {}),
              selected: true,
            }
          : line,
      );
      changes.push(`Regel gewijzigd: ${action.match}`);
    } else {
      const duplicate = lines.some(
        (line) => line.selected && normalized(line.description) === normalized(description),
      );
      if (duplicate) {
        warnings.push(`${description} stond al in het document en is niet dubbel toegevoegd.`);
        continue;
      }
      lines.push({
        id: uid(),
        name: description,
        description,
        selected: true,
        quantity,
        quantityText,
        unitPrice,
        custom: true,
      });
      changes.push(`Regel toegevoegd: ${description}`);
    }
  }
  document = {
    ...document,
    lines,
    exclusions,
    amountsIncludeVat: false,
    updatedAt: new Date().toISOString(),
  };
  return {
    document,
    applied: changes.length > 0,
    changes,
    warnings,
    needsClarification: questions,
    preparedCustomer,
  };
}

function compactDocument(document: DocumentRecord) {
  return {
    type: document.type,
    client: document.client,
    contact: document.contact,
    clientAddress: document.clientAddress,
    project: document.project,
    projectAddress: document.projectAddress,
    description: document.description,
    priceMode: document.priceMode,
    vatRate: document.vatRate,
    lines: document.lines
      .filter((line) => line.selected)
      .map((line) => ({
        description: line.description,
        quantity: line.quantityText ?? line.quantity,
        unitPrice: line.unitPriceText ?? line.unitPrice,
      })),
    exclusions: document.exclusions,
    corrections: document.corrections,
    additionalTerms: document.additionalTerms,
    paymentTerms: document.paymentTerms,
  };
}

export async function testOllamaConnection(): Promise<OllamaStatus> {
  return invoke<OllamaStatus>("ollama_status");
}

export async function requestAiPlan(
  message: string,
  conversation: AiMessage[],
  draft: DocumentRecord,
  requestId: string,
  timeoutSeconds: number,
) {
  const response = await invoke<{
    content: string;
    diagnostics: AiDiagnostics;
  }>("ollama_analyze", {
    request: {
      requestId,
      userMessage: message,
      conversation:
        message.length > 5_000
          ? []
          : conversation.slice(-4).map((entry) => ({
              role: entry.role,
              content: entry.content.slice(0, 600),
            })),
      activeDocument: compactDocument(draft),
      timeoutSeconds,
    },
  });
  const parseStarted = performance.now();
  const plan = parseAiPlan(response.content);
  return {
    plan,
    diagnostics: {
      ...response.diagnostics,
      jsonValidationMs: Math.round((performance.now() - parseStarted) * 10) / 10,
    },
  };
}

export async function cancelAiRequest(requestId: string) {
  return invoke<boolean>("ollama_cancel", { requestId });
}

export async function logAiFrontend(metrics: Record<string, unknown>) {
  await invoke("log_ai_frontend", { metrics });
}
