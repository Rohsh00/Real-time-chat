import { useDispatch, useSelector } from "react-redux";
import { setFormData } from "../../slices/authSlice";
import axiosApi from "../../config/axios";
import toast from "react-hot-toast";

function Signup({ switchToLogin }) {
  const dispatch = useDispatch();
  const { formData } = useSelector((state) => state.auth);

  const handleSignup = async () => {
    if (!formData.username?.trim() || !formData.password?.trim()) {
      toast.error("Username and password are required");
      return;
    }

    try {
      await axiosApi.post("/auth/userSignup", {
        username: formData.username,
        password: formData.password,
      });

      toast.success("Signup successful. Please login.");
      switchToLogin();
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <input
        type="text"
        placeholder="Enter username"
        value={formData.username}
        onChange={(e) => dispatch(setFormData({ username: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <input
        type="password"
        placeholder="Enter password"
        value={formData.password}
        onChange={(e) => dispatch(setFormData({ password: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <button
        onClick={handleSignup}
        className="w-full bg-green-500 hover:bg-green-600
                   text-white font-semibold py-2 rounded-lg
                   transition duration-200"
      >
        Sign Up
      </button>

      <p
        className="text-sm text-blue-600 text-center cursor-pointer"
        onClick={switchToLogin}
      >
        Already have an account? Login
      </p>
    </div>
  );
}

export default Signup;
