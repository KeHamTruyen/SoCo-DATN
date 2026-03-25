import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AdminShell } from "@/layout/AdminShell";
import CategoriesPage from "@/pages/CategoriesPage";
import ContentPage from "@/pages/ContentPage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import ReportsPage from "@/pages/ReportsPage";
import SellerApplicationsPage from "@/pages/SellerApplicationsPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        element={
                            <ProtectedRoute>
                                <AdminShell />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/content" element={<ContentPage />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route
                            path="/sellers"
                            element={<SellerApplicationsPage />}
                        />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
