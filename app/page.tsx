"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hey there! I’m your LangChain Chatbot. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
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
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: could not connect to API." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Enter key handler
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle theme
  const toggleDarkMode = () => setDarkMode((p) => !p);

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-2xl flex flex-col h-[90vh] shadow-xl rounded-2xl overflow-hidden border ${
          darkMode ? "border-gray-800" : "border-gray-300"
        }`}
      >
        {/* HEADER */}
        <header
          className={`flex justify-between items-center px-5 py-3 font-semibold text-lg ${
            darkMode ? "bg-gray-900 text-white" : "bg-blue-600 text-white"
          }`}
        >
          <h1 className="flex items-center gap-2">
            🤖 LangChain + Next.js Chatbot
          </h1>
          <button
            onClick={toggleDarkMode}
            className="text-sm bg-white/20 px-3 py-1 rounded-md hover:bg-white/30 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        {/* CHAT BODY */}
        <div
          className={`flex-1 overflow-y-auto p-5 space-y-4 ${
            darkMode ? "bg-gray-950" : "bg-white"
          }`}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-md leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : darkMode
                    ? "bg-gray-800 text-gray-100 rounded-bl-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                } animate-fadeIn`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {isTyping && (
            <div className="flex justify-start">
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
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

        {/* INPUT BAR */}
        <footer
          className={`p-4 border-t flex items-center gap-2 ${
            darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className={`flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              darkMode
                ? "bg-gray-800 text-gray-100 placeholder-gray-400"
                : "bg-white text-gray-900 placeholder-gray-500"
            }`}
          />
          <button
            onClick={sendMessage}
            disabled={isTyping}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              isTyping
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isTyping ? "..." : "Send"}
          </button>
        </footer>
      </div>
    </main>
  );
}
