import { invoke } from "@tauri-apps/api/core";

export type SimpleChatRole = "user" | "assistant";

export interface SimpleChatMessage {
  role: SimpleChatRole;
  content: string;
}

export interface SimpleAiStatus {
  connected: boolean;
  modelAvailable: boolean;
  model: string;
  message: string;
}

interface SimpleChatResponse {
  requestId: string;
  content: string;
  durationMs: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getSimpleAiStatus(): Promise<SimpleAiStatus> {
  const value: unknown = await invoke("simple_ai_status");
  if (
    !isRecord(value) ||
    typeof value.connected !== "boolean" ||
    typeof value.modelAvailable !== "boolean" ||
    typeof value.model !== "string" ||
    typeof value.message !== "string"
  ) {
    throw new Error("Ollama gaf een ongeldige status terug.");
  }
  return value as unknown as SimpleAiStatus;
}

export async function sendSimpleAiMessage(
  requestId: string,
  messages: SimpleChatMessage[],
): Promise<SimpleChatResponse> {
  const value: unknown = await invoke("simple_ai_chat", {
    request: {
      requestId,
      messages: messages.slice(-12),
      timeoutSeconds: 60,
    },
  });
  if (
    !isRecord(value) ||
    value.requestId !== requestId ||
    typeof value.content !== "string" ||
    !value.content.trim() ||
    typeof value.durationMs !== "number"
  ) {
    throw new Error("Ollama gaf geen bruikbaar tekstantwoord terug.");
  }
  return value as unknown as SimpleChatResponse;
}

export async function cancelSimpleAiMessage(requestId: string): Promise<boolean> {
  return invoke<boolean>("simple_ai_cancel", { requestId });
}
