import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

interface PendingTenant {
  id: number;
  name: string;
  email: string;
  submittedAt: string;
  documents: "Verified" | "Pending";
}

const columns: ColumnDef<PendingTenant>[] = [
  {
    accessorKey: "name",
    header: "Business Name",
  },
  {
    accessorKey: "email",
    header: "Contact Email",
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
  },
  {
    accessorKey: "documents",
    header: "Documents",
    cell: ({ row }) => {
      const status = row.getValue("documents") as string;
      return (
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === "Verified" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 h-8 px-2">
            <X className="w-4 h-4 mr-1" /> Reject
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-2">
            <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
        </div>
      )
    },
  },
];

export default function TenantVerify() {
  // Dummy data for pending tenants
  const pendingTenants: PendingTenant[] = [
    { id: 101, name: "New Age Delivery", email: "admin@newage.com", submittedAt: "2023-10-25", documents: "Verified" },
    { id: 102, name: "City Couriers", email: "hello@citycouriers.com", submittedAt: "2023-10-26", documents: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verify Tenants</h2>
        <p className="text-muted-foreground">Review and approve new tenant registrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            These businesses are waiting for platform approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={pendingTenants} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
