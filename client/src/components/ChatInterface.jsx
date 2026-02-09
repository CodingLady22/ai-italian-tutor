import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import api from "../api/axios";

export default function ChatInterface({ session }) {
  console.log("ChatInterface received session:", session); // ADD THIS
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages when the session changes
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

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const tempMessage = newMessage;
    setNewMessage("");
    setLoading(true);

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
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If session is somehow null, show a fallback instead of crashing (going blank)
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a session to start chatting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {session.focus_area || "Italian Conversation Practice"}
          </h2>
          <p className="text-sm text-gray-500 capitalize">
            {session.mode || "Chat"} • Level {session.level || "A1"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded text-center text-xs">
            {error}
          </div>
        )}

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
                  className={`p-4 rounded-2xl shadow-sm ${
                    isUser
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
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
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 max-w-4xl mx-auto"
        >
          {/* input area */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message in Italian..."
            className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
