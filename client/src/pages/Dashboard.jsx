import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, MessageSquare, Menu, X, Loader2 } from "lucide-react";
import api from "../api/axios";
import ChatInterface from "../components/ChatInterface";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // new session from state
  const [newSessionData, setNewSessionData] = useState({
    level: "A1",
    mode: "topic",
    focus_area: "Ordering coffee",
  });

  // load chat history
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/chat/sessions");
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    };
    fetchSessions();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNewChat = () => {
    setSelectedSession(null);
    setNewSessionData({
      level: user?.italian_level || "A1",
      mode: "topic",
      focus_area: "",
    });
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await api.post("/chat/start-session", newSessionData);
      setSessions([res.data, ...sessions]);
      setSelectedSession(res.data);
    } catch (err) {
      console.error("Failed to create session", err);
      setCreateError("Failed to start session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      if (selectedSession?._id === sessionId) {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col relative z-10`}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tight">🇮🇹 AI Tutor</h1>
          <p className="text-xs text-gray-400 mt-1">
            Ciao, {user?.name || user?.email?.split("@")[0]}!
          </p>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            History
          </p>
          {sessions.map((session) => (
            <div key={session._id} className="relative group">
              <button
                key={session.id}
                onClick={() => {
                  setSelectedSession(session);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                  selectedSession?._id === session._id
                    ? "bg-gray-800 text-white border border-gray-700"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <MessageSquare size={16} className="shrink-0" />
                <div className="truncate flex-1">
                  <div className="font-medium truncate">
                    {session.focus_area}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 capitalize">
                    {session.mode} • {session.level}
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session._id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm w-full"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* toggle sidebar */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 bg-gray-900 text-white p-2 rounded-md shadow-lg hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
        )}

        {selectedSession ? (
          // active chat interface
          <ChatInterface session={selectedSession} />
        ) : (
          // new session prompt
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Inizia una conversazione
                </h2>
                <p className="text-gray-500 mt-2">
                  Choose a topic to practice your Italian
                </p>
              </div>

              {createError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateSession} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    My Level
                  </label>
                  <select
                    value={newSessionData.level}
                    onChange={(e) =>
                      setNewSessionData({
                        ...newSessionData,
                        level: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setNewSessionData({
                          ...newSessionData,
                          mode: "topic",
                        })
                      }
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                        newSessionData.mode === "topic"
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Topic Based
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewSessionData({
                          ...newSessionData,
                          mode: "grammar",
                        })
                      }
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                        newSessionData.mode === "grammar"
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Grammar Focus
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {newSessionData.mode === "topic"
                      ? "What do you want to talk about?"
                      : "Which grammar rule?"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      newSessionData.mode === "topic"
                        ? "e.g., Ordering Pizza, Travel"
                        : "e.g., Past Tense, Prepositions"
                    }
                    value={newSessionData.focus_area}
                    onChange={(e) =>
                      setNewSessionData({
                        ...newSessionData,
                        focus_area: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Starting...
                    </>
                  ) : (
                    "Start Practice"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
