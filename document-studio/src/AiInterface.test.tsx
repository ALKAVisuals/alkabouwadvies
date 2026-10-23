// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import AiChat from "./AiChat";
import { makePdfBlob } from "./pdf";

const mocks = vi.hoisted(() => ({
  pendingReject: null as null | ((reason: string) => void),
  chatCalls: [] as unknown[],
  cancelCalls: [] as unknown[],
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(async (command: string, args?: Record<string, unknown>) => {
    if (command === "load_state") return "";
    if (command === "simple_ai_status") return {
      connected: true,
      modelAvailable: true,
      model: "qwen2.5:3b",
      message: "Verbonden",
    };
    if (command === "simple_ai_chat") {
      mocks.chatCalls.push(args);
      const request = args?.request as {
        requestId: string;
        messages: Array<{ content: string }>;
      };
      const latest = request.messages.at(-1)?.content;
      if (latest === "Blijf bezig") {
        return await new Promise((_, reject) => {
          mocks.pendingReject = reject;
        });
      }
      return {
        requestId: request.requestId,
        content: latest === "En wat nog meer?"
          ? "Ik kan ook algemene vragen over bouwadvies beantwoorden."
          : "Ik kan helpen met algemene vragen over Technisch Bouwadvies.",
        durationMs: 25,
      };
    }
    if (command === "simple_ai_cancel") {
      mocks.cancelCalls.push(args);
      mocks.pendingReject?.("Het AI-bericht is geannuleerd.");
      mocks.pendingReject = null;
      return true;
    }
    if (command === "save_state") return undefined;
    return undefined;
  }),
}));

vi.mock("./pdf", () => ({
  makePdfBlob: vi.fn(async () => new Blob(["pdf"], { type: "application/pdf" })),
  exportPdf: vi.fn(async () => undefined),
}));

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:test"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

beforeEach(() => {
  mocks.pendingReject = null;
  mocks.chatCalls.length = 0;
  mocks.cancelCalls.length = 0;
  vi.mocked(makePdfBlob).mockClear();
});

afterEach(() => cleanup());

describe("geïsoleerde eenvoudige AI-chat", () => {
  it("verwerkt meerdere berichten zonder formulier- of previewupdate", async () => {
    const pdfMock = vi.mocked(makePdfBlob);
    render(<App />);
    await screen.findByRole("button", { name: /^ALKA Visuals$/i });
    fireEvent.click(screen.getByRole("button", { name: /Technisch Bouwadvies/i }));
    await waitFor(() => expect(pdfMock.mock.calls.at(-1)?.[0].companyId).toBe("tba"));

    const clientBefore = (screen.getByLabelText("Opdrachtgever *") as HTMLInputElement).value;
    const previewCallsBefore = pdfMock.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /^AI-assistent$/i }));
    const input = await screen.findByPlaceholderText("Stel een vraag aan de lokale AI…");

    fireEvent.change(input, { target: { value: "Waarmee kun je me helpen?" } });
    fireEvent.click(screen.getByRole("button", { name: /Verzenden/i }));
    await screen.findByText("Ik kan helpen met algemene vragen over Technisch Bouwadvies.");

    fireEvent.change(input, { target: { value: "En wat nog meer?" } });
    fireEvent.click(screen.getByRole("button", { name: /Verzenden/i }));
    await screen.findByText("Ik kan ook algemene vragen over bouwadvies beantwoorden.");

    expect(mocks.chatCalls).toHaveLength(2);
    expect((screen.getByLabelText("Opdrachtgever *") as HTMLInputElement).value).toBe(clientBefore);
    expect(pdfMock).toHaveBeenCalledTimes(previewCallsBefore);
    expect(screen.queryByText("Document Studio kon dit onderdeel niet weergeven")).toBeNull();
  });

  it("annuleert een lopend bericht zonder de chat te laten crashen", async () => {
    render(<AiChat open onClose={() => undefined} />);
    const input = await screen.findByPlaceholderText("Stel een vraag aan de lokale AI…");
    fireEvent.change(input, { target: { value: "Blijf bezig" } });
    fireEvent.click(screen.getByRole("button", { name: /Verzenden/i }));
    fireEvent.click(await screen.findByRole("button", { name: /^Annuleren$/i }));

    await screen.findByText("Het AI-bericht is geannuleerd.");
    expect(mocks.cancelCalls).toHaveLength(1);
    expect(screen.queryByText("Document Studio kon dit onderdeel niet weergeven")).toBeNull();
  });
});
