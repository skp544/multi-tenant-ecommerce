import ProtectedRoute from "@/components/common/ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyForgotOtp from "@/pages/auth/VerifyForgotOtp";
import CommissionPayouts from "@/pages/dashboard/CommissionPayouts";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import SellersPage from "@/pages/dashboard/SellersPage";
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

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="commission-payouts" element={<CommissionPayouts />} />
        </Route>
      </Route>
    </Routes>
  );
}
