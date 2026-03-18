import { Route } from "react-router-dom";
import Marketplace from "../../pages/Marketplace";
import ProductDetail from "../../pages/ProductDetail";
import ProtectedRoute from "./ProtectedRoute";

export function MarketplaceRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/products/:id" element={<ProductDetail />} />
        </Route>
    );
}

