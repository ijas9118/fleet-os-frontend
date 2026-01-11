import { Truck, Users2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OpsManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Operations Manager Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your fleet management portal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <CardDescription className="text-xs text-muted-foreground">
              Manage driver assignments and schedules
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <CardDescription className="text-xs text-muted-foreground">
              Track vehicle status and maintenance
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick links to manage your fleet operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            As an operations manager, you can manage drivers and vehicles for your organization.
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>View and manage driver information</li>
            <li>Track vehicle status and assignments</li>
            <li>Monitor fleet operations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
