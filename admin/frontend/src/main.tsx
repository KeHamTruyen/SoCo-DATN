import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemePreferenceProvider } from "@/theme/ThemePreferenceProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemePreferenceProvider>
            <App />
        </ThemePreferenceProvider>
    </StrictMode>,
);
