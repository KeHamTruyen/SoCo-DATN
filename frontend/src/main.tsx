import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./app/providers/AuthProvider";
import { NotificationProvider } from "./features/notification/context/NotificationContext";
import { ThemePreferenceProvider } from "./shared/theme/ThemePreferenceProvider";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemePreferenceProvider>
            <AuthProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </AuthProvider>
        </ThemePreferenceProvider>
    </StrictMode>,
);
