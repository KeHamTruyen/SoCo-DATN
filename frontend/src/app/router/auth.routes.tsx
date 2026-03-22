import { Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import ForgotPassword from "../../pages/ForgotPassword";
import Login from "../../pages/Login";
import ResetPassword from "../../pages/ResetPassword";
import SellerRegistration from "../../pages/SellerRegistration";
import SellerRegistrationSuccess from "../../pages/SellerRegistrationSuccess";
import SignUp from "../../pages/SignUp";
import Verify from "../../pages/Verify";
import VerifyAccount from "../../pages/VerifyAccount";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

export function AuthRoutes() {
    return (
        <>
            <Route element={<PublicOnlyRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/verify-account" element={<VerifyAccount />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route path="/become-seller" element={<SellerRegistration />} />
                <Route
                    path="/seller-registration/success"
                    element={<SellerRegistrationSuccess />}
                />
            </Route>
        </>
    );
}
