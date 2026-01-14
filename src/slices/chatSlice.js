import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../config/axios";

const initialState = {
  chatList: [],
  searchedUsers: [],
  selectedChat: null,

  messages: [],
  message: "",
  typingUserID: "",
  uploading: false,

  searchLoading: false,
  chatListLoading: false,
  error: null,
};

/* ===================== THUNKS ===================== */

export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (search, { rejectWithValue }) => {
    try {
      const res = await axiosApi.get("/auth/findUsersByUsername", {
        params: { username: search },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Search failed");
    }
  }
);

export const startChat = createAsyncThunk(
  "chat/startChat",
  async (selectedUserId, { rejectWithValue }) => {
    try {
      const res = await axiosApi.post("/chatList/startChat", {
        selectedUserId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Start chat failed");
    }
  }
);

export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosApi.get("/chatlist/getMyChats");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch chats failed");
    }
  }
);

/* ===================== SLICE ===================== */

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setSelectedChat(state, action) {
      state.selectedChat = action.payload;
      state.messages = [];
    },

    addMessage(state, action) {
      state.messages.push(action.payload);
    },

    setMessages(state, action) {
      state.messages = action.payload;
    },

    setMessage(state, action) {
      state.message = action.payload;
    },

    setTypingUserID(state, action) {
      state.typingUserID = action.payload;
    },

    setUploading(state, action) {
      state.uploading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      /* Search users */
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchedUsers = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })

      /* Start chat */
      .addCase(startChat.fulfilled, (state, action) => {
        state.selectedChat = action.payload;
        state.messages = [];
      })

      /* Fetch chat list */
      .addCase(fetchChatList.pending, (state) => {
        state.chatListLoading = true;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.chatListLoading = false;
        state.chatList = action.payload;
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.chatListLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedChat,
  addMessage,
  setMessages,
  setMessage,
  setTypingUserID,
  setUploading,
} = chatSlice.actions;

export default chatSlice.reducer;
