"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi there! I'm your LangChain chatbot." },
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Send message function
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: Failed to connect to API." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Allow Enter to send
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="w-full max-w-2xl shadow-lg rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
        {/* Header */}
        <div
          className={`flex justify-between items-center px-4 py-3 ${
            darkMode ? "bg-gray-800" : "bg-blue-600"
          } text-white`}
        >
          <h1 className="font-semibold text-lg flex items-center">
            🤖 LangChain + Next.js Chatbot
          </h1>
          <button
            onClick={toggleDarkMode}
            className="text-sm bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Chat area */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 h-[500px] ${
            darkMode ? "bg-gray-900" : "bg-white"
          }`}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : darkMode
                    ? "bg-gray-700 text-gray-100 rounded-bl-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing animation */}
          {isTyping && (
            <div className="flex justify-start">
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  darkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <span className="inline-flex space-x-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div
          className={`border-t p-3 flex ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 text-gray-100 focus:ring-blue-400"
                : "bg-white text-gray-800 focus:ring-blue-400"
            }`}
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
