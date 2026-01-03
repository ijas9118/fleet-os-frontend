import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { authService } from "@/services/authService";
import { clearAuth } from "@/store/slices/authSlice";

export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            dispatch(clearAuth());
            navigate("/auth/login");
        }
    };

    return { logout };
};
