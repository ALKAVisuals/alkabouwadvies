import { describe, expect, it } from "vitest";
import { applyAiPlan, findCustomers, parseAiPlan, type AiPlan } from "./aiAssistant";
import { emptyDoc, initialState } from "./defaults";
import { calculate } from "./domain";
import type { AppState, Customer, DocumentRecord } from "./types";

const customer: Customer = {
  id: "ferry-1",
  category: "particulier",
  companyName: "",
  firstName: "Ferry",
  lastName: "Janssen",
  street: "Dorpsstraat",
  houseNumber: "12",
  postalCode: "1234 AB",
  city: "Nijmegen",
  country: "Nederland",
  kvk: "",
  vatId: "",
  email: "ferry@example.nl",
  phone: "",
  notes: "",
  linkedCompanies: ["tba"],
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};
const state = (documents: DocumentRecord[] = []): AppState => ({
  ...initialState,
  customers: [customer],
  documents,
});
const basePlan = (changes: Partial<AiPlan> = {}): AiPlan => ({
  intent: "update",
  new_document: false,
  customer: {
    existing_query: null,
    category: null,
    company_name: null,
    first_name: null,
    last_name: null,
    street: null,
    house_number: null,
    postal_code: null,
    city: null,
    country: null,
    email: null,
    phone: null,
    kvk: null,
    vat_id: null,
  },
  document: {
    project: null,
    project_address: null,
    description: null,
    exclusions: null,
    additional_explanation: null,
    corrections: null,
    additional_terms: null,
    payment_terms: null,
    price_mode: null,
    package_price: null,
    package_price_includes_vat: false,
    vat_rate: null,
  },
  line_actions: [],
  reference_quote_query: null,
  missing: [],
  questions: [],
  summary: "Verwerkt",
  confidence: 0.95,
  ...changes,
});

