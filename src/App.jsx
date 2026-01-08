import { useEffect, useRef, useState } from "react";
import socket from "./socket";
import Login from "./components/pages/Login";
import Landing from "./components/pages/Landing";
import axiosApi from "./config/axios";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const typingTimeoutRef = useRef(null);

  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [userId, setUserId] = useState("");
  const [joined, setJoined] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUserID, setTypingUserID] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    socket.on("receivePrivateMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receivePrivateMessage");
  }, []);

  useEffect(() => {
    const handleTyping = ({ senderId, isTyping }) => {
      if (senderId === selectedUserId) {
        setTypingUserID(isTyping ? senderId : "");
      }
    };

    socket.on("receiveTypingState", handleTyping);
    socket.on("stopTypingState", handleTyping);

    return () => {
      socket.off("receiveTypingState", handleTyping);
      socket.off("stopTypingState", handleTyping);
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (!joined) return;

    const loadHistory = async () => {
      const res = await axiosApi.get("/messages/getAllChatHistory");
      setMessages(res.data);
    };

    loadHistory();
  }, [joined]);

  const joinChat = async () => {
    if (!formData.username?.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!formData.password?.trim()) {
      toast.error("Password is required");
      return;
    }

    const loadingToast = toast.loading("Logging in...");

    try {
      const res = await axiosApi.post("/userLogin", {
        username: formData.username,
        password: formData.password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);

      setUserId(user.username);
      setUsername(user.username);

      socket.emit("setUser", {
        userId: user.userId,
        username: user.username,
      });

      const receiverId = user.username === "rohit" ? "pawan" : "rohit";

      setSelectedUserId(receiverId);

      socket.emit("joinRoom", {
        senderId: username,
        receiverId,
      });

      setJoined(true);

      toast.success("Login successful!", { id: loadingToast });
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Invalid username or password";

      toast.error(msg, { id: loadingToast });
      setJoined(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendPrivateMessage", {
      senderId: userId,
      receiverId: selectedUserId,
      type: "text",
      message,
    });

    setMessage("");
  };

  const onMessageHandler = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", {
      senderId: userId,
      receiverId: selectedUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: userId,
        receiverId: selectedUserId,
      });
    }, 800);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const sendFileMessage = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const data = new FormData();
    data.append("file", selectedFile);

    try {
      const res = await axiosApi.post("/chatUploads", data);

      socket.emit("sendPrivateMessage", {
        senderId: userId,
        receiverId: selectedUserId,
        type: selectedFile.type.startsWith("image") ? "image" : "file",
        fileUrl: res.data.fileUrl,
        fileName: res.data.fileName,
        fileSize: res.data.fileSize,
      });

      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-5">
        <Toaster />
        <h2 className="text-xl font-semibold text-center mb-4">
          Real Chat App
        </h2>

        {!joined ? (
          <Login
            joinChat={joinChat}
            username={username}
            setUsername={setUsername}
            formData={formData}
            setFormData={setFormData}
          />
        ) : (
          <Landing
            username={username}
            messages={messages}
            message={message}
            onMessageHandler={onMessageHandler}
            sendMessage={sendMessage}
            typingUserID={typingUserID}
            onFileChange={onFileChange}
            sendFileMessage={sendFileMessage}
            selectedFile={selectedFile}
            uploading={uploading}
          />
        )}
      </div>
    </div>
  );
}

export default App;
