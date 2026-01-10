import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FleetOS</h1>
        </div>
        <div className="space-y-4">
          <blockquote className="text-lg">
            &ldquo;Complete control over your fleet inventory, simplified.&rdquo;
          </blockquote>
          <p className="text-sm opacity-80">Manage warehouses, shipments, and inventory with ease.</p>
        </div>
      </div>

      {/* Right side - Form Content */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
