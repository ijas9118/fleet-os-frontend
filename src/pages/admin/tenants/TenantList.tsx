import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Tenant {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  industry: string;
}

const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tenant = row.original;
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(tenant.email)}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit tenant</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];

export default function TenantList() {
  // Dummy data
  const tenants: Tenant[] = [
    { id: 1, name: "Acme Logistics", email: "contact@acme.com", status: "Active", industry: "Transportation" },
    { id: 2, name: "FastFleet Inc", email: "info@fastfleet.com", status: "Active", industry: "Delivery" },
    { id: 3, name: "Global Transport", email: "support@global.com", status: "Inactive", industry: "Logistics" },
    { id: 4, name: "Local Movers", email: "move@local.com", status: "Active", industry: "Moving" },
    { id: 5, name: "Express Ship", email: "ship@express.com", status: "Active", industry: "Shipping" },
    { id: 6, name: "Cargo King", email: "king@cargo.com", status: "Inactive", industry: "Freight" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage all registered businesses.</p>
        </div>
        <Button>Add Tenant</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            List of all businesses registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tenants} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
