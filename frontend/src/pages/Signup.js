import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { registerUser } from "../services/api";

export default function Signup() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "mentor" // ✅ default role
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);

      const data = await registerUser(form);

      alert("Account created successfully");

      window.location = "/login";

    } catch (error) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (

    <AuthLayout title="Create Account">

      <form onSubmit={handleSubmit} className="space-y-5">

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary"
          onChange={handleChange}
          required
        />

        {/* ROLE SELECT */}
        <select
          name="role"
          value={form.role}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-secondary"
          onChange={handleChange}
        >
          <option value="admin">Admin</option>
          <option value="mentor">Mentor</option>
          <option value="counsellor">Counsellor</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded-lg
          hover:bg-primary transition font-semibold"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-primary font-semibold">
            Login
          </a>
        </p>

      </form>

    </AuthLayout>
  );
}