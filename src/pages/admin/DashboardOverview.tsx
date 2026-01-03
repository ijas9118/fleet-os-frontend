import { AlertCircle,Building2, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardOverview() {
  // Dummy stats
  const stats = [
    {
      title: "Total Tenants",
      value: "12",
      icon: Building2,
      description: "+2 from last month"
    },
    {
      title: "Pending Verifications",
      value: "3",
      icon: AlertCircle,
      description: "Requires attention",
      alert: true
    },
    {
      title: "Platform Users",
      value: "5",
      icon: Users,
      description: "Active admins"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.alert ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
