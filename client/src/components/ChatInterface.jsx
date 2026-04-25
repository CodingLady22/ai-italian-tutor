import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, Volume2, Mic, MicOff, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ChatInterface({ session, onLimitReached }) {
  const { user, updateUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "it-IT";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage((prev) => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text, messageId) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "it-IT";

      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find((v) => v.lang.startsWith("it"));
      if (italianVoice) {
        utterance.voice = italianVoice;
      }

      utterance.onstart = () => setCurrentlySpeaking(messageId);
      utterance.onend = () => setCurrentlySpeaking(null);
      utterance.onerror = () => setCurrentlySpeaking(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!session?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/sessions/${session._id}/messages`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError("Could not load conversation history.");
      }
    };

    fetchMessages();
  }, [session?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, error]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const tempMessage = newMessage;
    setNewMessage("");
    setLoading(true);
    setError(null);

    const userMessage = {
      _id: Date.now().toString(),
      sender: "user",
      content: tempMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await api.post("/chat/send-message", {
        sessionId: session._id,
        message: tempMessage,
      });

      if (res.data) {
        const { fallbackCount, ...msgData } = res.data;
        setMessages((prev) => [...prev, msgData]);
        if (fallbackCount !== undefined) {
          updateUser({ fallbackCount });
        }
      }
    } catch (err) {
      console.error("Failed to send message", err);
      if (err.response?.status === 403) {
        const msg = err.response.data.message || "Free limit reached. Please add your own API key.";
        setError(msg);
        if (onLimitReached) {
          setTimeout(onLimitReached, 2000);
        }
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a session to start chatting.
      </div>
    );
  }

  const freeMessagesLeft = 5 - (user?.fallbackCount || 0);
  const showUsageWarning = !user?.hasApiKey && freeMessagesLeft >= 0;
  
  // Show error card if explicitly set or if limit is reached
  const activeError = error || (freeMessagesLeft <= 0 && !user?.hasApiKey ? "Free limit reached. Please add your own Gemini API key in settings to continue." : null);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm relative z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {session.focus_area || "Italian Conversation Practice"}
          </h2>
          <p className="text-sm text-gray-500 capitalize">
            {session.mode || "Chat"} • Level {session.level || "A1"}
          </p>
        </div>
        
        {showUsageWarning && (
          <div className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 ${
            freeMessagesLeft === 0 
              ? "bg-red-100 text-red-700 animate-pulse" 
              : "bg-amber-100 text-amber-700"
          }`}>
            <AlertCircle size={14} />
            <span className="font-medium">
              {freeMessagesLeft === 0 
                ? "Free limit reached" 
                : `${freeMessagesLeft} free message${freeMessagesLeft === 1 ? '' : 's'} left`}
            </span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg._id || Math.random()}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  isUser ? "flex-row-reverse" : "flex-row"
                } items-start gap-3`}
              >
                <div
                  className={`p-2 rounded-full flex-shrink-0 ${
                    isUser
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isUser ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div
                  className={`relative p-4 rounded-2xl shadow-sm ${
                    isUser
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed pr-6">
                    {msg.content}
                  </p>
                  {!isUser && (
                    <button
                      onClick={() => speak(msg.content, msg._id)}
                      className={`absolute top-2 right-2 transition-colors ${
                        currentlySpeaking === msg._id
                          ? "text-blue-600 animate-pulse"
                          : "text-gray-400 hover:text-blue-600"
                      }`}
                      title="Speak"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} />
              Thinking...
            </div>
          </div>
        )}

        {activeError && (
          <div className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm max-w-md">
              <AlertCircle className="shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold">{activeError}</p>
                {freeMessagesLeft <= 0 && (
                  <button 
                    onClick={onLimitReached}
                    className="text-xs underline mt-1 font-medium hover:text-red-800 transition-colors"
                  >
                    Open Settings to add your key
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 max-w-4xl mx-auto"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full border transition-colors ${
              isListening
                ? "bg-red-100 border-red-300 text-red-600 animate-pulse"
                : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100"
            }`}
            disabled={loading || (freeMessagesLeft <= 0 && !user?.hasApiKey)}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              freeMessagesLeft <= 0 && !user?.hasApiKey
                ? "Free limit reached..."
                : isListening ? "Listening..." : "Type your message in Italian..."
            }
            className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
            disabled={loading || (freeMessagesLeft <= 0 && !user?.hasApiKey)}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim() || (freeMessagesLeft <= 0 && !user?.hasApiKey)}
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
