import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/accounts/logout/`, {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error(err)
    } finally {
      navigate("/login")
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      
      {/* Top bar */}
      <div className="bg-cream-100 border-b border-cream-200 px-8 py-4 flex justify-between items-center">
        <span className="font-bold text-neutral-900 text-lg">Stride</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-500 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-500">Coming soon. Building week by week.</p>
      </div>

    </div>
  )
}