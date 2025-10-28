import { createSlice } from "@reduxjs/toolkit";

interface IAuthReducer {
  token?: string;
}

const AuthReducer = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem('auth_token') || undefined
  },
  reducers: {
    setCredentials(state: IAuthReducer, action) {
      state.token = action.payload.token;
      localStorage.setItem('auth_token', action.payload.token);
    },
    resetCredentials: (state: IAuthReducer) => {
      state.token = undefined;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const { setCredentials, resetCredentials } = AuthReducer.actions;

export default AuthReducer.reducer;