describe("lokale AI-plannen", () => {
  it("valideert onvolledige JSON defensief", () => {
    const plan = parseAiPlan('{"intent":"offerte","confidence":0.9}');
    expect(plan.intent).toBe("offerte");
    expect(plan.line_actions).toEqual([]);
    expect(plan.customer.first_name).toBeNull();
  });

  it("weigert ongeldige JSON", () => {
    expect(() => parseAiPlan("geen json")).toThrow(/gestructureerde/);
  });

  it("vindt een bestaande particuliere klant", () => {
    expect(findCustomers([customer], "Ferry Janssen")).toEqual([customer]);
  });

  it("vraagt verduidelijking bij dubbele klantnamen zonder formulierwijziging", () => {
    const duplicate = { ...customer, id: "ferry-2", city: "Arnhem" };
    const draft = emptyDoc("tba");
    const result = applyAiPlan(
      basePlan({ customer: { ...basePlan().customer, existing_query: "Ferry Janssen" } }),
      draft,
      { ...state(), customers: [customer, duplicate] },
    );
    expect(result.applied).toBe(false);
    expect(result.document).toBe(draft);
    expect(result.needsClarification[0]).toMatch(/Meerdere klanten/);
  });

  it("bereidt een nieuwe particuliere klant zonder verzonnen adres voor", () => {
    const plan = basePlan({
      intent: "offerte",
      new_document: true,
      customer: {
        ...basePlan().customer,
        category: "particulier",
        first_name: "Jan",
        last_name: "de Vries",
        city: "Nijmegen",
      },
    });
    const result = applyAiPlan(
      plan,
      emptyDoc("tba"),
      state(),
      "Ik heb een nieuwe klant, Jan de Vries uit Nijmegen.",
    );
    expect(result.document.client).toBe("Jan de Vries");
    expect(result.document.clientAddress).toBe("Nijmegen");
    expect(result.document.customerId).toBeUndefined();
    expect(result.preparedCustomer).toBe(true);
  });

  it("vult een TBA-offerte voor een nieuwe particulier met 800 euro inclusief btw", () => {
    const plan = basePlan({
      intent: "offerte",
      new_document: true,
      customer: {
        ...basePlan().customer,
        category: "particulier",
        first_name: "Ruben",
        last_name: "van Rhee",
      },
      document: {
        ...basePlan().document,
        project: "Constructieve haalbaarheidsanalyse",
        project_address: "Wassenaarweg 40, 6843 NW Arnhem",
        price_mode: "services",
      },
      line_actions: [{
        action: "add",
        match: null,
        description: "Constructieve haalbaarheidsanalyse",
        quantity: 1,
        unit_price: 800,
        price_includes_vat: true,
        optional: false,
      }],
    });
    const result = applyAiPlan(
      plan,
      emptyDoc("tba", "offerte"),
      state(),
      "Nieuwe particuliere klant Ruben van Rhee. Project: constructieve haalbaarheidsanalyse op Wassenaarweg 40, 6843 NW Arnhem. Eén offertregel van €800 inclusief btw.",
    );
    const calculated = calculate(result.document);
    expect(result.applied).toBe(true);
    expect(result.preparedCustomer).toBe(true);
    expect(result.document.client).toBe("Ruben van Rhee");
    expect(result.document.projectAddress).toBe("Wassenaarweg 40, 6843 NW Arnhem");
    expect(result.document.lines.at(-1)?.unitPrice).toBeCloseTo(661.16, 2);
    expect(calculated.total).toBeCloseTo(800, 2);
  });

  it("bereidt een zakelijke klant met contactpersoon voor", () => {
    const plan = basePlan({
      customer: {
        ...basePlan().customer,
        category: "bedrijf",
        company_name: "ROQ Vastgoed",
        first_name: "Bart",
        last_name: "Janssen",
        city: "Arnhem",
      },
    });
    const result = applyAiPlan(plan, emptyDoc("tba"), state());
    expect(result.document.client).toBe("ROQ Vastgoed");
    expect(result.document.contact).toBe("Bart Janssen");
  });

  it("corrigeert een model dat een expliciet nieuwe klant toch wil opzoeken", () => {
    const plan = basePlan({
      intent: "offerte",
      new_document: true,
      customer: {
        ...basePlan().customer,
        existing_query: "Jan de Vries",
        category: "particulier",
        first_name: "Jan",
        last_name: "de Vries",
        city: "Nijmegen",
      },
      document: {
        ...basePlan().document,
        project: "Aanbouw",
        price_mode: "package",
        package_price: 350,
      },
      line_actions: [
        {
          action: "add",
          match: null,
          description: "Bouwtekening voor een aanbouw",
          quantity: 1,
          unit_price: 350,
          price_includes_vat: false,
          optional: false,
        },
      ],
    });
    const result = applyAiPlan(
      plan,
      emptyDoc("tba"),
      state(),
      "Ik heb een nieuwe klant, Jan de Vries uit Nijmegen. Hij wil een bouwtekening voor een aanbouw van €350 exclusief btw.",
    );
    expect(result.applied).toBe(true);
    expect(result.document.client).toBe("Jan de Vries");
    expect(result.document.clientAddress).toBe("Nijmegen");
    expect(result.document.priceMode).not.toBe("package");
    expect(calculate(result.document).subtotal).toBe(350);
  });

  it("voegt meerdere dienstregels toe en laat de app rekenen", () => {
    const plan = basePlan({
      line_actions: [
        { action: "add", match: null, description: "Bouwkundige tekening", quantity: 1, unit_price: 350, price_includes_vat: false, optional: false },
        { action: "add", match: null, description: "3D-visualisatie", quantity: 2, unit_price: 150, price_includes_vat: false, optional: false },
      ],
    });
    const result = applyAiPlan(plan, emptyDoc("tba"), state());
    expect(result.document.lines.filter((line) => line.selected)).toHaveLength(2);
    expect(calculate(result.document).subtotal).toBe(650);
  });

  it("zet een inclusief-btw-prijs om naar exclusief en rekent correct terug", () => {
    const plan = basePlan({
      line_actions: [{ action: "add", match: null, description: "Analyse", quantity: 1, unit_price: 800, price_includes_vat: true, optional: false }],
    });
    const result = applyAiPlan(plan, emptyDoc("tba"), state());
    expect(result.document.lines.at(-1)?.unitPrice).toBe(661.16);
    expect(calculate(result.document).total).toBe(800);
  });

  it("voegt optionele werkzaamheden niet als betaalde regel toe", () => {
    const plan = basePlan({
      line_actions: [{ action: "add", match: null, description: "Constructieberekening", quantity: 1, unit_price: null, price_includes_vat: false, optional: true }],
    });
    const result = applyAiPlan(plan, emptyDoc("tba"), state());
    expect(result.document.lines.some((line) => line.selected)).toBe(false);
    expect(result.warnings[0]).toMatch(/mogelijkheid/);
  });

  it("meldt een ontbrekende prijs", () => {
    const plan = basePlan({
      line_actions: [{ action: "add", match: null, description: "Bouwtekening", quantity: 1, unit_price: null, price_includes_vat: false, optional: false }],
    });
    const result = applyAiPlan(plan, emptyDoc("tba"), state());
    expect(result.warnings).toContain("Prijs ontbreekt voor Bouwtekening.");
  });

  it("neemt een eenduidige bestaande offerte over als factuurconcept", () => {
    const quote = {
      ...emptyDoc("tba", "offerte"),
      number: "O-18102026-A",
      client: "Ferry Janssen",
      project: "Aanbouw",
      status: "issued" as const,
    };
    const plan = basePlan({
      intent: "factuur",
      new_document: true,
      reference_quote_query: "O-18102026-A",
    });
    const current = emptyDoc("tba", "factuur");
    const result = applyAiPlan(plan, current, state([quote]));
    expect(result.document.type).toBe("factuur");
    expect(result.document.client).toBe("Ferry Janssen");
    expect(result.document.number).toBe(current.number);
  });

  it("wijzigt een bestaande regel zonder duplicaat", () => {
    const draft = emptyDoc("tba");
    draft.lines[0] = { ...draft.lines[0], selected: true, description: "Bouwtekening", unitPrice: 300 };
    const plan = basePlan({ line_actions: [{ action: "update", match: "Bouwtekening", description: "Bouwtekening aanbouw", quantity: 1, unit_price: 350, price_includes_vat: false, optional: false }] });
    const result = applyAiPlan(plan, draft, state());
    expect(result.document.lines.filter((line) => line.selected)).toHaveLength(1);
    expect(result.document.lines[0].unitPrice).toBe(350);
  });

  it("verplaatst een dienst naar Niet inbegrepen", () => {
    const draft = emptyDoc("tba");
    draft.lines[0] = { ...draft.lines[0], selected: true, description: "Bouwtekening" };
    const plan = basePlan({ line_actions: [{ action: "move_to_exclusions", match: "Bouwtekening", description: null, quantity: null, unit_price: null, price_includes_vat: false, optional: false }] });
    const result = applyAiPlan(plan, draft, state());
    expect(result.document.lines.some((line) => line.selected && line.description === "Bouwtekening")).toBe(false);
    expect(result.document.exclusions).toContain("Bouwtekening");
  });

  it("past alleen de gevraagde opdrachtomschrijving aan", () => {
    const draft = { ...emptyDoc("tba"), client: "Bestaande klant", project: "Bestaand project" };
    const plan = basePlan({ document: { ...basePlan().document, description: "Korte zakelijke omschrijving." } });
    const result = applyAiPlan(plan, draft, state());
    expect(result.document.description).toBe("Korte zakelijke omschrijving.");
    expect(result.document.client).toBe("Bestaande klant");
    expect(result.document.project).toBe("Bestaand project");
  });

  it("past niets toe bij lage betrouwbaarheid", () => {
    const draft = emptyDoc("tba");
    const result = applyAiPlan(basePlan({ confidence: 0.2 }), draft, state());
    expect(result.applied).toBe(false);
    expect(result.document).toBe(draft);
  });
});
