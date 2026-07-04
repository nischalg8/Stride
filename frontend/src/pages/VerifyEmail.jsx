import { Link, useSearchParams } from "react-router-dom"
import { Target } from "lucide-react"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "../config"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState("checking")  // checking | success | error
  const [message, setMessage] = useState("")

  const getErrorMessage = (data, statusText) => {
    if (!data || typeof data !== "object") return statusText || "Something went wrong."
    return data.message || data.detail || "Something went wrong."
  }

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No token provided");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/accounts/verify-email/?token=${token}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setStatus("error");
          setMessage(getErrorMessage(data, response.statusText));
          return;
        }

        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage("Cannot connect to the server!");
      }
    };

    verifyEmail();
  }, [token]);
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-cream-100 rounded-2xl p-8 border border-cream-200 text-center">

        <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center mx-auto mb-6">
          <Target size={18} className="text-white" />
        </div>

        {status === "checking" && (
          <p className="text-neutral-500 text-sm">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Email verified</h1>
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2.5 rounded-lg mb-4">
              {message}
            </div>
            <Link to="/login" className="text-green-600 hover:underline font-medium text-sm">
              Continue to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verification failed</h1>
            <div className="bg-red-50 border  text-red-600 text-sm font-bold px-4 py-2.5 rounded-lg mb-4">
              {message}
            </div>
            <Link to="/signup" className="text-green-600 hover:underline font-medium text-sm">
              Back to signup
            </Link>
          </>
        )}
      </div>
    </div>
  )
}