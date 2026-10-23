import { describe, expect, it } from "vitest";
import { emptyDoc, initialState } from "./defaults";
import {
  applyCustomerToDocument,
  customerFromDocument,
  emptyCustomer,
  registerInvoiceCustomer,
} from "./customers";
import { migrateState } from "./storage";
import type { AppState } from "./types";

const freshState = (): AppState => ({
  ...initialState,
  companies: { ...initialState.companies },
  documents: [],
  customers: [],
});

describe("klantenbestand", () => {
  it("maakt particuliere en zakelijke klantprofielen met unieke ids", () => {
    const privateCustomer = emptyCustomer("particulier", "particulier-1");
    privateCustomer.firstName = "Ruben";
    privateCustomer.lastName = "van Rhee";
    const businessCustomer = emptyCustomer("bedrijf", "bedrijf-1");
    businessCustomer.companyName = "Voorbeeld B.V.";
    expect(privateCustomer).toMatchObject({
      id: "particulier-1",
      category: "particulier",
      country: "Nederland",
    });
    expect(businessCustomer).toMatchObject({
      id: "bedrijf-1",
      category: "bedrijf",
      companyName: "Voorbeeld B.V.",
    });
  });

  it("maakt bij een eerste factuur automatisch één klant aan", () => {
    const invoice = emptyDoc("alka", "factuur");
    invoice.client = "Ruben van Rhee";
    invoice.clientAddress = "Wassenaarweg 40\n6843 NW Arnhem\nNederland";
    const result = registerInvoiceCustomer(
      freshState(),
      invoice,
      () => "klant-1",
    );
    expect(result.status).toBe("created");
    expect(result.state.customers).toHaveLength(1);
    expect(result.customer).toMatchObject({
      firstName: "Ruben",
      lastName: "van Rhee",
      street: "Wassenaarweg",
      houseNumber: "40",
      postalCode: "6843 NW",
      city: "Arnhem",
    });
  });

  it("maakt voor een tweede factuur van dezelfde klant geen duplicaat", () => {
    const invoice = emptyDoc("alka", "factuur");
    invoice.client = "Voorbeeld B.V.";
    invoice.contact = "Ada Jansen";
    invoice.clientAddress = "Markt 12, 6811 AA Arnhem, Nederland";
    const first = registerInvoiceCustomer(
      freshState(),
      invoice,
      () => "klant-1",
    );
    const second = registerInvoiceCustomer(
      first.state,
      invoice,
      () => "klant-2",
    );
    expect(second.status).toBe("updated");
    expect(second.state.customers).toHaveLength(1);
  });

  it("vult een nieuwe offerte vanuit een bestaande klant zonder historische documenten te koppelen", () => {
    const customer = emptyCustomer("bedrijf", "klant-1");
    Object.assign(customer, {
      companyName: "Voorbeeld B.V.",
      firstName: "Ada",
      lastName: "Jansen",
      street: "Markt",
      houseNumber: "12",
      postalCode: "6811 AA",
      city: "Arnhem",
      email: "ada@example.nl",
    });
    const quote = applyCustomerToDocument(emptyDoc("tba", "offerte"), customer);
    expect(quote).toMatchObject({
      customerId: "klant-1",
      client: "Voorbeeld B.V.",
      contact: "Ada Jansen",
      clientAddress: "Markt 12\n6811 AA Arnhem\nNederland",
    });
  });

  it("kan één klant aan beide bedrijven koppelen", () => {
    const alkaInvoice = emptyDoc("alka", "factuur");
    alkaInvoice.client = "Ruben van Rhee";
    alkaInvoice.clientAddress = "Wassenaarweg 40\n6843 NW Arnhem";
    const first = registerInvoiceCustomer(
      freshState(),
      alkaInvoice,
      () => "klant-1",
    );
    const tbaInvoice = {
      ...alkaInvoice,
      id: "factuur-2",
      companyId: "tba" as const,
    };
    const second = registerInvoiceCustomer(
      first.state,
      tbaInvoice,
      () => "klant-2",
    );
    expect(second.state.customers).toHaveLength(1);
    expect(second.customer.linkedCompanies.sort()).toEqual(["alka", "tba"]);
  });

  it("bewaart klanten na migratie en verandert bestaande factuurgegevens niet", () => {
    const state = freshState();
    const customer = emptyCustomer("particulier", "klant-1");
    customer.firstName = "Oude";
    customer.lastName = "Naam";
    const invoice = emptyDoc("alka", "factuur");
    invoice.client = "Oude Naam";
    state.customers = [customer];
    state.documents = [invoice];
    const restored = migrateState(JSON.parse(JSON.stringify(state)));
    restored.customers[0] = { ...restored.customers[0], firstName: "Nieuwe" };
    expect(restored.customers).toHaveLength(1);
    expect(restored.documents[0].client).toBe("Oude Naam");
  });

  it("herkent een zakelijke klant uit factuurgegevens", () => {
    const invoice = emptyDoc("alka", "factuur");
    invoice.client = "Studio Voorbeeld B.V.";
    invoice.contact = "Ada Jansen";
    const customer = customerFromDocument(invoice, "klant-1");
    expect(customer).toMatchObject({
      category: "bedrijf",
      companyName: "Studio Voorbeeld B.V.",
      firstName: "Ada",
      lastName: "Jansen",
    });
  });
});
