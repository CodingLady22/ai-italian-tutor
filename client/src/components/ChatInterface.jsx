import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Bot,
  Volume2,
  Mic,
  MicOff,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import { FREE_CALL_LIMIT } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { getSpeakableText } from "../utils/speakableText";

const SpeechRecognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);
const speechSynthesisSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

// Maps SpeechRecognition error codes to translation keys. Codes not listed
// here (e.g. "aborted") are not shown to the user.
const VOICE_ERROR_KEYS = {
  "not-allowed": "voiceErrorDenied",
  "service-not-allowed": "voiceErrorDenied",
  "no-speech": "voiceErrorNoSpeech",
  network: "voiceErrorNetwork",
  "audio-capture": "voiceErrorGeneric",
  "language-not-supported": "voiceErrorGeneric",
};

export default function ChatInterface({ session, onLimitReached }) {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "it-IT";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      const key = VOICE_ERROR_KEYS[event.error];
      if (key) setVoiceError(key);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  // Chrome loads voices asynchronously, so getVoices() is empty on first call.
  // Keep the list fresh, and stop any speech when leaving the chat or switching sessions.
  useEffect(() => {
    if (!speechSynthesisSupported) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [session?._id]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      return;
    }

    setVoiceError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      // start() throws InvalidStateError if recognition is already running
      console.error("Speech recognition failed to start", err);
      setVoiceError("voiceErrorGeneric");
      setIsListening(false);
    }
  };

  const speak = (content, messageId) => {
    if (!speechSynthesisSupported) return;

    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);

    const utterance = new SpeechSynthesisUtterance(getSpeakableText(content));
    utterance.lang = "it-IT";

    const italianVoice = voicesRef.current.find((v) =>
      v.lang.toLowerCase().startsWith("it"),
    );
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onstart = () => setCurrentlySpeaking(messageId);
    utterance.onend = () => setCurrentlySpeaking(null);
    utterance.onerror = () => setCurrentlySpeaking(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!session?._id) return;

    setError(null);
    setVoiceError(null);
    setCurrentlySpeaking(null);

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/sessions/${session._id}/messages`);
        const newMessages = Array.isArray(res.data) ? res.data : [];
        setMessages(newMessages);
        // On initial load, scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 100);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError(t("chatErrorHistory"));
      }
    };

    fetchMessages();
  }, [session?._id, t]);

  // Handle auto-scroll only for new messages
  useEffect(() => {
    if (messages.length > 0) {
      // If there are messages, scroll down to the bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, error]);

  // The server saves nothing when a send fails, so a retry re-sends the same
  // text without adding a second bubble.
  const sendMessage = async (content, tempId) => {
    setLoading(true);
    setError(null);
    setMessages((prev) =>
      prev.map((m) => (m._id === tempId ? { ...m, failed: false } : m)),
    );

    try {
      const res = await api.post("/chat/send-message", {
        sessionId: session._id,
        message: content,
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
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, failed: true } : m)),
      );
      if (err.response?.status === 403) {
        const msg = err.response.data.message || t("chatErrorLimit");
        setError(msg);
        if (onLimitReached) {
          setTimeout(onLimitReached, 2000);
        }
      } else {
        setError(t("chatErrorSend"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const content = newMessage;
    const tempId = `temp-${Date.now()}`;
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        sender: "user",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    sendMessage(content, tempId);
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        {t("chatSelectSession")}
      </div>
    );
  }

  const freeMessagesLeft = FREE_CALL_LIMIT - (user?.fallbackCount || 0);
  const showUsageWarning = !user?.hasApiKey && freeMessagesLeft >= 0;

  // Show error card if explicitly set or if limit is reached
  const activeError =
    error ||
    (freeMessagesLeft <= 0 && !user?.hasApiKey ? t("chatErrorLimit") : null);

  return (
    <div
      className="flex flex-col min-h-0 h-full bg-gray-50 relative"
      style={{ height: "100%", minHeight: 0 }}
    >
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
          <div
            className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 ${
              freeMessagesLeft === 0
                ? "bg-red-100 text-red-700 animate-pulse"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <AlertCircle size={14} />
            <span className="font-medium">
              {freeMessagesLeft === 0
                ? t("chatLimitReached")
                : `${t("youHave")} ${freeMessagesLeft} ${t("freeMessagesLeft")}`}
            </span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg._id}
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
                  {isUser && msg.failed && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-100">
                      <span>{t("chatNotSent")}</span>
                      <button
                        type="button"
                        onClick={() => sendMessage(msg.content, msg._id)}
                        disabled={loading}
                        className="underline font-medium hover:text-white disabled:opacity-50"
                      >
                        {t("chatRetry")}
                      </button>
                    </div>
                  )}
                  {!isUser && speechSynthesisSupported && (
                    <button
                      onClick={() => speak(msg.content, msg._id)}
                      className={`absolute top-2 right-2 transition-colors ${
                        currentlySpeaking === msg._id
                          ? "text-blue-600 animate-pulse"
                          : "text-gray-400 hover:text-blue-600"
                      }`}
                      title={t("chatSpeak")}
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
            <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl text-sm flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="font-medium italic">{t("chatThinking")}</span>
            </div>
          </div>
        )}

        {activeError && (
          <div className="flex justify-center my-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm max-w-md">
              <AlertCircle className="shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold">{activeError}</p>
                {freeMessagesLeft <= 0 && !user?.hasApiKey && (
                  <button
                    onClick={onLimitReached}
                    className="text-xs underline mt-1 font-medium hover:text-red-800 transition-colors"
                  >
                    {t("openSettings")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {voiceError && (
          <div
            role="alert"
            className="max-w-4xl mx-auto mb-2 flex items-center gap-2 text-sm text-red-700"
          >
            <AlertCircle className="shrink-0" size={16} />
            <span>{t(voiceError)}</span>
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 max-w-4xl mx-auto"
        >
          {SpeechRecognition && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-full border transition-colors ${
                isListening
                  ? "bg-red-100 border-red-300 text-red-600 animate-pulse"
                  : "bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100"
              }`}
              disabled={loading || (freeMessagesLeft <= 0 && !user?.hasApiKey)}
              title={isListening ? t("chatMicStop") : t("chatMicStart")}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              freeMessagesLeft <= 0 && !user?.hasApiKey
                ? t("chatLimitReached")
                : isListening
                  ? t("chatListening")
                  : t("chatPlaceholder")
            }
            className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
            disabled={loading || (freeMessagesLeft <= 0 && !user?.hasApiKey)}
          />
          <button
            type="submit"
            disabled={
              loading ||
              !newMessage.trim() ||
              (freeMessagesLeft <= 0 && !user?.hasApiKey)
            }
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
