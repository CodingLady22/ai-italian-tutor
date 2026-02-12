import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Zap,
  GraduationCap,
  Globe,
  ArrowRight,
} from "lucide-react";
import flag from "../assets/italy.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Real Conversations",
      icon: <MessageCircle className="text-green-600" size={24} />,
      description:
        "Practice natural Italian in simulated scenarios like ordering coffee or checking into a hotel.",
    },
    {
      title: "Instant Feedback",
      icon: <Zap className="text-red-600" size={24} />,
      description:
        "Get corrections on your grammar and vocabulary in real-time as you chat.",
    },
    {
      title: "Adaptive Learning",
      icon: <GraduationCap className="text-green-600" size={24} />,
      description:
        "The AI adjusts its vocabulary based on your level, from A1 (Beginner) to C2 (Expert).",
    },
    {
      title: "Cultural Immersion",
      icon: <Globe className="text-red-600" size={24} />,
      description:
        "Learn not just the words, but the common idioms and cultural nuances of Italy.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Italy Flag">
            <img src={flag} alt="Italian flag" width={20} />
          </span>
          <span className="font-bold text-xl tracking-tighter">
            Italian Tutor
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium hover:text-green-600 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition-all shadow-md"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* hero section */}
      <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-green-700 uppercase bg-green-50 rounded-full">
          Master Italian with AI
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Talk your way to <span className="text-green-600">fluency.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The most effective way to learn Italian is to speak it. Practice
          anytime, anywhere, with your personal AI tutor that never gets tired.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all group shadow-xl"
          >
            Start Learning
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button className="px-8 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all">
            Watch Demo
          </button>
        </div>

        {/* Mock UI Preview */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-gray-50 aspect-video md:aspect-[21/9] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <MessageCircle size={48} className="opacity-20" />
              <p className="italic font-medium">
                Visualizzatore dell'interfaccia chat...
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-red-100 rounded-full -z-10 opacity-50 blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-100 rounded-full -z-10 opacity-50 blur-2xl"></div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why learn with Italian Tutor?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Traditional apps teach you grammar rules. We teach you how to
              actually communicate with people.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="mb-4 p-3 bg-gray-50 inline-block rounded-xl">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="flex justify-center gap-1 mb-6">
          <div className="w-12 h-2 bg-green-600 rounded-full"></div>
          <div className="w-12 h-2 bg-white border border-gray-100 rounded-full"></div>
          <div className="w-12 h-2 bg-red-600 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Italian Tutor. Fatto con ❤️ per gli
          studenti di italiano.
        </p>
      </footer>
    </div>
  );
}
