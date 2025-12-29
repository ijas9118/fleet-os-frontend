import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { LandingPage } from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterTenantPage from "@/pages/auth/RegisterTenantPage";
import VerifyOtpPage from "@/pages/auth/VerifyOtpPage";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";
import DashboardOverview from "@/pages/admin/DashboardOverview";
import TenantList from "@/pages/admin/tenants/TenantList";
import TenantVerify from "@/pages/admin/tenants/TenantVerify";
import UserList from "@/pages/admin/users/UserList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="tenants" element={<TenantList />} />
          <Route path="tenants/verify" element={<TenantVerify />} />
          <Route path="users" element={<UserList />} />
        </Route>
        
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register-tenant" element={<RegisterTenantPage />} />
          <Route path="verify-otp" element={<VerifyOtpPage />} />
          <Route path="accept-invite" element={<AcceptInvitePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
