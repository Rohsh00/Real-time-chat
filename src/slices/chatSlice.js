import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosApi from "../config/axios";

const initialState = {
  chatList: [],
  searchedUsers: [],
  selectedChat: null,
  onlineUsersList: [],

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

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setSelectedChat(state, action) {
      state.selectedChat = action.payload;
      state.messages = [];
    },
    setChatList(state, action) {
      state.chatList = action.payload;
    },
    setOnlineUsersList(state, action) {
      state.onlineUsersList = action.payload || [];
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

      .addCase(startChat.fulfilled, (state, action) => {
        state.selectedChat = action.payload;
        state.messages = [];
      })

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
  setChatList,
  setSelectedChat,
  setOnlineUsersList,
  addMessage,
  setMessages,
  setMessage,
  setTypingUserID,
  setUploading,
} = chatSlice.actions;

export default chatSlice.reducer;
