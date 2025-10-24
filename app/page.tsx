"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Plus, Sun, Moon } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hey there! I’m your LangChain Chatbot." },
  ]);
  const [input, setInput] = useState("");
  const [isDark, setIsDark] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "⚠️ No response from server." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ No response from server." }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#0B0F19]" : "bg-gray-100"} transition-colors`}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 backdrop-blur-md bg-white/5 border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 rounded-full font-bold text-sm">
            AI
          </div>
          <h1 className="text-lg font-semibold tracking-wide">LangChain Chatbot</h1>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-md hover:bg-white/10 transition">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMessages([{ role: "assistant", content: "👋 New conversation started!" }])}
            className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-md text-sm hover:opacity-80"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl leading-relaxed shadow-md ${
                msg.role === "assistant"
                  ? `${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-bl-md`
                  : "bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-br-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className={`border-t ${isDark ? "border-gray-700 bg-gray-900/60" : "border-gray-300 bg-white"} px-4 py-3`}>
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className={`flex-1 rounded-full px-4 py-2 text-sm focus:outline-none ${
              isDark
                ? "bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-green-500"
                : "bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-400"
            }`}
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white hover:opacity-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
