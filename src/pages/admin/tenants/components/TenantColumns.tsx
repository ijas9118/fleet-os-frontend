import type { ColumnDef } from "@tanstack/react-table";
import { Check, MoreHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Tenant {
  id: string;
  name: string;
  email: string;
  status: string;
  industry: string;
}

export interface PendingTenant {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  status: string;
}

export const getTenantListColumns = (): ColumnDef<Tenant>[] => [
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
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tenant.email)}>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit tenant</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface TenantVerifyColumnsProps {
  activeTab: "pending" | "rejected";
  onApprove: (tenant: PendingTenant) => void;
  onReject: (id: string) => void;
}

export const getTenantVerifyColumns = ({
  activeTab,
  onApprove,
  onReject,
}: TenantVerifyColumnsProps): ColumnDef<PendingTenant>[] => [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "Verified" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {activeTab === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 h-8 px-2"
                onClick={() => onReject(row.original.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2"
                onClick={() => onApprove(row.original)}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </>
          )}
          {activeTab === "rejected" && <span className="text-muted-foreground text-sm italic">Rejected</span>}
        </div>
      );
    },
  },
];
