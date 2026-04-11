import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./app/providers/AuthProvider";
import { NotificationProvider } from "./features/notification/context/NotificationContext";
import { SocketProvider } from "./shared/realtime/SocketContext";
import { ThemePreferenceProvider } from "./shared/theme/ThemePreferenceProvider";
import "./i18n";
import "./index.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

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
