import { Target } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="bg-cream-50 px-8 py-4 flex justify-between items-center border-b border-cream-200">
         

            <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                    <Target size={20} className="text-white" />
                </div>

                <span className="text-xl font-bold text-gray-900 tracking-tight">
                    Stride
                </span>
            </div>
            <div className="flex items-center gap-4">
                <Link
                    to="/login"
                    className="text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 hover:text-green-600 hover:bg-green-50 hover:-translate-y-0.5"
                >
                    Login
                </Link>

                <Link
                    to="/signup"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-green-400 hover:shadow-md hover:-translate-y-0.5"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    )
}