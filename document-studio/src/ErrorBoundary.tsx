import { Component, type ErrorInfo, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const diagnostic = {
      time: new Date().toISOString(),
      name: error.name,
      message: error.message.slice(0, 300),
      stack: error.stack?.slice(0, 1200),
      component: info.componentStack?.slice(0, 600),
    };
    try {
      localStorage.setItem("document-studio-last-ui-error", JSON.stringify(diagnostic));
    } catch {
      // The persistent backend log below remains available when WebView storage fails.
    }
    void invoke("log_ai_frontend", {
      metrics: { event: "ui_error", ...diagnostic },
    }).catch(() => undefined);
    console.error("Document Studio UI-fout", diagnostic);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="fatal-error" role="alert">
        <div>
          <h1>Document Studio kon dit onderdeel niet weergeven</h1>
          <p>
            Je gegevens zijn niet verwijderd. Start de interface opnieuw; een
            mislukte AI-opdracht wordt niet toegepast.
          </p>
          <button onClick={() => window.location.reload()}>
            Interface opnieuw laden
          </button>
        </div>
      </main>
    );
  }
}
