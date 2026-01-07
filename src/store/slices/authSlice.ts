import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id?: string;
  email?: string;
  role?: string;
  tenant?: {
    id: string;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user?: User }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.token;
      state.user = action.payload.user || null;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
