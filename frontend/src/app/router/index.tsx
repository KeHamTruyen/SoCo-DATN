import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "../../pages/AdminDashboard";
import { AuthRoutes } from "./auth.routes";
import { CommerceRoutes } from "./commerce.routes";
import { FeedRoutes } from "./feed.routes";
import { MarketplaceRoutes } from "./marketplace.routes";
import ProtectedRoute from "./ProtectedRoute";
import { SocialRoutes } from "./social.routes";
import RootRedirect from "./RootRedirect";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                {AuthRoutes()}
                {FeedRoutes()}
                {MarketplaceRoutes()}
                {CommerceRoutes()}
                {SocialRoutes()}
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

