import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { AuthProvider } from "./app/providers/AuthProvider";
import { NotificationProvider } from "./features/notification/context/NotificationContext";
import { SocketProvider } from "./shared/realtime/SocketContext";
import { ThemePreferenceProvider } from "./shared/theme/ThemePreferenceProvider";
import { appQueryClient } from "./shared/query/queryClient";
import { AppErrorBoundary } from "./shared/ui/organisms/app-error-boundary/AppErrorBoundary";
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
                        <QueryClientProvider client={appQueryClient}>
                            <AppErrorBoundary>
                                <App />
                            </AppErrorBoundary>
                        </QueryClientProvider>
                    </NotificationProvider>
                </SocketProvider>
            </AuthProvider>
        </ThemePreferenceProvider>
    </StrictMode>,
);
