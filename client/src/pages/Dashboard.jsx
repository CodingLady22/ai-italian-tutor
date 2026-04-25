import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  Plus,
  MessageSquare,
  Menu,
  X,
  Loader2,
  Settings,
  Key,
  AlertCircle,
  Save,
} from "lucide-react";
import api from "../api/axios";
import ChatInterface from "../components/ChatInterface";
import { grammarTopics } from "../api/grammarTopics";

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  // new session from state
  const [newSessionData, setNewSessionData] = useState({
    level: "A1",
    mode: "topic",
    focus_area: "",
  });

  // reset focus area when level or mode changes
  useEffect(() => {
    setNewSessionData((prev) => ({ ...prev, focus_area: "" }));
  }, [newSessionData.level, newSessionData.mode]);

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

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput) {
      setSaveMessage({ type: "error", text: "Please enter an API key." });
      return;
    }
    setIsSavingKey(true);
    setSaveMessage({ type: "", text: "" });

    try {
      await api.put("/users/api-key", { apiKey: apiKeyInput });
      updateUser({ hasApiKey: true });
      setSaveMessage({ type: "success", text: "API Key saved successfully!" });
      setApiKeyInput("");
      setTimeout(() => setIsSettingsOpen(false), 1500);
    } catch (err) {
      console.error("Failed to save API key", err);
      setSaveMessage({
        type: "error",
        text: "Failed to save API key. Please try again.",
      });
    } finally {
      setIsSavingKey(false);
    }
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

      const newSession = res.data.session;
      if (res.data.fallbackCount !== undefined) {
        updateUser({ fallbackCount: res.data.fallbackCount });
      }

      setSessions([newSession, ...sessions]);
      setSelectedSession(newSession);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create session", err);
      if (err.response?.status === 403) {
        setCreateError(err.response.data.message || "Free limit reached. Please add your own API key.");
        setTimeout(() => setIsSettingsOpen(true), 2000);
      } else {
        setCreateError("Failed to start session. Please try again.");
      }
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
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Settings className="text-gray-600" size={20} />
                <h3 className="font-bold text-gray-900">Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Key size={14} /> Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={
                      user?.hasApiKey
                        ? "•••••••••••••••• (Saved)"
                        : "Enter your Gemini API Key"
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                    Get your free API key from the{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-medium"
                    >
                      Google AI Studio
                    </a>
                    . Your key is stored securely and used only for your own
                    requests.{" "}
                    <Link
                      to="/api-key-guide"
                      className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      (View Step-by-Step Guide)
                    </Link>
                  </p>
                </div>

                {saveMessage.text && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${saveMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingKey}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isSavingKey ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save API Key
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col relative z-10 overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tight">🇮🇹 AI Tutor</h1>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              Ciao, {user?.name || user?.email?.split("@")[0]}!
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium shadow-md shadow-green-900/20"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            History
          </p>
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare
                className="mx-auto text-gray-700 mb-2 opacity-20"
                size={32}
              />
              <p className="text-gray-500 text-xs italic">
                No conversations yet
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className="relative group">
                <button
                  onClick={() => {
                    setSelectedSession(session);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                    selectedSession?._id === session._id
                      ? "bg-gray-800 text-white ring-1 ring-gray-700"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <MessageSquare size={16} className="shrink-0 opacity-60" />
                  <div className="truncate flex-1">
                    <div className="font-medium truncate">
                      {session.focus_area}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-tighter">
                      {session.mode} • {session.level}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session._id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm w-full p-2 rounded-lg hover:bg-gray-800"
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm w-full p-2 rounded-lg hover:bg-gray-800"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 bg-gray-900 text-white p-2 rounded-md shadow-lg hover:bg-gray-800 lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}

        {/* API Key missing warning */}
        {!user?.hasApiKey && !selectedSession && (
          <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center justify-center gap-2 text-amber-800 text-sm">
            <AlertCircle size={16} />
            <span>
              {user?.fallbackCount >= 5 ? (
                <>
                  Free limit reached. Please{" "}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="font-bold underline"
                  >
                    add your Gemini API Key
                  </button>{" "}
                  to continue.
                </>
              ) : (
                <>
                  You have <b>{5 - (user?.fallbackCount || 0)}</b> free messages
                  left. <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="font-bold underline"
                  >
                    Add your own API Key
                  </button>{" "}
                  for unlimited access.
                </>
              )}
            </span>
          </div>
        )}

        {selectedSession ? (
          <ChatInterface 
            session={selectedSession} 
            onLimitReached={() => setIsSettingsOpen(true)}
          />
        ) : (
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
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
                    Practice Mode
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
                      className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                        newSessionData.mode === "topic"
                          ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-200"
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
                      className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                        newSessionData.mode === "grammar"
                          ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-200"
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
                  {newSessionData.mode === "grammar" &&
                  grammarTopics[newSessionData.level] ? (
                    <select
                      required
                      value={newSessionData.focus_area}
                      onChange={(e) =>
                        setNewSessionData({
                          ...newSessionData,
                          focus_area: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    >
                      <option value="">Select a topic</option>
                      {grammarTopics[newSessionData.level].map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  ) : (
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
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
