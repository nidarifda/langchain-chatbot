"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Call API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Press Enter to send, Shift + Enter for new line (if using textarea later)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        🤖 LangChain + Next.js Chatbot
      </h1>

      <div className="w-full max-w-xl border rounded-xl bg-white shadow p-4 flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 p-2 border rounded-md bg-gray-50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded-md ${
                m.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-gray-200 text-left"
              }`}
            >
              <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.content}
            </div>
          ))}
        </div>

        <div className="flex w-full items-center">
          <input
            type="text"
            className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
