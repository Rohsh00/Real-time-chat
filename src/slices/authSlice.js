import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "",
  userId: "",
  joined: false,
  formData: {
    username: "",
    password: "",
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setUser: (state, action) => {
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.joined = true;
    },
    resetAuth: () => initialState,
  },
});

export const { setFormData, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
