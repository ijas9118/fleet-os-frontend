import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">FleetOS</h1>
        <div className="flex gap-4">
          <Button variant="ghost">Log in</Button>
          <Button>Get Started</Button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} FleetOS. All rights reserved.
      </footer>
    </div>
  );
}
