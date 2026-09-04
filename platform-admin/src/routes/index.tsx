import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import { Route, Routes } from "react-router";

export default function Routers() {
  return (
    <Routes>
      {/* Auth Section  */}

      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Dashboard */}
    </Routes>
  );
}
