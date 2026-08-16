'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Loader2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am Dishari, your official administrative assistant. How can I help you today?',
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: data.reply, sources: data.sources || [] },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: `Error: ${data.details || data.error}` },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Failed to connect to the Dishari server. Ensure Express backend is running on port 5000.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Dishari Assistant</h1>
          <p className="text-xs text-slate-400">Next.js Frontend + Express RAG Backend</p>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed">{msg.text}</p>

              {/* Sources display */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-slate-400 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Sources:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.source_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-900/80 hover:bg-slate-950 text-blue-400 border border-slate-700 px-2.5 py-1 rounded transition-colors"
                      >
                        {src.title || src.filename || `Doc ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              Dishari is fetching details from knowledge base...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Footer */}
      <footer className="p-4 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-100 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}