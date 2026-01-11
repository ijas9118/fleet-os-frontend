import { Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import OpsManagerLayout from "@/layouts/OpsManagerLayout";
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
import { LandingPage } from "@/pages/LandingPage";
import OpsManagerDashboard from "@/pages/ops-manager/Dashboard";
import TenantDashboard from "@/pages/tenant/Dashboard";
import InventoryItemDetail from "@/pages/tenant/inventory/items/InventoryItemDetail";
import InventoryItemList from "@/pages/tenant/inventory/items/InventoryItemList";
import StockDetail from "@/pages/tenant/inventory/stocks/StockDetail";
import StockList from "@/pages/tenant/inventory/stocks/StockList";
import StockTransactionDetail from "@/pages/tenant/inventory/transactions/StockTransactionDetail";
import StockTransactionList from "@/pages/tenant/inventory/transactions/StockTransactionList";
import OperationsManagerList from "@/pages/tenant/team/operations-managers/OperationsManagerList";
import WarehouseDetail from "@/pages/tenant/warehouses/WarehouseDetail";
import WarehouseList from "@/pages/tenant/warehouses/WarehouseList";
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
          <Route path="ops-managers" element={<OperationsManagerList />} />
          <Route path="drivers" element={<div>Drivers</div>} />
          <Route path="vehicles" element={<div>Vehicles</div>} />
          <Route path="settings" element={<div>Settings</div>} />
        </Route>
      </Route>

      <Route path="/ops-manager" element={<ProtectedRoute requiredRole="OPERATIONS_MANAGER" />}>
        <Route element={<OpsManagerLayout />}>
          <Route index element={<OpsManagerDashboard />} />
          <Route
            path="drivers"
            element={<div className="text-center text-muted-foreground">Drivers management coming soon...</div>}
          />
          <Route
            path="vehicles"
            element={<div className="text-center text-muted-foreground">Vehicles management coming soon...</div>}
          />
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
