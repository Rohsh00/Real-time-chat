import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";

function Landing({ onMessageHandler, sendMessage, sendFileMessage }) {
  const { userId } = useSelector((state) => state.auth);
  const {
    messages,
    message,
    typingUserID,
    uploading,
    selectedChat,
    onlineUsersList,
  } = useSelector((state) => state.chat);

  const [selectedFile, setSelectedFile] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedChatUsername =
    userId === selectedChat.user1._id
      ? selectedChat.user2.username
      : selectedChat.user1.username;

  const isOnline = onlineUsersList.includes(selectedChat.user2._id);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2 bg-white flex items-center justify-between flex">
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <div className="flex flex-col">
            <p className="font-semibold text-gray-800 text-sm capitalize">
              {selectedChatUsername || "Chat"}
            </p>

            {typingUserID ? (
              <div className="flex items-center gap-2 text-xs text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="capitalize font-medium">typing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                <span>{isOnline ? "Active now" : "Offline"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${
              msg.senderId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-2 py-2 rounded-2xl shadow text-sm
  ${
    msg.senderId === userId
      ? "bg-blue-500 text-white rounded-br-none"
      : "bg-white text-gray-800 rounded-bl-none"
  }`}
            >
              {!msg.type || msg.type === "text" ? (
                <p>{msg.message}</p>
              ) : msg.type === "image" ? (
                <img src={msg.fileUrl} className="h-32 rounded" />
              ) : (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {msg.fileName}
                </a>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 bg-white">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type message..."
            value={message}
            onChange={onMessageHandler}
            disabled={uploading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            disabled={uploading}
            className="bg-blue-500 text-white px-5 py-2 rounded-full"
          >
            Send
          </button>
        </div>

        <div className="mt-2 flex gap-2 items-center justify-between">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          <button
            onClick={() => {
              sendFileMessage(selectedFile);
              setSelectedFile(null);
            }}
            disabled={!selectedFile || uploading}
            className="bg-green-500 text-white px-4 py-1.5 rounded-full"
          >
            {uploading ? "Uploading..." : "Send File"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
