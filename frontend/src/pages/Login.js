import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../services/api";
import { FiMail, FiLock } from "react-icons/fi";

export default function Login() {

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);

      const data = await loginUser(form);

      // ✅ STORE EVERYTHING (VERY IMPORTANT)
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user)); // 🔥 FIX

      console.log("Login Success:", data);

      const role = data.user.role;

      if (role === "admin") window.location = "/admin-dashboard";
      else if (role === "mentor") window.location = "/mentor-dashboard";
      else if (role === "counsellor") window.location = "/counsellor-dashboard";
      else if (role === "student") window.location = "/student-dashboard";
      else window.location = "/parent-dashboard";

    } catch (error) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (

    <AuthLayout title="Login">

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* EMAIL */}
        <div className="relative">
          <FiMail className="absolute left-3 top-3 text-gray-400" />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full pl-10 p-3 rounded-xl border border-gray-300
            focus:ring-2 focus:ring-secondary bg-white"
            onChange={handleChange}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="relative">
          <FiLock className="absolute left-3 top-3 text-gray-400" />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full pl-10 p-3 rounded-xl border border-gray-300
            focus:ring-2 focus:ring-secondary bg-white"
            onChange={handleChange}
            required
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded-xl
          font-semibold hover:bg-primary transition duration-300 shadow-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          New user?{" "}
          <a href="/signup" className="text-primary font-semibold">
            Sign Up
          </a>
        </p>

      </form>

    </AuthLayout>
  );
}