"use client";
import { useState, useEffect, useRef } from "react";
import { Copy, Edit, RotateCcw, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}

const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
];

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    // Initialize with a default session
    const defaultSession: ChatSession = {
      id: 'default',
      title: 'New Chat',
      messages: [{ 
        id: '1', 
        role: 'assistant', 
        content: 'Hello! How can I help you today?',
        timestamp: new Date()
      }],
      createdAt: new Date(),
      model: 'gpt-4o-mini'
    };
    return [defaultSession];
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string>('default');
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeSession?.messages]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat-sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      setActiveSessionId(parsed[0]?.id || 'default');
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ 
        id: '1', 
        role: 'assistant', 
        content: 'Hello! How can I help you today?',
        timestamp: new Date()
      }],
      createdAt: new Date(),
      model: 'gpt-4o-mini'
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId && sessions.length > 1) {
      setActiveSessionId(sessions.find(s => s.id !== sessionId)?.id || 'default');
    }
  };

  const updateSessionModel = (sessionId: string, model: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, model } : session
    ));
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession) return;

    const userMessage: Message = { 
      id: Date.now().toString(),
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...activeSession.messages, userMessage];
    const updatedSession = {
      ...activeSession,
      messages: updatedMessages,
      title: activeSession.title === 'New Chat' && activeSession.messages.length === 1 
        ? input.slice(0, 50) + (input.length > 50 ? '...' : '')
        : activeSession.title
    };

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? updatedSession : s
    ));
    
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          model: activeSession.model 
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date()
        };
        
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, messages: [...updatedMessages, botMessage] }
            : s
        ));
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...updatedMessages, errorMsg] }
          : s
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const userMessage = activeSession.messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          model: activeSession.model 
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        const newMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date()
        };

        // Replace the old assistant message with the new one
        const updatedMessages = [...activeSession.messages];
        updatedMessages[messageIndex] = newMessage;
        
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, messages: updatedMessages }
            : s
        ));
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const MessageActions = ({ message, showRegenerate }: { message: Message; showRegenerate?: boolean }) => (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => copyToClipboard(message.content)}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
        title="Copy"
      >
        <Copy size={14} />
      </button>
      {message.role === 'assistant' && showRegenerate && (
        <button
          onClick={() => regenerateResponse(message.id)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Regenerate"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (!inline && language) {
            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-lg my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }
          
          return (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-4">
            <button
              onClick={createNewSession}
              className="w-full flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="px-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
                    activeSessionId === session.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{session.title}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {session.messages.length - 1} messages
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Current Model</div>
            <select
              value={activeSession.model}
              onChange={(e) => updateSessionModel(activeSessionId, e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              {MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-800">{activeSession.title}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
  {/* 🌙 Theme Toggle Button */}
  <button
    onClick={() => setIsDark(!isDark)}
    className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition"
  >
    {isDark ? "☀️ Light" : "🌙 Dark"}
  </button>

  {/* 🧠 Model Selector */}
  <select
    value={activeSession.model}
    onChange={(e) => updateSessionModel(activeSessionId, e.target.value)}
    className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1 text-sm text-gray-800 dark:text-gray-100"
  >
    {MODELS.map((model) => (
      <option key={model.id} value={model.id}>
        {model.name}
      </option>
    ))}
  </select>
</div>
            >
              {MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100"
        >
          {activeSession.messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-3xl ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3 group`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" 
                    ? "bg-green-500" 
                    : "bg-purple-500"
                }`}>
                  <span className="text-white font-bold text-xs">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-green-500 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <MessageActions 
                  message={msg} 
                  showRegenerate={msg.role === 'assistant' && idx === activeSession.messages.length - 1}
                />
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-3xl flex-row items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-500">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message ChatGPT..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500"
                style={{ minHeight: "56px", maxHeight: "200px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transform rotate-45"
                >
                  <path
                    d="M14.6667 1.33333L7.33333 8.66667M14.6667 1.33333L10 14.6667L7.33333 8.66667M14.6667 1.33333L1.33333 6L7.33333 8.66667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              ChatGPT can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
