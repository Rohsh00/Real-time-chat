function Login({ joinChat, username, setUsername, setFormData, formData }) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter username"
        value={username}
        onChange={(e) => {
          setFormData((prev) => {
            return { ...prev, username: e.target.value };
          });
          setUsername(e.target.value);
        }}
      />

      <input
        type="password"
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter password"
        value={formData.password}
        onChange={(e) =>
          setFormData((prev) => {
            return { ...prev, password: e.target.value };
          })
        }
      />

      <button
        onClick={joinChat}
        className="w-full bg-blue-500 hover:bg-blue-600
                   text-white font-semibold py-2 rounded-lg
                   transition duration-200"
      >
        Join Chat
      </button>
    </div>
  );
}

export default Login;
