import { Route } from "react-router-dom";
import BareLayout from "../layouts/BareLayout";
import { AppShellHeaderLayout } from "../layouts/AppShellLayout";
import Cart from "../../pages/Cart";
import Checkout from "../../pages/Checkout";
import CheckoutSuccess from "../../pages/CheckoutSuccess";
import OrderDetail from "../../pages/OrderDetail";
import Orders from "../../pages/Orders";
import ProtectedRoute from "./ProtectedRoute";
import { MARKETPLACE_ACTIVE_HEADER } from "./routeHandle";

export function CommerceRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route element={<AppShellHeaderLayout />}>
                <Route
                    path="/cart"
                    element={<Cart />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
                <Route
                    path="/checkout"
                    element={<Checkout />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
                <Route
                    path="/orders"
                    element={<Orders />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
                <Route
                    path="/orders/:id"
                    element={<OrderDetail />}
                    handle={MARKETPLACE_ACTIVE_HEADER}
                />
            </Route>
            <Route element={<BareLayout />}>
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
            </Route>
        </Route>
    );
}
