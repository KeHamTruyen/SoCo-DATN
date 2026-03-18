import { Route } from "react-router-dom";
import Cart from "../../pages/Cart";
import Checkout from "../../pages/Checkout";
import CheckoutSuccess from "../../pages/CheckoutSuccess";
import OrderDetail from "../../pages/OrderDetail";
import Orders from "../../pages/Orders";
import ProtectedRoute from "./ProtectedRoute";

export function CommerceRoutes() {
    return (
        <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>
    );
}
