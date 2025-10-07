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

  // ✅ Move testApiConnection here (INSIDE the component)
  const testApiConnection = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello, are you working?" }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ API Error:", data.error);
        alert(`API Error: ${data.error}`);
      } else {
        console.log("✅ API is working!");
      }
    } catch (error) {
      console.error("❌ API Connection failed:", error);
      alert("Failed to connect to API. Check your deployment.");
    }
  };

  // ✅ Call testApiConnection inside useEffect
  useEffect(() => {
    // Uncomment to test API on mount
    // testApiConnection();
  }, []);

  // 👇 return section
  return (
    <main
      className={`flex h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#1E1E2E] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      {/* ... [rest of your UI unchanged] ... */}
    </main>
  );
}
