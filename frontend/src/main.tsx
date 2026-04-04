import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./app/providers/AuthProvider";
import { NotificationProvider } from "./features/notification/context/NotificationContext";
import { SocketProvider } from "./shared/realtime/SocketContext";
import { ThemePreferenceProvider } from "./shared/theme/ThemePreferenceProvider";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemePreferenceProvider>
            <AuthProvider>
                <SocketProvider>
                    <NotificationProvider>
                        <App />
                    </NotificationProvider>
                </SocketProvider>
            </AuthProvider>
        </ThemePreferenceProvider>
    </StrictMode>,
);
