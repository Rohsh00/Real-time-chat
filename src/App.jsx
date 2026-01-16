import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "./socket";
import Login from "./components/pages/Login";
import Landing from "./components/pages/Landing";
import axiosApi from "./config/axios";
import toast, { Toaster } from "react-hot-toast";

import { setUser } from "./slices/authSlice";

import {
  addMessage,
  setMessages,
  setMessage,
  setTypingUserID,
  setUploading,
} from "./slices/chatSlice";

import UserList from "./components/pages/usersList";
import Signup from "./components/pages/Signup";

function App() {
  const dispatch = useDispatch();
  const typingTimeoutRef = useRef(null);

  const { userId, joined, formData } = useSelector((state) => state.auth);
  const { selectedChat, message } = useSelector((state) => state.chat);

  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDetails = localStorage.getItem("user_details");

    if (!token || !userDetails) return;

    const parsedUser = JSON.parse(userDetails);

    dispatch(setUser(parsedUser));

    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    socket.once("connect", () => {
      socket.emit("setUser", parsedUser);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [dispatch]);

  useEffect(() => {
    if (!selectedChat) return;

    const loadChat = async () => {
      try {
        const res = await axiosApi.get(`/messages/history/${selectedChat._id}`);
        dispatch(setMessages(res.data));
      } catch (err) {
        console.error("Load chat failed", err);
      }
    };

    loadChat();

    socket.emit("joinRoom", {
      chatId: selectedChat._id,
    });
  }, [selectedChat, dispatch]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      dispatch(addMessage(data));
    });

    return () => socket.off("receiveMessage");
  }, [dispatch]);

  useEffect(() => {
    socket.on("receiveTypingState", ({ chatId, isTyping, username }) => {
      if (selectedChat && chatId === selectedChat._id) {
        dispatch(setTypingUserID(isTyping ? username : ""));
      }
    });

    return () => {
      socket.off("receiveTypingState");
    };
  }, [dispatch, selectedChat]);

  const joinChat = async () => {
    if (!formData.username || !formData.password) {
      toast.error("Username and password required");
      return;
    }

    const loadingToast = toast.loading("Logging in...");

    try {
      const res = await axiosApi.post("/auth/userLogin", formData);

      const { token, user } = res.data;

      const userDetails = {
        userId: user.userId,
        username: user.username,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user_details", JSON.stringify(userDetails));

      dispatch(setUser(userDetails));

      socket.auth = { token };
      socket.connect();

      socket.once("connect", () => {
        socket.emit("setUser", userDetails);
      });

      toast.success("Login successful", { id: loadingToast });
    } catch (err) {
      toast.error("Login failed", { id: loadingToast });
    }
  };

  const sendMessage = (e) => {
    if (!message.trim() || !selectedChat) return;

    const receiverId =
      selectedChat.user1 === userId ? selectedChat.user2 : selectedChat.user1;

    socket.emit("sendMessage", {
      chatId: selectedChat._id,
      senderId: userId,
      receiverId,
      username: formData.username,
      type: "text",
      message,
    });

    dispatch(setMessage(""));
  };

  const onMessageHandler = (e) => {
    dispatch(setMessage(e.target.value));

    if (!selectedChat) return;

    socket.emit("typing", {
      chatId: selectedChat._id,
      senderId: userId,
      username: formData.username,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedChat._id,
        senderId: userId,
        username: formData.username,
      });
    }, 800);
  };

  const sendFileMessage = async (file) => {
    if (!file || !selectedChat) return;

    dispatch(setUploading(true));

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axiosApi.post("/chatUploads", data);

      const receiverId =
        selectedChat.user1 === userId ? selectedChat.user2 : selectedChat.user1;

      socket.emit("sendMessage", {
        chatId: selectedChat._id,
        senderId: userId,
        receiverId,
        username: formData.username,
        type: file.type.startsWith("image") ? "image" : "file",
        ...res.data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setUploading(false));
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl w-full h-full max-w-7xl flex flex-col">
        <Toaster />

        <h2 className="text-xl font-semibold text-center py-3 border-b">
          Real Chat App
        </h2>

        {!joined ? (
          <div className="flex-1 flex items-center justify-center">
            {isSignup ? (
              <Signup switchToLogin={() => setIsSignup(false)} />
            ) : (
              <div className="flex flex-col gap-4">
                <Login joinChat={joinChat} />

                <p
                  className="text-sm text-blue-600 text-center cursor-pointer"
                  onClick={() => setIsSignup(true)}
                >
                  Don’t have an account? Sign up
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <UserList />

            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <Landing
                  onMessageHandler={onMessageHandler}
                  sendMessage={sendMessage}
                  sendFileMessage={sendFileMessage}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a user to start chat
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
