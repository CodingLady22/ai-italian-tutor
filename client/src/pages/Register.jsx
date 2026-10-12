import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { LEVELS, SUPPORT_LANGUAGES } from "../constants";

const LEVEL_LABELS = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Mastery",
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [level, setLevel] = useState("A1");
  const [supportLanguage, setSupportLanguage] = useState("English");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent multiple submissions

    setLoading(true);
    setError("");
    setSuccess("");

    // Calling register() from context
    const result = await register(name, email, password, level, supportLanguage);

    if (result.success) {
      setSuccess(result.message);
      setName("");
      setEmail("");
      setPassword("");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <div className="bg-green-600 p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-sm">
              {success}
            </div>
            <Link
              to="/login"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 font-medium"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Italian Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l} - {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Language (For explanations)
              </label>
              <select
                value={supportLanguage}
                onChange={(e) => setSupportLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {SUPPORT_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "Arabic" ? "Arabic (Morocco)" : lang}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 font-medium"
            >
              Sign Up
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
