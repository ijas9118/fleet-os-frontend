import { 
  Building2, 
  CheckCircle,
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Users, 
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useLogout } from "@/hooks/useLogout";
import type { RootState } from "@/store";

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useLogout();
  const user = useSelector((state: RootState) => state.auth.user);

  const menuItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      path: "/admin",
      exact: true
    },
    {
      title: "Tenants",
      icon: Building2,
      path: "/admin/tenants",
    },
    {
      title: "Verify Tenants",
      icon: CheckCircle,
      path: "/admin/tenants/verify",
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  // Helper to generate breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean).slice(1);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
              F
            </div>
            <span className="font-semibold truncate group-data-[collapsible=icon]:hidden">
              FleetOS
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isBestMatch = menuItems
                    .filter(i => location.pathname.startsWith(i.path) || (i.path === "/" && location.pathname === "/"))
                    .sort((a, b) => b.path.length - a.path.length)[0]?.path === item.path;

                  const isActive = item.exact 
                    ? location.pathname === item.path 
                    : isBestMatch;
                    
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link to={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">{user?.email}</span>
                      <span className="truncate text-xs">{user?.role}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              {pathSegments.map((segment, index) => {
                 const isLast = index === pathSegments.length - 1;
                 const href = `/admin/${pathSegments.slice(0, index + 1).join('/')}`;
                 return (
                   <div key={segment} className="flex items-center">
                     <BreadcrumbItem>
                       {isLast ? (
                         <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
                       ) : (
                         <BreadcrumbLink href={href} className="capitalize">{segment}</BreadcrumbLink>
                       )}
                     </BreadcrumbItem>
                     {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                   </div>
                 )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
