import { Link } from "react-router-dom"
import { Target } from "lucide-react"
import { useState } from "react"
import { API_BASE_URL } from "../config"

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const getErrorMessage = (data, statusText) => {
    if (!data || typeof data !== "object") return statusText || "Something went wrong."
    return data.message || data.detail || "Something went wrong."
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      let data = null
      try { data = await response.json() } catch (_err) { data = null }

      if (!response.ok) {
        setError(getErrorMessage(data, response.statusText))
        return
      }

      setSent(true)
    } catch (err) {
      setError("Cannot connect to the server!")
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-cream-100 rounded-2xl p-8 border border-cream-200 text-center">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center mx-auto mb-6">
            <Target size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Check your email</h1>
          <p className="text-neutral-500 text-sm">
            If that email exists, a reset link was sent. It expires soon, so check now.
          </p>
        </div>
      </div>
    )
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

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Forgot password</h1>
        <p className="text-neutral-500 text-sm mb-6">Enter your email. We'll send a reset link.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-900 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-cream-200 bg-cream-50 text-neutral-900 outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border  text-red-600 text-sm font-bold px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-400 hover:-translate-y-0.5 transition-all duration-200 font-medium mt-2"
          >
            Send reset link
          </button>
        </form>

        <p className="text-sm text-neutral-500 text-center mt-6">
          Remembered it?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}