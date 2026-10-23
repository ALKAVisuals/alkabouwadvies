import type {
  AppState,
  CompanyId,
  Customer,
  CustomerCategory,
  DocumentRecord,
} from "./types";

const clean = (value = "") => value.trim().replace(/\s+/g, " ");
const comparable = (value = "") =>
  clean(value)
    .toLocaleLowerCase("nl-NL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export const customerName = (customer: Customer) =>
  customer.category === "bedrijf"
    ? customer.companyName
    : clean(`${customer.firstName} ${customer.lastName}`);

export const customerContact = (customer: Customer) =>
  customer.category === "bedrijf"
    ? clean(`${customer.firstName} ${customer.lastName}`)
    : "";

export const customerAddress = (customer: Customer) => {
  const hasAddress = Boolean(
    customer.street ||
    customer.houseNumber ||
    customer.postalCode ||
    customer.city,
  );
  if (!hasAddress) return "";
  return [
    clean(`${customer.street} ${customer.houseNumber}`),
    clean(`${customer.postalCode} ${customer.city}`),
    customer.country,
  ]
    .filter(Boolean)
    .join("\n");
};

export const customerLabel = (customer: Customer) =>
  [
    customerName(customer),
    customer.city,
    customer.email,
    customer.id.slice(0, 6),
  ]
    .filter(Boolean)
    .join(" — ");

export function emptyCustomer(
  category: CustomerCategory,
  id: string,
): Customer {
  const now = new Date().toISOString();
  return {
    id,
    category,
    companyName: "",
    firstName: "",
    lastName: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    country: "Nederland",
    kvk: "",
    vatId: "",
    email: "",
    phone: "",
    notes: "",
    linkedCompanies: [],
    createdAt: now,
    updatedAt: now,
  };
}

function splitPersonName(value: string) {
  const parts = clean(value).split(" ").filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] || "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function parseDocumentAddress(value: string) {
  const parts = value
    .split(/\r?\n|,/)
    .map(clean)
    .filter(Boolean);
  let country = "Nederland";
  if (parts.length && /^(nederland|netherlands)$/i.test(parts.at(-1)!)) {
    country = parts.pop()!;
  }
  let postalCode = "";
  let city = "";
  const postalIndex = parts.findIndex((part) =>
    /\b\d{4}\s?[A-Za-z]{2}\b/.test(part),
  );
  if (postalIndex >= 0) {
    const match = parts[postalIndex].match(/\b(\d{4}\s?[A-Za-z]{2})\b\s*(.*)$/);
    postalCode = clean(match?.[1] || "").toUpperCase();
    city = clean(match?.[2] || "");
    parts.splice(postalIndex, 1);
  }
  const streetLine = parts.shift() || "";
  const streetMatch = streetLine.match(/^(.*?)(?:\s+)(\d+\S*)$/);
  return {
    street: clean(streetMatch?.[1] || streetLine),
    houseNumber: clean(streetMatch?.[2] || ""),
    postalCode,
    city: city || clean(parts.shift() || ""),
    country,
  };
}

const looksBusiness = (document: DocumentRecord) =>
  Boolean(document.contact.trim()) ||
  /\b(b\.?v\.?|n\.?v\.?|v\.?o\.?f\.?|stichting|vereniging|groep|group|studio|advies)\b/i.test(
    document.client,
  );

export function customerFromDocument(
  document: DocumentRecord,
  id: string,
): Customer {
  const category: CustomerCategory = looksBusiness(document)
    ? "bedrijf"
    : "particulier";
  const person = splitPersonName(
    category === "bedrijf" ? document.contact : document.client,
  );
  return {
    ...emptyCustomer(category, id),
    ...person,
    ...(category === "bedrijf" ? { companyName: clean(document.client) } : {}),
    ...parseDocumentAddress(document.clientAddress),
    linkedCompanies: [document.companyId],
  };
}

