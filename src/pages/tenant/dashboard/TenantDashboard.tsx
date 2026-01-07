import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useSelector } from "react-redux";
// import type { RootState } from "@/store";

export default function TenantDashboard() {
  // const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 since last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              All operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Expected today
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Activity Chart Placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">SHP-12345</p>
                        <p className="text-sm text-muted-foreground">Delivered to New York</p>
                    </div>
                    <div className="ml-auto font-medium">+$230.00</div>
                </div>
                <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">SHP-12346</p>
                        <p className="text-sm text-muted-foreground">In Transit to Boston</p>
                    </div>
                    <div className="ml-auto font-medium">+$150.00</div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
