function Landing({
  username,
  messages,
  message,
  onMessageHandler,
  sendMessage,
  typingUserID,
  onFileChange,
  sendFileMessage,
  selectedFile,
  uploading,
  userId,
}) {
  console.log({ message: message.senderId });
  console.log({ userId });
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">
        Logged in as <b>{username}</b>
      </p>

      {typingUserID && (
        <p className="text-sm text-gray-600 mb-2">
          <b className="capitalize">{typingUserID}</b> is typing...
        </p>
      )}

      <div className="h-64 overflow-y-auto border rounded-lg p-2 mb-3 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${
              msg.senderId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <span className="font-semibold">{msg.username}:</span>

            {(!msg.type || msg.type === "text") && (
              <span className="ml-1">{msg.message}</span>
            )}

            {msg.type === "image" && (
              <img
                src={msg.fileUrl}
                alt="uploaded"
                className="mt-1 max-w-full rounded-lg h-24"
              />
            )}

            {msg.type === "file" && (
              <a
                href={msg.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 underline h-1/2"
              >
                {msg.fileName}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Type message..."
          value={message}
          onChange={onMessageHandler}
          disabled={uploading}
        />

        <button
          onClick={sendMessage}
          disabled={uploading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <input type="file" onChange={onFileChange} />

        <button
          onClick={sendFileMessage}
          disabled={!selectedFile || uploading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Send File"}
        </button>
      </div>

      {selectedFile && (
        <p className="text-xs text-gray-500 mt-1">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
}

export default Landing;
