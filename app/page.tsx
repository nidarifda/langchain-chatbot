"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hey there! I’m your LangChain Chatbot. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "⚠️ No response from server." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error connecting to the server." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main
      className={`flex flex-col h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#1E1E2E] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`flex justify-between items-center px-6 py-4 shadow ${
          darkMode ? "bg-[#27293D]" : "bg-white"
        }`}
      >
        <h1 className="text-xl font-bold flex items-center gap-2">
          🤖 LangChain + Next.js Chatbot
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1.5 rounded-lg border border-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[75%] leading-relaxed animate-fadeIn ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : darkMode
                  ? "bg-[#2E2E3E] text-gray-100 rounded-bl-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Animation */}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-3 rounded-2xl text-sm ${
                darkMode ? "bg-[#2E2E3E]" : "bg-gray-200"
              }`}
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className={`flex items-center gap-2 p-4 border-t ${
          darkMode ? "bg-[#27293D] border-gray-700" : "bg-white border-gray-300"
        }`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className={`flex-1 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            darkMode
              ? "bg-[#2E2E3E] text-gray-100 placeholder-gray-400"
              : "bg-gray-100 text-gray-900 placeholder-gray-500"
          }`}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </main>
  );
}
