import { Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import TenantLayout from "@/layouts/TenantLayout";
import DashboardOverview from "@/pages/admin/DashboardOverview";
import TenantList from "@/pages/admin/tenants/TenantList";
import TenantVerify from "@/pages/admin/tenants/TenantVerify";
import UserList from "@/pages/admin/users/UserList";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterAdminPage from "@/pages/auth/RegisterAdminPage";
import RegisterTenantPage from "@/pages/auth/RegisterTenantPage";
import VerifyOtpPage from "@/pages/auth/VerifyOtpPage";
import InventoryItemDetail from "@/pages/dashboard/inventory-items/InventoryItemDetail";
import InventoryItemList from "@/pages/dashboard/inventory-items/InventoryItemList";
import StockTransactionDetail from "@/pages/dashboard/stock-transactions/StockTransactionDetail";
import StockTransactionList from "@/pages/dashboard/stock-transactions/StockTransactionList";
import StockDetail from "@/pages/dashboard/stocks/StockDetail";
import StockList from "@/pages/dashboard/stocks/StockList";
import TenantDashboard from "@/pages/dashboard/TenantDashboard";
import WarehouseDetail from "@/pages/dashboard/warehouses/WarehouseDetail";
import WarehouseList from "@/pages/dashboard/warehouses/WarehouseList";
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

      <Route path="/tenant" element={<ProtectedRoute requiredRole="TENANT_ADMIN" />}>
        <Route element={<TenantLayout />}>
          <Route index element={<TenantDashboard />} />
          <Route path="warehouses" element={<WarehouseList />} />
          <Route path="warehouses/:id" element={<WarehouseDetail />} />
          <Route path="inventory-items" element={<InventoryItemList />} />
          <Route path="inventory-items/:id" element={<InventoryItemDetail />} />
          <Route path="stocks" element={<StockList />} />
          <Route path="stocks/:id" element={<StockDetail />} />
          <Route path="stock-transactions" element={<StockTransactionList />} />
          <Route path="stock-transactions/:id" element={<StockTransactionDetail />} />
          {/* Placeholders for other routes */}
          <Route path="shipments" element={<div>Shipments</div>} />
          <Route path="ops-managers" element={<div>Ops Managers</div>} />
          <Route path="drivers" element={<div>Drivers</div>} />
          <Route path="vehicles" element={<div>Vehicles</div>} />
          <Route path="settings" element={<div>Settings</div>} />
        </Route>
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
