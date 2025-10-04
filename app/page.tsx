"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("langchain_chats");
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      setActiveChat(parsed[0] || createNewChat());
    } else {
      const newChat = createNewChat();
      setChats([newChat]);
      setActiveChat(newChat);
    }
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeChat?.messages]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("langchain_chats", JSON.stringify(chats));
  }, [chats]);

  const createNewChat = (): ChatSession => ({
    id: Date.now().toString(),
    title: "New Chat",
    messages: [{ role: "assistant", content: "👋 Hey there! I’m your LangChain Chatbot." }],
  });

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
    };

    setChats((prev) =>
      prev.map((chat) => (chat.id === activeChat.id ? updatedChat : chat))
    );
    setActiveChat(updatedChat);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage: Message = {
        role: "assistant",
        content: data.reply || "⚠️ No response from server.",
      };

      const chatWithBot = {
        ...updatedChat,
        messages: [...updatedChat.messages, botMessage],
        title:
          updatedChat.title === "New Chat"
            ? input.slice(0, 30) + (input.length > 30 ? "..." : "")
            : updatedChat.title,
      };

      setChats((prev) =>
        prev.map((chat) => (chat.id === chatWithBot.id ? chatWithBot : chat))
      );
      setActiveChat(chatWithBot);
    } catch (err) {
      const errorMsg: Message = {
        role: "assistant",
        content: "⚠️ Error connecting to the server.",
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? { ...chat, messages: [...chat.messages, errorMsg] }
            : chat
        )
      );
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

  const startNewChat = () => {
    const newChat = createNewChat();
    setChats([newChat, ...chats]);
    setActiveChat(newChat);
  };

  return (
    <main
      className={`flex h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#1E1E2E] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`w-64 flex flex-col border-r p-4 ${
          darkMode ? "bg-[#27293D] border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
          💬 Chats
          <button
            onClick={startNewChat}
            className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            + New
          </button>
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full text-left p-2 rounded-lg truncate ${
                activeChat?.id === chat.id
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-200"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-4 border border-gray-400 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>

      {/* Chat Area */}
      <section className="flex flex-col flex-1">
        <header
          className={`flex justify-between items-center px-6 py-4 shadow ${
            darkMode ? "bg-[#27293D]" : "bg-white"
          }`}
        >
          <h1 className="font-bold text-lg flex items-center gap-2">
            🤖 LangChain + Next.js Chatbot
          </h1>
        </header>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400"
        >
          {activeChat?.messages.map((msg, idx) => (
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

        {/* Input */}
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
      </section>
    </main>
  );
}
