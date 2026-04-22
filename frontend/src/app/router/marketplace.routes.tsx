import { Route } from "react-router-dom";
import { AppShellHeaderOnlyLayout } from "../layouts/AppShellLayout";
import Marketplace from "../../pages/Marketplace";
import ProductDetail from "../../pages/ProductDetail";

export function MarketplaceRoutes() {
    return (
        <Route element={<AppShellHeaderOnlyLayout />}>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/products/:id" element={<ProductDetail />} />
        </Route>
    );
}
