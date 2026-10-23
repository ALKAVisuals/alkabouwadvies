import { invoke } from "@tauri-apps/api/core";
import type { AppState } from "./types";
import { initialState, settings, TBA_ADDITIONAL_EXPLANATION } from "./defaults";
const KEY = "document-studio-state-v1";
const inTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
export function migrateState(state: AppState): AppState {
  return {
    ...state,
    version: 3,
    companies: {
      alka: { ...settings.alka, ...state.companies?.alka },
      tba: { ...settings.tba, ...state.companies?.tba },
    },
    documents: (state.documents || []).map((document) => {
      const moveOldDefault =
        document.companyId === "tba" &&
        !document.additionalExplanation &&
        document.exclusions?.trim() === TBA_ADDITIONAL_EXPLANATION;
      return {
        ...document,
        numberManuallySet:
          document.numberManuallySet ?? Boolean(document.number),
        additionalExplanation:
          document.additionalExplanation ??
          (moveOldDefault ? TBA_ADDITIONAL_EXPLANATION : ""),
        exclusions: moveOldDefault ? "" : (document.exclusions ?? ""),
        lines: (document.lines || []).map((line) => ({
          ...line,
          quantity: Number.isFinite(Number(line.quantity))
            ? Number(line.quantity)
            : 0,
          unitPrice: Number.isFinite(Number(line.unitPrice))
            ? Number(line.unitPrice)
            : 0,
        })),
      };
    }),
    customers: (state.customers || []).map((customer) => ({
      ...customer,
      country: customer.country || "Nederland",
      linkedCompanies: Array.isArray(customer.linkedCompanies)
        ? customer.linkedCompanies
        : [],
    })),
  };
}
export async function loadState(): Promise<AppState> {
  try {
    if (inTauri()) {
      const raw = await invoke<string>("load_state");
      return raw ? migrateState(JSON.parse(raw)) : initialState;
    }
    const raw = localStorage.getItem(KEY);
    return raw ? migrateState(JSON.parse(raw)) : initialState;
  } catch {
    return initialState;
  }
}
export async function saveState(state: AppState) {
  if (inTauri()) await invoke("save_state", { json: JSON.stringify(state) });
  else localStorage.setItem(KEY, JSON.stringify(state));
}
export async function createBackup(state: AppState) {
  const json = JSON.stringify(state, null, 2);
  if (inTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({
      defaultPath: `document-studio-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "Document Studio back-up", extensions: ["json"] }],
    });
    if (path) await writeTextFile(path, json);
    return Boolean(path);
  }
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(
    blob,
    `document-studio-backup-${new Date().toISOString().slice(0, 10)}.json`,
  );
  return true;
}
export async function restoreBackup(file: File): Promise<AppState> {
  const parsed = JSON.parse(await file.text());
  if (!parsed?.companies || !Array.isArray(parsed?.documents))
    throw new Error("Ongeldige back-up");
  return migrateState(parsed);
}
export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
