// src/features/auth/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMPORARY MOCK LOGIN
    if (
      formData.email === "admin@example.com" &&
      formData.password === "12345678"
    ) {
      localStorage.setItem("authToken", "fake-token");
      navigate("/dashboard");
    } else {
      setError("Invalid credentials (hint: admin@example.com / 12345678)");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1e26]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#232734] p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          Login
        </h2>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-full bg-[#3f51b5] hover:bg-[#303f9f] text-white p-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
