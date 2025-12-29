import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  count: number;
}

const initialState: AppState = {
  count: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    increase: (state) => {
      state.count += 1;
    },
  },
});

export const { increase } = appSlice.actions;
export default appSlice.reducer;
