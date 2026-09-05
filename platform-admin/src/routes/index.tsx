import AuthLayout from "@/layouts/AuthLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyForgotOtp from "@/pages/auth/VerifyForgotOtp";
import { Route, Routes } from "react-router";

export default function Routers() {
  return (
    <Routes>
      {/* Auth Section  */}

      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="forgot-password/verify" element={<VerifyForgotOtp />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* Dashboard */}
    </Routes>
  );
}
