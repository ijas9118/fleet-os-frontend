import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import type { RootState } from "@/store";
import { clearAuth } from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch(clearAuth());
      navigate("/auth/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{user?.email || "Admin"}</span>
        </p>
        <div className="p-6 bg-card rounded-lg border shadow-sm">
           <p className="mb-4 text-sm text-balance">
             This is a protected area for platform administrators.
           </p>
           <Button variant="destructive" onClick={handleLogout} className="w-full">
             Sign Out
           </Button>
        </div>
      </div>
    </div>
  );
}
