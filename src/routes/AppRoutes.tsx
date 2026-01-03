import { Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import DashboardOverview from "@/pages/admin/DashboardOverview";
import TenantList from "@/pages/admin/tenants/TenantList";
import TenantVerify from "@/pages/admin/tenants/TenantVerify";
import UserList from "@/pages/admin/users/UserList";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterAdminPage from "@/pages/auth/RegisterAdminPage";
import RegisterTenantPage from "@/pages/auth/RegisterTenantPage";
import VerifyOtpPage from "@/pages/auth/VerifyOtpPage";
import TenantDashboard from "@/pages/dashboard/TenantDashboard";
import { LandingPage } from "@/pages/LandingPage";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { PublicRoute } from "@/routes/guards/PublicRoute";

export const AppRoutes = () => {
    return (
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute />}>
             <Route element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="tenants" element={<TenantList />} />
              <Route path="tenants/verify" element={<TenantVerify />} />
              <Route path="users" element={<UserList />} />
             </Route>
          </Route>

          <Route path="/tenant" element={<ProtectedRoute />}>
            <Route path="admin" element={<TenantDashboard />} />
          </Route>
          
          <Route path="/auth" element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register-tenant" element={<RegisterTenantPage />} />
              <Route path="register-admin" element={<RegisterAdminPage />} />
              <Route path="verify-otp" element={<VerifyOtpPage />} />
              <Route path="accept-invite" element={<AcceptInvitePage />} />
            </Route>
          </Route>

        </Routes>
    );
};
