import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-xs">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="text-right">
           <Button variant="ghost" size="sm">Edit</Button>
        </div>
      )
    },
  },
];

export default function UserList() {
  const users: User[] = [
    { id: 1, name: "Admin User", email: "admin@fleetos.com", role: "Platform Admin", status: "Active" },
    { id: 2, name: "Support Team", email: "support@fleetos.com", role: "Support", status: "Active" },
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage platform administrators and staff.</p>
        </div>
        <Button>Invite User</Button>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Platform Users</CardTitle>
           <CardDescription>Authorized personnel with access to the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
