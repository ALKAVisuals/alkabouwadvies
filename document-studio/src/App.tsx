import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  FileSpreadsheet,
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  Download,
  Eye,
  Copy,
  CheckCircle2,
  Upload,
  Database,
  RotateCcw,
  Search,
  FileText,
  ReceiptText,
  Trash2,
  Users,
  Bot,
} from "lucide-react";
import ExcelJS from "exceljs";
import type {
  AppState,
  CompanyId,
  DocumentRecord,
  DocType,
  ServiceLine,
} from "./types";
import {
  calculate,
  hasDuplicateNumber,
  markPaid,
  nextNumber,
  parseNumericInput,
  totals,
} from "./domain";
import {
  addDays,
  emptyDoc,
  initialState,
  todayAmsterdam,
  uid,
} from "./defaults";
import {
  createBackup,
  downloadBlob,
  loadState,
  restoreBackup,
  saveState,
} from "./storage";
import { exportPdf, makePdfBlob } from "./pdf";
import { importQuoteFile, mergeImportedLines } from "./quoteImport";
import CustomersPanel from "./CustomersPanel";
import {
  applyCustomerToDocument,
  customerLabel,
  customerName,
  registerInvoiceCustomer,
} from "./customers";
import AiChat from "./AiChat";

type MainView = CompanyId | "admin";
type AdminTab =
  "vooradministratie" | "facturen" | "offertes" | "klanten" | "instellingen";
const money = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
    n || 0,
  );
const fmtDate = (s: string) =>
  s ? new Intl.DateTimeFormat("nl-NL").format(new Date(`${s}T12:00:00`)) : "";

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<MainView>("alka");
  const [adminTab, setAdminTab] = useState<AdminTab>("vooradministratie");
  const [draft, setDraft] = useState<DocumentRecord>(() => emptyDoc("alka"));
  const [toast, setToast] = useState("");
  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);
  useEffect(() => {
    if (view === "alka" || view === "tba") setDraft(emptyDoc(view));
  }, [view]);
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3200);
  };
  const persistDraft = () => {
    const amounts = calculate(draft);
    const saved = { ...draft, ...amounts, updatedAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      documents: [...s.documents.filter((d) => d.id !== saved.id), saved],
    }));
    setDraft(saved);
    flash("Concept lokaal opgeslagen");
  };
  const issue = async () => {
    if (!draft.client || !draft.project || !draft.lines.some((l) => l.selected))
      return flash("Vul opdrachtgever, project en minimaal één dienst in.");
    const amounts = calculate(draft);
    const number =
      draft.number.trim() ||
      nextNumber(state, draft.companyId, draft.type, draft.date);
    if (!/^[A-Za-z0-9-]+$/.test(number)) {
      return flash(
        "Gebruik in het documentnummer alleen letters, cijfers en koppeltekens.",
      );
    }
    if (hasDuplicateNumber(state, draft, number)) {
      alert(
        `Documentnummer ${number} bestaat al binnen deze administratie. Kies een uniek documentnummer voordat je het document definitief uitgeeft.`,
      );
      return flash("Document niet uitgegeven: het documentnummer bestaat al.");
    }
    const issued = {
      ...draft,
      ...amounts,
      number,
      numberManuallySet: draft.numberManuallySet,
      status: "issued" as const,
      quoteStatus:
        draft.type === "offerte" ? ("Verzonden" as const) : draft.quoteStatus,
      updatedAt: new Date().toISOString(),
    };
    const blob = await makePdfBlob(issued, state.companies[issued.companyId]);
    issued.pdfBase64 = await blobToBase64(blob);
    setState((s) => ({
      ...s,
      documents: [...s.documents.filter((d) => d.id !== issued.id), issued],
    }));
    setDraft(issued);
    flash(
      `${issued.type === "factuur" ? "Factuur" : "Offerte"} ${number} definitief uitgegeven`,
    );
  };
  const duplicate = (doc = draft) => {
    const copy = {
      ...doc,
      id: uid(),
      status: "concept" as const,
      number: "",
      numberManuallySet: false,
      date: todayAmsterdam(),
      dueDate: addDays(
        todayAmsterdam(),
        state.companies[doc.companyId].paymentDays,
      ),
      paymentStatus: "Openstaand" as const,
      paidDate: "",
      pdfBase64: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: doc.lines.map((l) => ({ ...l, id: uid() })),
    };
    setDraft(copy);
    setView(doc.companyId);
    flash("Nieuwe conceptkopie aangemaakt");
  };
  if (!ready)
    return <div className="loading">Document Studio wordt gestart…</div>;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">DS</div>
          <div>
            <strong>Document Studio</strong>
            <span>Interne bedrijfsadministratie</span>
          </div>
        </div>
        <nav>
          <button
            className={view === "alka" ? "active alka" : ""}
            onClick={() => setView("alka")}
          >
            <LayoutDashboard />
            ALKA Visuals
          </button>
          <button
            className={view === "tba" ? "active tba" : ""}
            onClick={() => setView("tba")}
          >
            <Building2 />
            Technisch Bouwadvies
          </button>
          <button
            className={view === "admin" ? "active" : ""}
            onClick={() => setView("admin")}
          >
            <FileSpreadsheet />
            Administratie
          </button>
        </nav>
        <div className="sidebar-foot">
          <Database size={16} />
          <span>Offline • lokale opslag</span>
        </div>
      </aside>
      <main>
        {view === "admin" ? (
          <Administration
            state={state}
            setState={setState}
            tab={adminTab}
            setTab={setAdminTab}
            flash={flash}
            duplicate={duplicate}
          />
        ) : (
          <Generator
            companyId={view}
            state={state}
            setState={setState}
            draft={draft}
            setDraft={setDraft}
            save={persistDraft}
            issue={issue}
            duplicate={() => duplicate()}
            flash={flash}
          />
        )}
      </main>
      {toast && (
        <div className="toast">
          <CheckCircle2 />
          {toast}
        </div>
      )}
    </div>
  );
}

