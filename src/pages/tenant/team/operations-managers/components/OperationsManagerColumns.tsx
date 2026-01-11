import type { ColumnDef } from "@tanstack/react-table";
import { Ban, MoreHorizontal, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface OperationsManager {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface ColumnsOptions {
  onBlockUser: (user: OperationsManager) => void;
  onUnblockUser: (user: OperationsManager) => void;
}

export const getOperationsManagerColumns = ({
  onBlockUser,
  onUnblockUser,
}: ColumnsOptions): ColumnDef<OperationsManager>[] => [
  {
    accessorKey: "name",
    header: "Operations Manager",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-sm">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLoginAt") as string | undefined;
      if (!lastLogin) {
        return <span className="text-sm text-muted-foreground">Never</span>;
      }
      const date = new Date(lastLogin);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? (
            <>
              <ShieldCheck className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <Ban className="w-3 h-3 mr-1" />
              Blocked
            </>
          )}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            {user.isActive ? (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onBlockUser(user)}>
                <Ban className="w-4 h-4 mr-2" />
                Block user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onUnblockUser(user)}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Unblock user
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
