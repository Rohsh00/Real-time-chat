import { useDispatch, useSelector } from "react-redux";
import { setFormData } from "../../slices/authSlice";

function Login({ joinChat }) {
  const dispatch = useDispatch();

  const { formData } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter username"
        value={formData.username}
        onChange={(e) => {
          dispatch(
            setFormData({
              username: e.target.value,
            })
          );
        }}
      />

      <input
        type="password"
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter password"
        value={formData.password}
        onChange={(e) =>
          dispatch(
            setFormData({
              password: e.target.value,
            })
          )
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
