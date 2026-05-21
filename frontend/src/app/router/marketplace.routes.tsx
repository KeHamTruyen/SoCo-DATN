import { Route } from "react-router-dom";
import {
    AppShellHeaderFooterLayout,
    AppShellHeaderLayout,
} from "../layouts/AppShellLayout";
import Marketplace from "../../pages/Marketplace";
import ProductDetail from "../../pages/ProductDetail";
import { MARKETPLACE_ACTIVE_HEADER } from "./routeHandle";

export function MarketplaceRoutes() {
    return (
        <>
            <Route element={<AppShellHeaderLayout />}>
                <Route
                    path="/marketplace"
                    element={<Marketplace />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
            </Route>
            <Route element={<AppShellHeaderFooterLayout />}>
                <Route
                    path="/products/:id"
                    element={<ProductDetail />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
            </Route>
        </>
    );
}