const addressKey = (customer: Customer) =>
  comparable(
    `${customer.street}|${customer.houseNumber}|${customer.postalCode}|${customer.city}|${customer.country}`,
  );

export function findCustomerMatch(customers: Customer[], candidate: Customer) {
  const byId = customers.find((customer) => customer.id === candidate.id);
  if (byId) return { exact: byId, ambiguous: [] as Customer[] };
  const candidateName = comparable(customerName(candidate));
  const candidateAddress = addressKey(candidate);
  const exact = customers.find((customer) => {
    if (candidate.kvk && comparable(customer.kvk) === comparable(candidate.kvk))
      return true;
    if (
      candidate.email &&
      comparable(customer.email) === comparable(candidate.email)
    )
      return true;
    return Boolean(
      candidateName &&
      candidateAddress &&
      comparable(customerName(customer)) === candidateName &&
      addressKey(customer) === candidateAddress,
    );
  });
  if (exact) return { exact, ambiguous: [] as Customer[] };
  const ambiguous = customers.filter((customer) => {
    const sameName =
      candidateName && comparable(customerName(customer)) === candidateName;
    const sameAddress =
      candidateAddress && addressKey(customer) === candidateAddress;
    return Boolean(sameName || sameAddress);
  });
  return { exact: undefined, ambiguous };
}

const fillableKeys: Array<
  keyof Pick<
    Customer,
    | "companyName"
    | "firstName"
    | "lastName"
    | "street"
    | "houseNumber"
    | "postalCode"
    | "city"
    | "country"
    | "kvk"
    | "vatId"
    | "email"
    | "phone"
    | "notes"
  >
> = [
  "companyName",
  "firstName",
  "lastName",
  "street",
  "houseNumber",
  "postalCode",
  "city",
  "country",
  "kvk",
  "vatId",
  "email",
  "phone",
  "notes",
];

export function mergeCustomerMissing(
  existing: Customer,
  candidate: Customer,
  companyId: CompanyId,
) {
  const merged = { ...existing };
  for (const key of fillableKeys) {
    if (!merged[key] && candidate[key]) merged[key] = candidate[key];
  }
  merged.linkedCompanies = Array.from(
    new Set([...existing.linkedCompanies, companyId]),
  );
  merged.updatedAt = new Date().toISOString();
  return merged;
}

export type RegisterCustomerResult = {
  state: AppState;
  status: "created" | "updated" | "ambiguous";
  customer: Customer;
  ambiguous: Customer[];
};

export function registerInvoiceCustomer(
  state: AppState,
  document: DocumentRecord,
  makeId: () => string,
  forceCreate = false,
): RegisterCustomerResult {
  const candidate = customerFromDocument(document, makeId());
  if (
    document.customerId &&
    state.customers.some((customer) => customer.id === document.customerId)
  ) {
    candidate.id = document.customerId;
  }
  const match = findCustomerMatch(state.customers, candidate);
  if (!forceCreate && match.exact) {
    const customer = mergeCustomerMissing(
      match.exact,
      candidate,
      document.companyId,
    );
    return {
      state: {
        ...state,
        customers: state.customers.map((item) =>
          item.id === customer.id ? customer : item,
        ),
      },
      status: "updated",
      customer,
      ambiguous: [],
    };
  }
  if (!forceCreate && match.ambiguous.length) {
    return {
      state,
      status: "ambiguous",
      customer: candidate,
      ambiguous: match.ambiguous,
    };
  }
  const customer = forceCreate ? { ...candidate, id: makeId() } : candidate;
  return {
    state: { ...state, customers: [...state.customers, customer] },
    status: "created",
    customer,
    ambiguous: [],
  };
}

export function applyCustomerToDocument(
  document: DocumentRecord,
  customer: Customer,
): DocumentRecord {
  return {
    ...document,
    customerId: customer.id,
    client: customerName(customer),
    contact: customerContact(customer),
    clientAddress: customerAddress(customer),
    updatedAt: new Date().toISOString(),
  };
}
