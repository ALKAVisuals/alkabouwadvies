import { describe, expect, it } from "vitest";
import {
  calculate,
  hasDuplicateNumber,
  markPaid,
  nextNumber,
  parseNumericInput,
  totals,
} from "./domain";
import { emptyDoc, initialState } from "./defaults";
describe("bedrijfslogica", () => {
  it("berekent diensten, btw en totaal correct", () => {
    const d = emptyDoc("alka", "factuur");
    d.lines[0] = { ...d.lines[0], selected: true, quantity: 2, unitPrice: 125 };
    expect(calculate(d)).toEqual({ subtotal: 250, vat: 52.5, total: 302.5 });
  });
  it("rekent een inclusief-btw pakket terug zonder fictieve regelprijzen", () => {
    const d = emptyDoc("alka");
    d.priceMode = "package";
    d.packagePrice = 121;
    d.amountsIncludeVat = true;
    expect(calculate(d)).toEqual({ subtotal: 100, vat: 21, total: 121 });
  });
  it("houdt vrije tekst in aantal en prijs buiten de berekening", () => {
    const d = emptyDoc("tba", "offerte");
    d.lines[0] = {
      ...d.lines[0],
      selected: true,
      quantity: 0,
      unitPrice: 0,
      quantityText: "Inbegrepen",
      unitPriceText: "Op aanvraag",
    };
    expect(calculate(d)).toEqual({ subtotal: 0, vat: 0, total: 0 });
    expect(parseNumericInput("1,5")).toBe(1.5);
    expect(parseNumericInput("N.v.t.")).toBeNull();
  });
  it("gaat na Z door met AA", () => {
    const date = "2026-10-15";
    const docs = Array.from({ length: 26 }, (_, i) => ({
      ...emptyDoc("alka", "factuur"),
      id: String(i),
      status: "issued" as const,
      date,
      number: `F-15102026-${String.fromCharCode(65 + i)}`,
    }));
    expect(
      nextNumber({ ...initialState, documents: docs }, "alka", "factuur", date),
    ).toBe("F-15102026-AA");
  });
  it("betaald markeren bewaart record en voegt datum toe", () => {
    const d = markPaid(emptyDoc("tba", "factuur"), "2026-10-15");
    expect(d.paymentStatus).toBe("Betaald");
    expect(d.paidDate).toBe("2026-10-15");
  });
  it("herkent een dubbel definitief documentnummer hoofdletterongevoelig", () => {
    const existing = {
      ...emptyDoc("tba", "factuur"),
      id: "bestaand",
      status: "issued" as const,
      number: "F-18102026-A",
    };
    const candidate = { ...emptyDoc("tba", "factuur"), id: "nieuw" };
    expect(
      hasDuplicateNumber(
        { ...initialState, documents: [existing] },
        candidate,
        "f-18102026-a",
      ),
    ).toBe(true);
    expect(
      hasDuplicateNumber(
        { ...initialState, documents: [existing] },
        { ...candidate, type: "offerte" },
        "F-18102026-A",
      ),
    ).toBe(true);
  });
  it("telt offertes niet als omzet", () => {
    const i = {
      ...emptyDoc("alka", "factuur"),
      status: "issued" as const,
      subtotal: 100,
      vat: 21,
      total: 121,
    };
    const q = {
      ...emptyDoc("alka", "offerte"),
      status: "issued" as const,
      subtotal: 500,
      vat: 105,
      total: 605,
    };
    expect(totals([i, q]).revenue).toBe(100);
    expect(totals([i, q]).quoteTotal).toBe(605);
  });
});
