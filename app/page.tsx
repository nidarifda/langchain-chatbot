"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  const sendMessage = async () => {
    if (!input) return;

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    setInput("");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">🤖 LangChain + Next.js Chatbot</h1>
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <div className="h-80 overflow-y-auto border-b mb-4 p-2">
          {messages.map((m, i) => (
            <div key={i} className={`my-2 ${m.role === "user" ? "text-blue-600" : "text-green-600"}`}>
              <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.content}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            className="bg-blue-500 text-white px-4 rounded-r"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
