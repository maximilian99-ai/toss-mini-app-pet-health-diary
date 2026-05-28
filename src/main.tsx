import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import config from "../granite.config.ts";
import App from "./App.tsx";
import { AppProvider } from "./contexts/AppContext.tsx";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TDSMobileAITProvider brandPrimaryColor={config.brand.primaryColor}>
      <AppProvider>
        <App />
      </AppProvider>
    </TDSMobileAITProvider>
  </StrictMode>,
);
