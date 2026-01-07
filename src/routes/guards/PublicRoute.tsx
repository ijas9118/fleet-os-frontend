import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import type { RootState } from '@/store';

export const PublicRoute = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    if (isAuthenticated) {
        if (user?.role === 'PLATFORM_ADMIN') {
            return <Navigate to="/admin" replace />;
        }
        if (user?.role === 'TENANT_ADMIN') {
            return <Navigate to="/tenant" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
