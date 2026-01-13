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

export interface Driver {
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
  onBlockDriver: (driver: Driver) => void;
  onUnblockDriver: (driver: Driver) => void;
}

export const getDriverColumns = ({
  onBlockDriver,
  onUnblockDriver,
}: ColumnsOptions): ColumnDef<Driver>[] => [
  {
    accessorKey: "name",
    header: "Driver",
    cell: ({ row }) => {
      const driver = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {driver.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{driver.name}</div>
            <div className="text-muted-foreground text-sm">{driver.email}</div>
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
      const driver = row.original;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driver.email)}>Copy email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            {driver.isActive ? (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onBlockDriver(driver)}>
                <Ban className="w-4 h-4 mr-2" />
                Block driver
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onUnblockDriver(driver)}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Unblock driver
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
