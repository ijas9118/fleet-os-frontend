import { useEffect } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import type { RootState } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';

export const ProtectedRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isAuthenticated) {
             dispatch(clearAuth());
        }
    }, [isAuthenticated, dispatch]);


    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};
