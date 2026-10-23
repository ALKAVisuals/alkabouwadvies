import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "./styles.css";
import "./quoteImport.css";
import "./admin-selection.css";
import "./customers.css";
import "./errorBoundary.css";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
