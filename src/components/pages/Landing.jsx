import { useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import moment from "moment";

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

  const getStatusIcon = (msg) => {
    if (!msg.status || msg.status === "sent") return "✓";
    if (msg.status === "delivered") return "✓✓";
    if (msg.status === "seen")
      return <span className="text-white-800 font-bold">✓✓</span>;
  };

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
        {messages.map((msg, index) => {
          const time = moment(msg.createdAt);
          const displayTime = time.isSame(moment(), "day")
            ? time.format("hh:mm A")
            : time.isSame(moment().subtract(1, "day"), "day")
              ? "Yesterday"
              : time.format("DD MMM");

          const isMe = msg.senderId === userId;

          return (
            <div
              key={index}
              className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="relative flex items-center group">
                {isMe && (
                  <span className="absolute right-[0px] mr-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                    {displayTime}
                  </span>
                )}

                <div
                  className={`px-3 py-2 rounded-2xl shadow text-sm transition-transform duration-200 flex flex-row items-center gap-4
                    ${
                      isMe
                        ? "bg-blue-500 text-white rounded-br-none group-hover:-translate-x-15"
                        : "bg-white text-gray-800 rounded-bl-none group-hover:translate-x-15"
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

                  {isMe && (
                    <span className="text-[10px] text-right opacity-70">
                      {getStatusIcon(msg)}
                    </span>
                  )}
                </div>

                {!isMe && (
                  <span className="absolute mr-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                    {displayTime}
                  </span>
                )}
              </div>
            </div>
          );
        })}

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
