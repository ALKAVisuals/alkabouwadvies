import { useMemo, useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { AppState, CompanyId, Customer, CustomerCategory } from "./types";
import {
  customerContact,
  customerName,
  emptyCustomer,
  findCustomerMatch,
} from "./customers";
import { uid } from "./defaults";

type Mode = "view" | "edit" | "create";

export default function CustomersPanel({
  state,
  setState,
  flash,
}: {
  state: AppState;
  setState: (state: AppState) => void;
  flash: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CustomerCategory>("all");
  const [company, setCompany] = useState<"all" | CompanyId>("all");
  const [mode, setMode] = useState<Mode | null>(null);
  const [draft, setDraft] = useState<Customer | null>(null);
  const customers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("nl-NL");
    return state.customers
      .filter(
        (customer) => category === "all" || customer.category === category,
      )
      .filter(
        (customer) =>
          company === "all" || customer.linkedCompanies.includes(company),
      )
      .filter(
        (customer) =>
          !term ||
          `${customerName(customer)} ${customerContact(customer)} ${customer.email} ${customer.city} ${customer.kvk}`
            .toLocaleLowerCase("nl-NL")
            .includes(term),
      )
      .sort((a, b) => customerName(a).localeCompare(customerName(b), "nl-NL"));
  }, [state.customers, query, category, company]);

  const open = (customer: Customer, nextMode: Mode) => {
    setDraft({ ...customer, linkedCompanies: [...customer.linkedCompanies] });
    setMode(nextMode);
  };
  const create = () => {
    const customer = emptyCustomer("particulier", uid());
    customer.linkedCompanies = ["alka"];
    open(customer, "create");
  };
  const close = () => {
    setDraft(null);
    setMode(null);
  };
  const remove = (customer: Customer) => {
    if (
      !confirm(
        `Klantprofiel van ${customerName(customer)} verwijderen? Bestaande facturen en offertes blijven ongewijzigd.`,
      )
    )
      return;
    setState({
      ...state,
      customers: state.customers.filter((item) => item.id !== customer.id),
    });
    close();
    flash("Klant verwijderd; bestaande documenten zijn behouden");
  };
  const save = () => {
    if (!draft) return;
    if (!customerName(draft).trim())
      return flash("Vul een klantnaam of bedrijfsnaam in.");
    if (!draft.linkedCompanies.length)
      return flash("Koppel de klant aan minimaal één bedrijf.");
    const others = state.customers.filter(
      (customer) => customer.id !== draft.id,
    );
    const match = findCustomerMatch(others, draft);
    if (match.exact)
      return flash("Deze klant bestaat al in het klantenbestand.");
    if (
      match.ambiguous.length &&
      !confirm(
        `Er bestaat mogelijk al een klant met dezelfde naam of hetzelfde adres. Toch als afzonderlijke klant opslaan?`,
      )
    )
      return;
    const customer = { ...draft, updatedAt: new Date().toISOString() };
    setState({
      ...state,
      customers: [
        ...state.customers.filter((item) => item.id !== customer.id),
        customer,
      ],
    });
    close();
    flash(mode === "create" ? "Klant toegevoegd" : "Klantgegevens opgeslagen");
  };

  return (
    <div className="customers-panel">
      <div className="customer-toolbar">
        <div className="customer-filters">
          <div className="search customer-search">
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek naam, e-mail, woonplaats of KvK…"
            />
          </div>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as typeof category)
            }
          >
            <option value="all">Alle categorieën</option>
            <option value="particulier">Particulier</option>
            <option value="bedrijf">Bedrijf</option>
          </select>
          <select
            value={company}
            onChange={(event) =>
              setCompany(event.target.value as typeof company)
            }
          >
            <option value="all">Beide bedrijven</option>
            <option value="alka">ALKA Visuals</option>
            <option value="tba">Technisch Bouwadvies</option>
          </select>
        </div>
        <button className="primary" onClick={create}>
          <Plus /> Klant toevoegen
        </button>
      </div>

      {!customers.length ? (
        <div className="empty-state customer-empty">
          <UserRound />
          <h3>Nog geen klanten gevonden</h3>
          <p>Voeg handmatig een klant toe of download een factuur.</p>
        </div>
      ) : (
        <div className="table-scroll customer-table-scroll">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Klantnaam / bedrijfsnaam</th>
                <th>Categorie</th>
                <th>Contactpersoon</th>
                <th>Woonplaats</th>
                <th>E-mailadres</th>
                <th>Telefoonnummer</th>
                <th>Gekoppeld aan</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  onDoubleClick={() => open(customer, "view")}
                >
                  <td>
                    <strong>{customerName(customer)}</strong>
                  </td>
                  <td>
                    <span className="customer-category">
                      {customer.category === "bedrijf"
                        ? "Bedrijf"
                        : "Particulier"}
                    </span>
                  </td>
                  <td>{customerContact(customer) || "—"}</td>
                  <td>{customer.city || "—"}</td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>{linkedLabel(customer.linkedCompanies)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        title="Klant openen"
                        onClick={() => open(customer, "view")}
                      >
                        <Eye />
                      </button>
                      <button
                        title="Klant bewerken"
                        onClick={() => open(customer, "edit")}
                      >
                        <Pencil />
                      </button>
                      <button
                        className="danger-icon"
                        title="Klant verwijderen"
                        onClick={() => remove(customer)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {draft && mode && (
        <CustomerModal
          customer={draft}
          mode={mode}
          setCustomer={setDraft}
          onClose={close}
          onEdit={() => setMode("edit")}
          onSave={save}
          onDelete={() => remove(draft)}
        />
      )}
    </div>
  );
}

function CustomerModal({
  customer,
  mode,
  setCustomer,
  onClose,
  onEdit,
  onSave,
  onDelete,
}: {
  customer: Customer;
  mode: Mode;
  setCustomer: (customer: Customer) => void;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const readOnly = mode === "view";
  const patch = (change: Partial<Customer>) =>
    setCustomer({ ...customer, ...change });
  const toggleCompany = (id: CompanyId) =>
    patch({
      linkedCompanies: customer.linkedCompanies.includes(id)
        ? customer.linkedCompanies.filter((item) => item !== id)
        : [...customer.linkedCompanies, id],
    });
  return (
    <div
      className="customer-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="customer-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="customer-modal-head">
          <div>
            <span className="eyebrow">
              {mode === "create" ? "Nieuwe klant" : "Klantprofiel"}
            </span>
            <h2>
              {mode === "create" ? "Klant toevoegen" : customerName(customer)}
            </h2>
          </div>
          <button className="modal-close" title="Sluiten" onClick={onClose}>
            <X />
          </button>
        </div>

        {!readOnly && (
          <div className="customer-type-choice">
            <button
              className={customer.category === "particulier" ? "selected" : ""}
              onClick={() =>
                patch({
                  category: "particulier",
                  companyName: "",
                  kvk: "",
                  vatId: "",
                })
              }
            >
              <UserRound /> Particulier
            </button>
            <button
              className={customer.category === "bedrijf" ? "selected" : ""}
              onClick={() => patch({ category: "bedrijf" })}
            >
              <Building2 /> Bedrijf
            </button>
          </div>
        )}

        <div className="customer-form-section">
          <h3>
            {customer.category === "bedrijf"
              ? "Bedrijf en contactpersoon"
              : "Persoonsgegevens"}
          </h3>
          <div className="grid two">
            {customer.category === "bedrijf" && (
              <CustomerField
                label="Bedrijfsnaam *"
                value={customer.companyName}
                readOnly={readOnly}
                onChange={(companyName) => patch({ companyName })}
              />
            )}
            <CustomerField
              label={
                customer.category === "bedrijf"
                  ? "Voornaam contactpersoon"
                  : "Voornaam *"
              }
              value={customer.firstName}
              readOnly={readOnly}
              onChange={(firstName) => patch({ firstName })}
            />
            <CustomerField
              label={
                customer.category === "bedrijf"
                  ? "Achternaam contactpersoon"
                  : "Achternaam *"
              }
              value={customer.lastName}
              readOnly={readOnly}
              onChange={(lastName) => patch({ lastName })}
            />
          </div>
        </div>

        <div className="customer-form-section">
          <h3>Adresgegevens</h3>
          <div className="customer-address-grid">
            <CustomerField
              label="Straatnaam"
              value={customer.street}
              readOnly={readOnly}
              onChange={(street) => patch({ street })}
            />
            <CustomerField
              label="Huisnummer en toevoeging"
              value={customer.houseNumber}
              readOnly={readOnly}
              onChange={(houseNumber) => patch({ houseNumber })}
            />
            <CustomerField
              label="Postcode"
              value={customer.postalCode}
              readOnly={readOnly}
              onChange={(postalCode) =>
                patch({ postalCode: postalCode.toUpperCase() })
              }
            />
            <CustomerField
              label={
                customer.category === "bedrijf"
                  ? "Vestigingsplaats"
                  : "Woonplaats"
              }
              value={customer.city}
              readOnly={readOnly}
              onChange={(city) => patch({ city })}
            />
            <CustomerField
              label="Land"
              value={customer.country}
              readOnly={readOnly}
              onChange={(country) => patch({ country })}
            />
          </div>
        </div>

        {customer.category === "bedrijf" && (
          <div className="customer-form-section">
            <h3>Bedrijfsgegevens</h3>
            <div className="grid two">
              <CustomerField
                label="KvK-nummer"
                value={customer.kvk}
                readOnly={readOnly}
                onChange={(kvk) => patch({ kvk })}
              />
              <CustomerField
                label="Btw-identificatienummer"
                value={customer.vatId}
                readOnly={readOnly}
                onChange={(vatId) => patch({ vatId })}
              />
            </div>
          </div>
        )}

        <div className="customer-form-section">
          <h3>Contact en registratie</h3>
          <div className="grid two">
            <CustomerField
              label="E-mailadres"
              value={customer.email}
              readOnly={readOnly}
              type="email"
              onChange={(email) => patch({ email })}
            />
            <CustomerField
              label="Telefoonnummer"
              value={customer.phone}
              readOnly={readOnly}
              onChange={(phone) => patch({ phone })}
            />
          </div>
          <div className="customer-company-links">
            <span>Gekoppeld aan</span>
            <label>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={customer.linkedCompanies.includes("alka")}
                onChange={() => toggleCompany("alka")}
              />{" "}
              ALKA Visuals
            </label>
            <label>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={customer.linkedCompanies.includes("tba")}
                onChange={() => toggleCompany("tba")}
              />{" "}
              Technisch Bouwadvies
            </label>
          </div>
          <label className="field">
            <span>Opmerkingen</span>
            <textarea
              rows={4}
              readOnly={readOnly}
              value={customer.notes}
              onChange={(event) => patch({ notes: event.target.value })}
            />
          </label>
        </div>

        <div className="customer-modal-actions">
          {mode !== "create" && (
            <button className="customer-delete" onClick={onDelete}>
              <Trash2 /> Verwijderen
            </button>
          )}
          <span />
          <button className="ghost" onClick={onClose}>
            Sluiten
          </button>
          {readOnly ? (
            <button className="primary" onClick={onEdit}>
              <Pencil /> Bewerken
            </button>
          ) : (
            <button className="primary" onClick={onSave}>
              <SaveIcon /> Opslaan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerField({
  label,
  value,
  readOnly,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

function linkedLabel(companies: CompanyId[]) {
  if (companies.includes("alka") && companies.includes("tba")) return "Beide";
  if (companies.includes("alka")) return "ALKA Visuals";
  if (companies.includes("tba")) return "Technisch Bouwadvies";
  return "—";
}
