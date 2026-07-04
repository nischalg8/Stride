import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Target } from "lucide-react"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "../config"
import { toast } from "react-toastify";
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")

  const [step, setStep] = useState("checking")   // checking | ready | invalid
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ password: "", confirm_password: "" })
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
    if (!data || typeof data !== "object") return statusText || "Something went wrong."
    return data.message || data.detail || "Something went wrong."
  }

  // validate token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStep("invalid");
        setError("No token provided");
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/accounts/verify-reset-token/?token=${token}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setStep("invalid");
          setError(getErrorMessage(data, response.statusText));
          return;
        }

        setStep("ready");
      } catch (error) {
        setStep("invalid");
        setError("Cannot connect to the server!");
      }
    };
    verifyToken();
  }, [token])



  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("")

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (!allValid) {
        setError("Password does not meet requirements");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/accounts/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, ...formData }),
        credentials: "include",
      })

      let data = null
      try { data = await response.json() } catch (_err) { data = null }

      if (!response.ok) {
        setError(getErrorMessage(data, response.statusText))
        return
      }
      toast.success(data.message, {autoClose: 2000,});
      navigate("/login")
    } catch (err) {
      setError("Cannot connect to the server!")
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-cream-100 rounded-2xl p-8 border border-cream-200">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
            <Target size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900">Stride</span>
        </div>

        {step === "checking" && (
          <p className="text-neutral-500 text-sm">Checking your link...</p>
        )}

        {step === "invalid" && (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Link invalid</h1>
            <div className="bg-red-50  text-red-600 text-sm font-bold px-4 py-2.5 rounded-lg mt-4">
              {error}
            </div>
            <p className="text-sm text-neutral-500 text-center mt-6">
              <Link to="/forgot-password" className="text-green-600 hover:underline font-medium">
                Request a new link
              </Link>
            </p>
          </>
        )}

        {step === "ready" && (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Set new password</h1>
            <p className="text-neutral-500 text-sm mb-6">Choose a new password for your account.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 block mb-1">New password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
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
                  name="confirm_password"
                  className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>

              {error && (
                <div className="bg-red-50   text-red-600 text-sm font-bold px-4 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-400 hover:-translate-y-0.5 transition-all duration-200 font-medium mt-2"
              >
                Reset password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}