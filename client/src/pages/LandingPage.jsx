import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Zap,
  GraduationCap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Mic,
  Volume2,
  Bot,
  User,
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
      <header className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-block px-4 py-1.5 mb-8 text-xs font-black tracking-widest text-green-700 uppercase bg-green-50 rounded-full">
          Master Italian with AI-Powered Conversations
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[0.9]">
          Talk your way to{" "}
          <span className="text-green-600 underline decoration-green-100 underline-offset-8">
            fluency.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          The most effective way to learn Italian is to speak it. Practice with
          a personal AI tutor that identifies your mistakes and explains the
          rules in your native language.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all group shadow-2xl shadow-slate-200"
          >
            Start Learning{" "}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button className="px-10 py-5 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all">
            Watch Demo
          </button>
        </div>

        {/* High-Fidelity Mock UI (Pure CSS/Tailwind) */}
        <div className="relative mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden bg-slate-50 flex flex-col md:flex-row h-[500px] text-left">
            {/* Mock Sidebar */}
            <div className="hidden md:flex w-64 bg-slate-900 flex-col p-6 text-white shrink-0">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Lezioni Recenti
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm font-bold flex items-center gap-2">
                  <MessageCircle size={14} className="text-green-500" /> Passato
                  Prossimo
                </div>
                <div className="p-3 text-slate-500 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                  Al Ristorante
                </div>
                <div className="p-3 text-slate-500 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                  Prenotare un treno
                </div>
              </div>
            </div>

            {/* Mock Chat Window */}
            <div className="flex-1 flex flex-col relative bg-slate-50">
              {/* Mock Chat Header */}
              <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-sm font-black text-slate-800">
                    Grammatica: Doppie
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Livello A1 • Italiano Standard
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Volume2 size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Mock Chat Messages */}
              <div className="flex-1 p-6 space-y-6 overflow-hidden">
                <div className="flex gap-3 items-start animate-in fade-in slide-in-from-left duration-500 delay-300">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm max-w-[80%]">
                    <p className="text-sm text-slate-800 font-medium italic">
                      "Ciao! Come va? Quanti anni hai?"
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start justify-end animate-in fade-in slide-in-from-right duration-500 delay-700">
                  <div className="bg-green-600 p-4 rounded-2xl rounded-tr-none text-white shadow-md max-w-[80%]">
                    <p className="text-sm font-bold">"Ho venticinque ani."</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <User size={16} className="text-green-700" />
                  </div>
                </div>

                <div className="flex gap-3 items-start animate-in fade-in slide-in-from-left duration-500 delay-1000">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border-l-4 border-l-orange-400 border-slate-200 shadow-sm max-w-[80%]">
                    <div className="text-[10px] font-black text-orange-500 uppercase mb-1">
                      Feedback Tutor
                    </div>
                    <p className="text-sm text-slate-800">
                      Attenzione! Devi dire{" "}
                      <span className="font-bold underline">"anni"</span> con la
                      doppia 'n'. Altrimenti significa un'altra cosa...
                      imbarazzante!
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 animate-pulse">
                  <Mic size={20} />
                </div>
                <div className="flex-1 bg-slate-100 rounded-full px-6 py-2.5 text-slate-400 text-sm font-medium flex items-center">
                  Sto ascoltando...
                </div>
              </div>
            </div>
          </div>

          {/* Background Blobs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-100 rounded-full -z-10 opacity-40 blur-3xl"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-green-100 rounded-full -z-10 opacity-40 blur-3xl"></div>
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
