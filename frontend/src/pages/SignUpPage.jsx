import { Link, useNavigate } from "react-router-dom"
import { Target } from "lucide-react"
import { useState } from "react"
import { API_BASE_URL } from "../config";

export default function SignUpPage() {

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const allValid = Object.values(passwordChecks).every(Boolean);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'password') {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value),
      })
    }
  }
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
      if (!allValid) {
        setError("Password does not meet requirements");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/accounts/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
      navigate("/login")
    } catch (err) {
      setError("Cannot connect to server");
    }
  }
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Create account</h1>
        <p className="text-neutral-500 text-sm mb-6">Start tracking your goals today</p>

        {/* Form */}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-neutral-900 block mb-1">First name</label>
              <input
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                name='first_name'
                className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-neutral-900 block mb-1">Last name</label>
              <input
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                name='last_name'
                className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-900 block mb-1">Username</label>
            <input
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              name='username'
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-900 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              name='email'
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-900 block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              name='password'
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          {
            formData.password && (
              <div className="flex flex-col gap-1 mt-1">
                {
                  [
                    { key: "length", label: "At least 8 characters" },
                    { key: "uppercase", label: "One uppercase letter" },
                    { key: "number", label: "One number" },
                    { key: "special", label: "One special character (!@#$%)" },
                  ].map(({ key, label }) => (
                      
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordChecks[key] ? "bg-green-500" : "bg-neutral-300"}`} />
                        <span className={`text-xs ${passwordChecks[key] ? "text-green-600" : "text-neutral-400"}`}>
                            {label}
                        </span>
                      </div>
                  ))
                }
              </div>
            )
          }

          <div>
            <label className="text-sm font-medium text-neutral-900 block mb-1">Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleChange}
              name='confirm_password'
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          {
            error &&
            (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )
          }
          <button type='submit'
            className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-400 hover:-translate-y-0.5 transition-all duration-200 font-medium mt-2"
          >
            Create account
          </button>

        </form>

        {/* Footer */}
        <p className="text-sm text-neutral-500 text-center mt-6">
          Already have account?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}