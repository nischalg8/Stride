import { Link, useNavigate } from "react-router-dom"
import { Target } from "lucide-react"
import { useState } from "react";
import { API_BASE_URL } from "../config";
export default function LoginPage() {

  const navigate = useNavigate();

  const [loginFormData, setLoginFormDate] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const getErrorMessage = (data, statusText) => {
    if (!data || typeof data !== "object") {
      return statusText || "Something went wrong.";
    }
    return (
      data.message ||
      data.detail ||
      "Something went wrong."
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginFormData),
        credentials: "include",
      });

      let data = null;
      try {
        data = await response.json();
      } catch (_err) {
        data = null;
      }

      if (!response.ok) {
        setError(getErrorMessage(data, response.statusText));
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Cannot connect to the server!");
    }
  };

  const handleChange = (e) => {

    setLoginFormDate({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-cream-100 rounded-2xl p-8 border border-cream-200">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
            <Target size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900">Stride</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h1>
        <p className="text-neutral-500 text-sm mb-6">Log in to continue your progress</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-900 block mb-1">Username</label>
            <input
              type="text"
              placeholder="username"
              value={loginFormData.username}
              onChange={handleChange}
              name='username'
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-neutral-900">Password</label>
              <Link to="/forgot-password" className="text-xs text-green-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={loginFormData.password}
              onChange={handleChange}
              name='password'
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}
          <button type="submit" className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-400 hover:-translate-y-0.5 transition-all duration-200 font-medium mt-2">
            Log in
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-neutral-500 text-center mt-6">
          No account?{" "}
          <Link to="/signup" className="text-green-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}