function Generator({
  companyId,
  state,
  setState,
  draft,
  setDraft,
  save,
  issue,
  duplicate,
  flash,
}: {
  companyId: CompanyId;
  state: AppState;
  setState: (state: AppState) => void;
  draft: DocumentRecord;
  setDraft: (d: DocumentRecord) => void;
  save: () => void;
  issue: () => void;
  duplicate: () => void;
  flash: (s: string) => void;
}) {
  const company = state.companies[companyId];
  const amounts = useMemo(() => calculate(draft), [draft]);
  const previewNumber = useMemo(
    () => draft.number || nextNumber(state, draft.companyId, draft.type, draft.date),
    [draft.number, draft.companyId, draft.type, draft.date, state.documents],
  );
  const current = useMemo(
    () => ({ ...draft, ...amounts, number: previewNumber }),
    [draft, amounts, previewNumber],
  );
  const importInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<{
    kind: "success" | "warning" | "error";
    title: string;
    messages: string[];
  } | null>(null);
  useEffect(() => setCustomerQuery(""), [companyId, draft.id]);
  const patch = (p: Partial<DocumentRecord>) =>
    setDraft({ ...draft, ...p, updatedAt: new Date().toISOString() });
  const linePatch = (id: string, p: Partial<ServiceLine>) =>
    patch({
      lines: draft.lines.map((l) => (l.id === id ? { ...l, ...p } : l)),
    });
  const addLine = () =>
    patch({
      lines: [
        ...draft.lines,
        {
          id: uid(),
          name: "Nieuwe dienst",
          description: "Nieuwe dienst",
          selected: true,
          quantity: 1,
          unitPrice: 0,
          custom: true,
        },
      ],
    });
  const selectCustomer = (value: string) => {
    setCustomerQuery(value);
    const customer = state.customers.find(
      (item) => customerLabel(item) === value,
    );
    if (!customer) return;
    setDraft(applyCustomerToDocument(draft, customer));
    if (!customer.linkedCompanies.includes(companyId)) {
      setState({
        ...state,
        customers: state.customers.map((item) =>
          item.id === customer.id
            ? {
                ...item,
                linkedCompanies: [...item.linkedCompanies, companyId],
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      });
    }
    flash(`${customerName(customer)} geselecteerd`);
  };
  const exportCurrentPdf = async () => {
    await exportPdf(current, company);
    if (current.type !== "factuur") return flash("PDF geëxporteerd");
    if (!current.client.trim()) {
      return flash(
        "PDF geëxporteerd; geen klant toegevoegd omdat de opdrachtgever ontbreekt.",
      );
    }
    try {
      let result = registerInvoiceCustomer(state, current, uid);
      if (result.status === "ambiguous") {
        const possible = result.ambiguous
          .map((customer) => customerName(customer))
          .join(", ");
        if (
          !confirm(
            `Mogelijk bestaat deze klant al (${possible}). Wil je toch een nieuw, afzonderlijk klantprofiel aanmaken?`,
          )
        ) {
          return flash(
            "PDF geëxporteerd; klant niet toegevoegd wegens mogelijke overeenkomst.",
          );
        }
        result = registerInvoiceCustomer(state, current, uid, true);
      }
      const linkedDraft = { ...draft, customerId: result.customer.id };
      const nextState = {
        ...result.state,
        documents: result.state.documents.map((document) =>
          document.id === draft.id
            ? { ...document, customerId: result.customer.id }
            : document,
        ),
      };
      await saveState(nextState);
      setState(nextState);
      setDraft(linkedDraft);
      flash(
        result.status === "created"
          ? "PDF geëxporteerd en klant toegevoegd"
          : "PDF geëxporteerd en klant gekoppeld",
      );
    } catch {
      flash("PDF is geëxporteerd, maar de klant kon niet worden opgeslagen.");
    }
  };
  const importQuote = async (file: File) => {
    setImporting(true);
    setImportNotice(null);
    try {
      const parsed = await importQuoteFile(file);
      const hasContent = Boolean(
        draft.client ||
        draft.contact ||
        draft.clientAddress ||
        draft.project ||
        draft.projectAddress ||
        draft.description ||
        draft.packagePrice ||
        draft.lines.some((line) => line.selected),
      );
      if (
        hasContent &&
        !confirm(
          "Er staan al gegevens in dit factuurformulier. Wil je deze vervangen door de gegevens uit de geselecteerde offerte?",
        )
      ) {
        setImportNotice({
          kind: "warning",
          title: "Import geannuleerd",
          messages: ["De bestaande factuurgegevens zijn niet gewijzigd."],
        });
        return;
      }
      const lines = mergeImportedLines(draft.lines, parsed.lines, uid);
      setDraft({
        ...draft,
        client: parsed.client,
        contact: parsed.contact,
        clientAddress: parsed.clientAddress,
        project: parsed.project,
        projectAddress: parsed.projectAddress,
        description: parsed.description,
        lines,
        priceMode: parsed.priceMode,
        packagePrice: parsed.packagePrice,
        vatRate: parsed.vatRate ?? draft.vatRate,
        amountsIncludeVat: false,
        updatedAt: new Date().toISOString(),
      });
      const messages = parsed.warnings.length
        ? parsed.warnings
        : [
            `${parsed.lines.length} ${parsed.lines.length === 1 ? "dienstregel" : "dienstregels"} herkend. Controleer de ingevulde gegevens voordat je de factuur definitief uitgeeft.`,
          ];
      setImportNotice({
        kind: parsed.warnings.length ? "warning" : "success",
        title: parsed.warnings.length
          ? "Offerte geïmporteerd met aandachtspunten"
          : "Offerte succesvol geïmporteerd",
        messages,
      });
      flash("Offertegegevens ingevuld");
    } catch (error) {
      setImportNotice({
        kind: "error",
        title: "Offerte kon niet worden geïmporteerd",
        messages: [
          error instanceof Error
            ? error.message
            : "Onbekende fout tijdens het uitlezen.",
        ],
      });
    } finally {
      setImporting(false);
      if (importInput.current) importInput.current.value = "";
    }
  };
  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Documentgenerator</span>
          <h1>{company.name}</h1>
          <p>
            Maak een professionele offerte of factuur in de eigen huisstijl.
          </p>
        </div>
        <div className="header-actions">
          {companyId === "tba" && (
            <button
              className={`ghost ai-launch ${aiOpen ? "active" : ""}`}
              onClick={() => setAiOpen((open) => !open)}
            >
              <Bot />
              {aiOpen ? "AI-assistent sluiten" : "AI-assistent"}
            </button>
          )}
          <button className="ghost" onClick={save}>
            <Save />
            Concept opslaan
          </button>
          <button className="primary" onClick={issue}>
            <ReceiptText />
            Definitief uitgeven
          </button>
        </div>
      </header>
      <div className={`generator-layout ${aiOpen ? "ai-open" : ""}`}>
        <section className="form-panel">
          <div className="form-mode-row">
            <div className="segmented">
              <button
                className={draft.type === "offerte" ? "selected" : ""}
                onClick={() => {
                  patch({
                    type: "offerte",
                    number: "",
                    numberManuallySet: false,
                  });
                  setImportNotice(null);
                }}
              >
                Offerte
              </button>
              <button
                className={draft.type === "factuur" ? "selected" : ""}
                onClick={() =>
                  patch({
                    type: "factuur",
                    number: "",
                    numberManuallySet: false,
                  })
                }
              >
                Factuur
              </button>
            </div>
            {draft.type === "factuur" && (
              <>
                <button
                  className="import-quote"
                  disabled={importing}
                  onClick={() => importInput.current?.click()}
                >
                  <Upload />
                  {importing ? "Offerte uitlezen…" : "Importeer offerte"}
                </button>
                <input
                  ref={importInput}
                  hidden
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) =>
                    e.target.files?.[0] && importQuote(e.target.files[0])
                  }
                />
              </>
            )}
          </div>
          {importNotice && (
            <div className={`import-notice ${importNotice.kind}`} role="status">
              <strong>{importNotice.title}</strong>
              {importNotice.messages.map((message) => (
                <span key={message}>{message}</span>
              ))}
              <button
                aria-label="Melding sluiten"
                onClick={() => setImportNotice(null)}
              >
                ×
              </button>
            </div>
          )}
          <Section title="Documentgegevens">
            <div className="grid two">
              <Field label="Documentdatum">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) =>
                    patch({
                      date: e.target.value,
                      dueDate: addDays(e.target.value, company.paymentDays),
                      ...(draft.numberManuallySet ? {} : { number: "" }),
                    })
                  }
                />
              </Field>
              <Field
                label={
                  draft.status === "concept"
                    ? "Voorlopig documentnummer"
                    : "Documentnummer"
                }
              >
                <input
                  value={draft.number || previewNumber}
                  pattern="[A-Za-z0-9-]+"
                  title="Gebruik alleen letters, cijfers en koppeltekens"
                  onChange={(e) =>
                    patch({
                      number: e.target.value,
                      numberManuallySet: true,
                    })
                  }
                />
              </Field>
              {draft.type === "factuur" && (
                <Field label="Vervaldatum">
                  <input
                    type="date"
                    value={draft.dueDate}
                    onChange={(e) => patch({ dueDate: e.target.value })}
                  />
                </Field>
              )}
            </div>
          </Section>
          <Section title="Opdrachtgever en project">
            <Field label="Klant uit klantenbestand (optioneel)">
              <input
                list={`customers-${companyId}`}
                value={customerQuery}
                onChange={(event) => selectCustomer(event.target.value)}
                placeholder="Zoek en selecteer een bestaande klant…"
              />
              <datalist id={`customers-${companyId}`}>
                {state.customers.map((customer) => (
                  <option key={customer.id} value={customerLabel(customer)} />
                ))}
              </datalist>
            </Field>
            <div className="grid two">
              <Field label="Opdrachtgever *">
                <input
                  value={draft.client}
                  onChange={(e) =>
                    patch({ client: e.target.value, customerId: undefined })
                  }
                  placeholder="Naam klant of bedrijf"
                />
              </Field>
              <Field label="Contactpersoon">
                <input
                  value={draft.contact}
                  onChange={(e) =>
                    patch({ contact: e.target.value, customerId: undefined })
                  }
                />
              </Field>
              <Field
                label={
                  companyId === "tba" ? "Factuuradres" : "Adres opdrachtgever"
                }
              >
                <textarea
                  rows={2}
                  value={draft.clientAddress}
                  onChange={(e) =>
                    patch({
                      clientAddress: e.target.value,
                      customerId: undefined,
                    })
                  }
                  placeholder={"Straat en huisnummer, postcode en plaats"}
                />
              </Field>
              <Field label="Projectnaam *">
                <input
                  value={draft.project}
                  onChange={(e) => patch({ project: e.target.value })}
                />
              </Field>
              <Field label="Projectadres">
                <input
                  value={draft.projectAddress}
                  onChange={(e) => patch({ projectAddress: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Algemene omschrijving">
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Field>
          </Section>
          <Section title="Prijsopbouw">
            <div className="segmented small">
              <button
                className={draft.priceMode === "services" ? "selected" : ""}
                onClick={() => patch({ priceMode: "services" })}
              >
                Prijs per dienst
              </button>
              <button
                className={draft.priceMode === "package" ? "selected" : ""}
                onClick={() => patch({ priceMode: "package" })}
              >
                Afgesproken pakketprijs
              </button>
            </div>
            <div className="service-list">
              {draft.lines.map((l) => (
                <div
                  className={`service ${l.selected ? "chosen" : ""}`}
                  key={l.id}
                >
                  <label className="service-check">
                    <input
                      type="checkbox"
                      checked={l.selected}
                      onChange={(e) =>
                        linePatch(l.id, { selected: e.target.checked })
                      }
                    />
                    <span>{l.name}</span>
                  </label>
                  {l.selected && (
                    <div className="service-fields">
                      <Field label="Omschrijving">
                        <input
                          value={l.description}
                          onChange={(e) =>
                            linePatch(l.id, { description: e.target.value })
                          }
                        />
                      </Field>
                      <Field label="Aantal">
                        <input
                          type="text"
                          value={l.quantityText ?? String(l.quantity)}
                          onChange={(e) => {
                            const parsed = parseNumericInput(e.target.value);
                            linePatch(l.id, {
                              quantityText: e.target.value,
                              quantity: parsed ?? 0,
                            });
                          }}
                        />
                      </Field>
                      {draft.priceMode === "services" && (
                        <>
                          <Field label="Prijs per stuk">
                            <input
                              type="text"
                              value={l.unitPriceText ?? String(l.unitPrice)}
                              onChange={(e) => {
                                const parsed = parseNumericInput(
                                  e.target.value,
                                );
                                linePatch(l.id, {
                                  unitPriceText: e.target.value,
                                  unitPrice: parsed ?? 0,
                                });
                              }}
                            />
                          </Field>
                          <div className="line-total">
                            <span>Regelbedrag</span>
                            <strong>
                              {parseNumericInput(
                                l.quantityText ?? String(l.quantity),
                              ) !== null &&
                              parseNumericInput(
                                l.unitPriceText ?? String(l.unitPrice),
                              ) !== null
                                ? money(l.quantity * l.unitPrice)
                                : "—"}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="text-button" onClick={addLine}>
              <Plus />
              Eigen dienstregel toevoegen
            </button>
            {draft.priceMode === "package" && (
              <Field label="Afgesproken pakketprijs">
                <div className="money-input">
                  <span>€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.packagePrice}
                    onChange={(e) =>
                      patch({ packagePrice: Number(e.target.value) })
                    }
                  />
                </div>
              </Field>
            )}
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={draft.amountsIncludeVat}
                onChange={(e) => patch({ amountsIncludeVat: e.target.checked })}
              />
              <span>Ingevoerde bedragen zijn inclusief btw</span>
            </label>
            <div className="totals-box">
              <span>
                Excl. btw<strong>{money(amounts.subtotal)}</strong>
              </span>
              <span>
                Btw {draft.vatRate}%<strong>{money(amounts.vat)}</strong>
              </span>
              <span className="grand">
                Totaal incl. btw<strong>{money(amounts.total)}</strong>
              </span>
            </div>
          </Section>
          {companyId === "tba" && (
            <Section title="Voorwaarden en afspraken">
              <Field label="Niet inbegrepen">
                <textarea
                  rows={4}
                  value={draft.exclusions}
                  onChange={(e) => patch({ exclusions: e.target.value })}
                />
              </Field>
              <Field label="Aanvullende toelichting">
                <textarea
                  rows={4}
                  value={draft.additionalExplanation || ""}
                  onChange={(e) =>
                    patch({ additionalExplanation: e.target.value })
                  }
                />
              </Field>
              <Field label="Correctierondes">
                <textarea
                  rows={4}
                  value={draft.corrections}
                  onChange={(e) => patch({ corrections: e.target.value })}
                />
              </Field>
              <Field label="Aanvullende afspraken">
                <textarea
                  rows={3}
                  value={draft.additionalTerms}
                  onChange={(e) => patch({ additionalTerms: e.target.value })}
                />
              </Field>
              <Field label="Betalingsvoorwaarden">
                <textarea
                  rows={4}
                  value={draft.paymentTerms}
                  onChange={(e) => patch({ paymentTerms: e.target.value })}
                />
              </Field>
            </Section>
          )}
          <Field label="Administratieve opmerking">
            <textarea
              rows={2}
              value={draft.notes}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </Field>
        </section>
        <aside className="preview-panel">
          <div className="preview-toolbar">
            <div>
              <Eye />
              Live documentpreview
            </div>
            <div>
              <button title="Dupliceren" onClick={duplicate}>
                <Copy />
              </button>
              <button title="PDF exporteren" onClick={exportCurrentPdf}>
                <Download />
              </button>
            </div>
          </div>
          <PdfPreview doc={current} company={company} />
        </aside>
      </div>
      {companyId === "tba" && (
        <AiChat
          open={aiOpen}
          onClose={() => setAiOpen(false)}
        />
      )}
    </>
  );
}

function PdfPreview({
  doc,
  company,
}: {
  doc: DocumentRecord;
  company: AppState["companies"]["alka"];
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true,
      old = "";
    const timer = setTimeout(
      () =>
        makePdfBlob(doc, company).then((b) => {
          if (!active) return;
          old = URL.createObjectURL(b);
          setUrl(old);
        }),
      220,
    );
    return () => {
      active = false;
      clearTimeout(timer);
      if (old) URL.revokeObjectURL(old);
    };
  }, [doc, company]);
  return url ? (
    <iframe title="PDF preview" src={`${url}#toolbar=0&navpanes=0`} />
  ) : (
    <div className="preview-loading">Preview wordt opgebouwd…</div>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Administration({
  state,
  setState,
  tab,
  setTab,
  flash,
  duplicate,
}: {
  state: AppState;
  setState: (s: AppState) => void;
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  flash: (s: string) => void;
  duplicate: (d: DocumentRecord) => void;
}) {
  const [company, setCompany] = useState<"all" | CompanyId>("all");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<"all" | "month" | "quarter" | "year">(
    "all",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const docs = useMemo(
    () => filterDocs(state.documents, company, query, period),
    [state.documents, company, query, period],
  );
  const metrics = totals(docs);
  const tableDocs = docs.filter((d) =>
    tab === "offertes"
      ? d.type === "offerte"
      : d.type === "factuur" &&
        (tab === "vooradministratie"
          ? d.paymentStatus !== "Betaald" && d.source === "app"
          : d.paymentStatus === "Betaald" || d.source === "import"),
  );
  useEffect(() => setSelectedIds(new Set()), [tab, company, query, period]);
  const mark = (doc: DocumentRecord) => {
    if (!confirm(`Factuur ${doc.number} als betaald markeren?`)) return;
    setState({
      ...state,
      documents: state.documents.map((d) =>
        d.id === doc.id ? markPaid(d, todayAmsterdam()) : d,
      ),
    });
    flash("Factuur verplaatst naar Facturen. Ongedaan maken blijft mogelijk.");
  };
  const undo = (doc: DocumentRecord) => {
    setState({
      ...state,
      documents: state.documents.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              paymentStatus: "Openstaand",
              paidDate: "",
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    });
    flash("Betaalstatus hersteld naar openstaand");
  };
  const deleteSelected = () => {
    const count = selectedIds.size;
    if (!count) return;
    if (
      !confirm(
        `${count === 1 ? "Dit item" : `Deze ${count} items`} definitief uit de administratie verwijderen? Dit kan niet ongedaan worden gemaakt.`,
      )
    )
      return;
    setState({
      ...state,
      documents: state.documents.filter((d) => !selectedIds.has(d.id)),
    });
    setSelectedIds(new Set());
    flash(
      `${count} ${count === 1 ? "item" : "items"} verwijderd uit de administratie`,
    );
  };
  const importExcel = async (file: File) => {
    const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
    if (state.importFingerprints.includes(fingerprint))
      return flash("Dit bestand is al geïmporteerd.");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const imported: DocumentRecord[] = [];
    for (const sheetName of ["Offertes", "Facturen"]) {
      const ws = wb.getWorksheet(sheetName);
      if (!ws) continue;
      const headers = ws.getRow(1).values as unknown[];
      const index = new Map<string, number>();
      headers.forEach((v, i) => {
        if (v) index.set(String(v), i);
      });
      const val = (row: ExcelJS.Row, key: string) =>
        cellValue(row.getCell(index.get(key) || 0).value);
      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const isInvoice = sheetName === "Facturen";
        const number = String(
          val(row, isInvoice ? "Factuurnummer" : "Offertenummer") || "",
        ).trim();
        const client = String(val(row, "Opdrachtgever") || "").trim();
        if (!number && !client) return;
        const date = excelDate(
          val(row, isInvoice ? "Factuurdatum" : "Offertedatum"),
        );
        const subtotal = Number(val(row, "Bedrag excl. btw") || 0);
        const vat = isInvoice
          ? numberValue(val(row, "Btw"), subtotal * 0.21)
          : Math.round(subtotal * 0.21 * 100) / 100;
        const total = isInvoice
          ? numberValue(val(row, "Bedrag incl. btw"), subtotal + vat)
          : subtotal + vat;
        const d = emptyDoc("alka", isInvoice ? "factuur" : "offerte");
        imported.push({
          ...d,
          id: uid(),
          status: "issued",
          number,
          date,
          client,
          contact: String(val(row, "Contactpersoon") || ""),
          project: String(val(row, "Project") || ""),
          description: String(val(row, "Type opdracht") || ""),
          subtotal,
          vat,
          total,
          dueDate: excelDate(val(row, "Vervaldatum")),
          paymentStatus:
            String(val(row, "Betaald?")).toLowerCase() === "ja"
              ? "Betaald"
              : "Openstaand",
          paidDate: excelDate(val(row, "Betaaldatum")),
          quoteStatus: String(
            val(row, "Status") || "Concept",
          ) as DocumentRecord["quoteStatus"],
          acceptedDate: excelDate(val(row, "Datum akkoord")),
          linkedInvoiceNumber: String(val(row, "Factuurnummer") || ""),
          notes: String(val(row, "Opmerking") || ""),
          source: "import",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }
    const existing = new Set(
      state.documents.map(
        (d) => `${d.companyId}|${d.type}|${d.number}|${d.client}`,
      ),
    );
    const unique = imported.filter(
      (d) => !existing.has(`${d.companyId}|${d.type}|${d.number}|${d.client}`),
    );
    setState({
      ...state,
      documents: [...state.documents, ...unique],
      importFingerprints: [...state.importFingerprints, fingerprint],
    });
    flash(
      `${unique.length} historische regels geïmporteerd; bestaande regels zijn niet gewijzigd.`,
    );
  };
  const exportExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const add = (
      name: string,
      headers: string[],
      rows: (string | number)[][],
    ) => {
      const ws = wb.addWorksheet(name);
      ws.addRow(headers);
      rows.forEach((r) => ws.addRow(r));
      ws.views = [{ state: "frozen", ySplit: 1 }];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF172733" },
      };
      ws.columns.forEach((c) => (c.width = 18));
    };
    add(
      "Offertes",
      [
        "Offertedatum",
        "Offertenummer",
        "Bedrijf",
        "Opdrachtgever",
        "Contactpersoon",
        "Project",
        "Type opdracht",
        "Bedrag excl. btw",
        "Status",
        "Datum akkoord",
        "Factuurnummer",
        "Opmerking",
      ],
      docs
        .filter((d) => d.type === "offerte")
        .map((d) => [
          d.date,
          d.number,
          state.companies[d.companyId].name,
          d.client,
          d.contact,
          d.project,
          d.description,
          d.subtotal,
          d.quoteStatus,
          d.acceptedDate,
          d.linkedInvoiceNumber,
          d.notes,
        ]),
    );
    add(
      "Facturen",
      [
        "Factuurdatum",
        "Factuurnummer",
        "Bedrijf",
        "Opdrachtgever",
        "Contactpersoon",
        "Project",
        "Type opdracht",
        "Bedrag excl. btw",
        "Btw",
        "Bedrag incl. btw",
        "Vervaldatum",
        "Betaald?",
        "Betaaldatum",
        "Opmerking",
      ],
      docs
        .filter((d) => d.type === "factuur")
        .map((d) => [
          d.date,
          d.number,
          state.companies[d.companyId].name,
          d.client,
          d.contact,
          d.project,
          d.description,
          d.subtotal,
          d.vat,
          d.total,
          d.dueDate,
          d.paymentStatus === "Betaald" ? "Ja" : "Nee",
          d.paidDate,
          d.notes,
        ]),
    );
    const data = await wb.xlsx.writeBuffer();
    downloadBlob(
      new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Document-Studio-export-${todayAmsterdam()}.xlsx`,
    );
    flash("Excel-export aangemaakt");
  };
  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Administratie</span>
          <h1>
            {tab === "klanten" ? "Klantenbestand" : "Financieel overzicht"}
          </h1>
          <p>
            {tab === "klanten"
              ? "Beheer particuliere en zakelijke klanten van beide bedrijven."
              : "Facturen, offertes en betaalstatussen van beide bedrijven."}
          </p>
        </div>
        {tab !== "klanten" && (
          <div className="header-actions">
            <label className="button ghost">
              <Upload />
              Excel importeren
              <input
                hidden
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) =>
                  e.target.files?.[0] && importExcel(e.target.files[0])
                }
              />
            </label>
            <button className="primary" onClick={exportExcel}>
              <Download />
              Excel exporteren
            </button>
          </div>
        )}
      </header>
      <div className="admin-wrap">
        {tab !== "klanten" && (
          <div className="metrics">
            {[
              ["Openstaande facturen", metrics.openCount],
              ["Totaal openstaand", money(metrics.openTotal)],
              ["Totaal betaald", money(metrics.paidTotal)],
              ["Omzet excl. btw", money(metrics.revenue)],
              ["Gefactureerde btw", money(metrics.vat)],
              ["Waarde offertes", money(metrics.quoteTotal)],
            ].map(([l, v]) => (
              <div className="metric" key={l}>
                <span>{l}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        )}
        <div className="admin-tabs">
          <button
            className={tab === "vooradministratie" ? "active" : ""}
            onClick={() => setTab("vooradministratie")}
          >
            Vooradministratie
          </button>
          <button
            className={tab === "facturen" ? "active" : ""}
            onClick={() => setTab("facturen")}
          >
            Facturen
          </button>
          <button
            className={tab === "offertes" ? "active" : ""}
            onClick={() => setTab("offertes")}
          >
            Offertes
          </button>
          <button
            className={tab === "klanten" ? "active" : ""}
            onClick={() => setTab("klanten")}
          >
            <Users />
            Klantenbestand
          </button>
          <button
            className={tab === "instellingen" ? "active" : ""}
            onClick={() => setTab("instellingen")}
          >
            <Settings />
            Instellingen
          </button>
        </div>
        {tab === "instellingen" ? (
          <SettingsPanel state={state} setState={setState} flash={flash} />
        ) : tab === "klanten" ? (
          <CustomersPanel state={state} setState={setState} flash={flash} />
        ) : (
          <>
            <div className="filters">
              <div className="search">
                <Search />
                <input
                  placeholder="Zoek nummer, klant of project…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value as typeof company)}
              >
                <option value="all">Beide bedrijven</option>
                <option value="alka">ALKA Visuals</option>
                <option value="tba">Technisch Bouwadvies</option>
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as typeof period)}
              >
                <option value="all">Alle perioden</option>
                <option value="month">Deze maand</option>
                <option value="quarter">Dit kwartaal</option>
                <option value="year">Dit jaar</option>
              </select>
              <button
                className="delete-selection"
                disabled={!selectedIds.size}
                onClick={deleteSelected}
              >
                <Trash2 />
                {selectedIds.size
                  ? `Verwijderen (${selectedIds.size})`
                  : "Verwijderen"}
              </button>
            </div>
            <AdminTable
              docs={tableDocs}
              state={state}
              tab={tab}
              mark={mark}
              undo={undo}
              duplicate={duplicate}
              flash={flash}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </>
        )}
      </div>
    </>
  );
}

function AdminTable({
  docs,
  state,
  tab,
  mark,
  undo,
  duplicate,
  flash,
  selectedIds,
  setSelectedIds,
}: {
  docs: DocumentRecord[];
  state: AppState;
  tab: AdminTab;
  mark: (d: DocumentRecord) => void;
  undo: (d: DocumentRecord) => void;
  duplicate: (d: DocumentRecord) => void;
  flash: (s: string) => void;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
}) {
  const [sort, setSort] = useState<"date" | "number" | "client">("date");
  const sorted = [...docs].sort((a, b) =>
    String(b[sort]).localeCompare(String(a[sort])),
  );
  const allSelected =
    sorted.length > 0 && sorted.every((d) => selectedIds.has(d.id));
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };
  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(sorted.map((d) => d.id)));
  if (!docs.length)
    return (
      <div className="empty-state">
        <FileText />
        <h3>Nog geen documenten in dit overzicht</h3>
        <p>Nieuwe definitieve documenten verschijnen hier automatisch.</p>
      </div>
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th className="select-cell">
              <input
                aria-label="Selecteer alle zichtbare items"
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
              />
            </th>
            <th onClick={() => setSort("date")}>Datum</th>
            <th onClick={() => setSort("number")}>Nummer</th>
            <th>Bedrijf</th>
            <th onClick={() => setSort("client")}>Opdrachtgever</th>
            <th>Project</th>
            <th>Excl. btw</th>
            <th>Btw</th>
            <th>Incl. btw</th>
            <th>Status</th>
            <th>Bron</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr
              key={d.id}
              className={selectedIds.has(d.id) ? "selected-row" : ""}
            >
              <td className="select-cell">
                <input
                  aria-label={`Selecteer ${d.number || d.client || "item"}`}
                  type="checkbox"
                  checked={selectedIds.has(d.id)}
                  onChange={() => toggle(d.id)}
                />
              </td>
              <td>{fmtDate(d.date)}</td>
              <td>
                <strong>{d.number || "—"}</strong>
              </td>
              <td>{state.companies[d.companyId].name}</td>
              <td>{d.client}</td>
              <td>{d.project}</td>
              <td>{money(d.subtotal)}</td>
              <td>{money(d.vat)}</td>
              <td>
                <strong>{money(d.total)}</strong>
              </td>
              <td>
                <span
                  className={`status ${d.type === "factuur" && d.paymentStatus === "Betaald" ? "paid" : "open"}`}
                >
                  {d.type === "offerte" ? d.quoteStatus : d.paymentStatus}
                </span>
              </td>
              <td>
                <span className="source">
                  {d.source === "import" ? "Excel-import" : "App"}
                </span>
              </td>
              <td>
                <div className="row-actions">
                  {tab === "vooradministratie" && (
                    <button title="Markeer betaald" onClick={() => mark(d)}>
                      <CheckCircle2 />
                    </button>
                  )}
                  {tab === "facturen" &&
                    d.source === "app" &&
                    d.paymentStatus === "Betaald" && (
                      <button
                        title="Herstel naar openstaand"
                        onClick={() => undo(d)}
                      >
                        <RotateCcw />
                      </button>
                    )}
                  <button title="Dupliceren" onClick={() => duplicate(d)}>
                    <Copy />
                  </button>
                  {d.pdfBase64 && (
                    <button
                      title="Originele PDF openen"
                      onClick={() => {
                        downloadBlob(
                          base64ToBlob(d.pdfBase64!),
                          "document.pdf",
                        );
                        flash("Historische PDF geopend");
                      }}
                    >
                      <Eye />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPanel({
  state,
  setState,
  flash,
}: {
  state: AppState;
  setState: (s: AppState) => void;
  flash: (s: string) => void;
}) {
  const [id, setId] = useState<CompanyId>("alka");
  const c = state.companies[id];
  const patch = (key: keyof typeof c, value: string | number) =>
    setState({
      ...state,
      companies: { ...state.companies, [id]: { ...c, [key]: value } },
    });
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="settings-panel">
      <div className="segmented">
        <button
          className={id === "alka" ? "selected" : ""}
          onClick={() => setId("alka")}
        >
          ALKA Visuals
        </button>
        <button
          className={id === "tba" ? "selected" : ""}
          onClick={() => setId("tba")}
        >
          Technisch Bouwadvies
        </button>
      </div>
      <div className="settings-grid">
        {(
          [
            ["name", "Bedrijfsnaam"],
            ["legalName", "Juridische naam"],
            ["address", "Adres"],
            ["postalCity", "Postcode en plaats"],
            ["phone", "Telefoon"],
            ["email", "E-mail"],
            ["website", "Website"],
            ["kvk", "KvK-nummer"],
            ["vatId", "Btw-identificatienummer"],
            ["iban", "IBAN"],
            ["accountHolder", "Rekeninghouder"],
          ] as const
        ).map(([k, l]) => (
          <Field key={k} label={l}>
            <input
              value={String(c[k])}
              onChange={(e) => patch(k, e.target.value)}
            />
          </Field>
        ))}
        <Field label="Betalingstermijn (dagen)">
          <input
            type="number"
            value={c.paymentDays}
            onChange={(e) => patch("paymentDays", Number(e.target.value))}
          />
        </Field>
        <Field label="Standaard btw-tarief">
          <input
            type="number"
            value={c.vatRate}
            onChange={(e) => patch("vatRate", Number(e.target.value))}
          />
        </Field>
      </div>
      <Field label="Standaard betalingsvoorwaarden">
        <textarea
          rows={4}
          value={c.defaultPaymentTerms}
          onChange={(e) => patch("defaultPaymentTerms", e.target.value)}
        />
      </Field>
      <Section title="Back-up en herstel">
        <div className="header-actions">
          <button
            className="ghost"
            onClick={() =>
              createBackup(state).then(
                (ok) => ok && flash("Back-up opgeslagen"),
              )
            }
          >
            <Database />
            Handmatige back-up
          </button>
          <button className="ghost" onClick={() => fileRef.current?.click()}>
            <RotateCcw />
            Back-up herstellen
          </button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept=".json"
            onChange={(e) =>
              e.target.files?.[0] &&
              restoreBackup(e.target.files[0])
                .then((s) => {
                  if (
                    confirm("Huidige gegevens vervangen door deze back-up?")
                  ) {
                    setState(s);
                    flash("Back-up hersteld");
                  }
                })
                .catch(() => flash("Ongeldige back-up"))
            }
          />
        </div>
      </Section>
      <button
        className="primary"
        onClick={() => flash("Bedrijfsinstellingen zijn lokaal opgeslagen")}
      >
        <Save />
        Instellingen opslaan
      </button>
    </div>
  );
}

function filterDocs(
  docs: DocumentRecord[],
  company: "all" | CompanyId,
  q: string,
  period: "all" | "month" | "quarter" | "year",
) {
  const now = new Date(),
    term = q.toLowerCase();
  return docs.filter((d) => {
    if (company !== "all" && d.companyId !== company) return false;
    if (
      term &&
      !`${d.number} ${d.client} ${d.project}`.toLowerCase().includes(term)
    )
      return false;
    if (period === "all" || !d.date) return true;
    const x = new Date(`${d.date}T12:00:00`);
    if (x.getFullYear() !== now.getFullYear()) return false;
    if (period === "year") return true;
    if (period === "month") return x.getMonth() === now.getMonth();
    return Math.floor(x.getMonth() / 3) === Math.floor(now.getMonth() / 3);
  });
}
function cellValue(v: ExcelJS.CellValue): unknown {
  if (v && typeof v === "object" && "result" in v) return v.result;
  if (v && typeof v === "object" && "text" in v) return v.text;
  return v;
}
function excelDate(v: unknown) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  if (!v) return "";
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}
function numberValue(v: unknown, fallback: number) {
  return typeof v === "number" ? v : fallback;
}
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
function base64ToBlob(data: string) {
  const [meta, body] = data.split(",");
  const bytes = atob(body);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], {
    type: meta.match(/:(.*?);/)?.[1] || "application/pdf",
  });
}
