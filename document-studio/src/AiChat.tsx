import { useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  MessageSquarePlus,
  Send,
  Square,
  Unplug,
  X,
} from "lucide-react";
import {
  cancelSimpleAiMessage,
  getSimpleAiStatus,
  sendSimpleAiMessage,
  type SimpleAiStatus,
  type SimpleChatMessage,
} from "./simpleAiChat";
import "./aiChat.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

type DisplayMessage = SimpleChatMessage & { id: string };

const createId = () => crypto.randomUUID();
const welcomeMessage = (): DisplayMessage => ({
  id: createId(),
  role: "assistant",
  content:
    "Hallo! Ik ben de lokale assistent van Technisch Bouwadvies. Stel gerust een vraag. In deze testfase wijzig ik geen formulieren of documenten.",
});

function errorText(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error instanceof Error && error.message.trim()) return error.message;
  return "De lokale AI kon het bericht niet verwerken. Probeer het opnieuw.";
}

export default function AiChat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<DisplayMessage[]>([welcomeMessage()]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState<SimpleAiStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const activeRequest = useRef<string | null>(null);
  const mounted = useRef(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  useEffect(() => {
    if (open && !status && !checking) void checkConnection();
  }, [open, status, checking]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const next = await getSimpleAiStatus();
      if (mounted.current) setStatus(next);
    } catch (error) {
      if (mounted.current) {
        setStatus({
          connected: false,
          modelAvailable: false,
          model: "qwen2.5:3b",
          message: errorText(error),
        });
      }
    } finally {
      if (mounted.current) setChecking(false);
    }
  };

  const appendAssistant = (content: string) => {
    const safeContent = typeof content === "string" ? content.trim() : "";
    if (!safeContent) return;
    const assistantMessage: DisplayMessage = {
      id: createId(),
      role: "assistant",
      content: safeContent,
    };
    setMessages((current) =>
      [...current, assistantMessage].slice(-30),
    );
  };

  const send = async () => {
    const content = input.trim();
    if (!content || busy) return;

    const userMessage: DisplayMessage = { id: createId(), role: "user", content };
    const conversation: SimpleChatMessage[] = [
      ...messages.map<SimpleChatMessage>(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      })),
      { role: "user" as const, content },
    ].slice(-12);
    const requestId = createId();

    activeRequest.current = requestId;
    setMessages((current) => [...current, userMessage].slice(-30));
    setInput("");
    setBusy(true);
    setCancelling(false);

    try {
      const response = await sendSimpleAiMessage(requestId, conversation);
      if (mounted.current && activeRequest.current === requestId) {
        appendAssistant(response.content);
        setStatus((current) => current ? { ...current, connected: true, modelAvailable: true } : current);
      }
    } catch (error) {
      if (mounted.current && activeRequest.current === requestId) {
        appendAssistant(errorText(error));
      }
    } finally {
      if (mounted.current && activeRequest.current === requestId) {
        activeRequest.current = null;
        setBusy(false);
        setCancelling(false);
      }
    }
  };

  const cancel = async () => {
    const requestId = activeRequest.current;
    if (!requestId || cancelling) return;
    setCancelling(true);
    try {
      await cancelSimpleAiMessage(requestId);
    } catch (error) {
      appendAssistant(`Annuleren is niet gelukt: ${errorText(error)}`);
      setCancelling(false);
    }
  };

  const startNewConversation = () => {
    if (busy) return;
    setMessages([welcomeMessage()]);
    setInput("");
  };

  if (!open) return null;
  const available = status?.connected && status.modelAvailable;

  return (
    <aside className="ai-chat" aria-label="Lokale AI-assistent">
      <header className="ai-chat-header">
        <div>
          <Bot />
          <span>
            <strong>TBA AI-assistent</strong>
            <small>Eenvoudige chat · qwen2.5:3b</small>
          </span>
        </div>
        <button title="Chat sluiten" onClick={onClose}><X /></button>
      </header>

      <div className={`ai-status ${available ? "online" : "offline"}`}>
        {checking ? <LoaderCircle className="spin" /> : available ? <CheckCircle2 /> : <Unplug />}
        <span>{checking ? "Verbinding controleren…" : status?.message || "Status onbekend"}</span>
        <button disabled={checking || busy} onClick={() => void checkConnection()}>
          Test verbinding
        </button>
      </div>

      <div className="ai-toolbar">
        <button disabled={busy} onClick={startNewConversation}>
          <MessageSquarePlus /> Nieuw gesprek
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((message) => (
          <article className={`ai-message ${message.role}`} key={message.id}>
            <p>{message.content}</p>
          </article>
        ))}
        {busy && (
          <div className="ai-processing">
            <LoaderCircle className="spin" />
            <span>De lokale AI maakt een antwoord…</span>
            <button onClick={() => void cancel()} disabled={cancelling}>
              <Square /> {cancelling ? "Annuleren…" : "Annuleren"}
            </button>
          </div>
        )}
        {!available && status && !checking && (
          <div className="ai-offline-help">
            <CircleAlert />
            Start Ollama op deze computer. De gewone generator blijft normaal werken.
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="ai-compose">
        <textarea
          rows={6}
          value={input}
          disabled={busy}
          placeholder="Stel een vraag aan de lokale AI…"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <div>
          <small>Ctrl + Enter om te verzenden</small>
          <button disabled={busy || !input.trim() || !available} onClick={() => void send()}>
            <Send /> Verzenden
          </button>
        </div>
      </div>
    </aside>
  );
}
