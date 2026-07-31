'use client';

import { useState } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, Minimize2, Maximize2 } from 'lucide-react';

export function AiCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your ResearchHub AI Co-Pilot. Ask me anything about paper methodologies, grant writing, LaTeX formatting, or citation velocity.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is a synthesized analysis for "${userText}": Based on indexed papers, key contributions focus on transformer attention optimization, lowering O(N²) time complexity to O(N log N) with empirical benchmarks across ImageNet and GLUE tasks.`
        }
      ]);
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-teal-600 text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Bot size={18} className="animate-pulse" />
          <span>AI Research Co-Pilot</span>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">Gemini 1.5 Pro</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 rounded-lg bg-white dark:bg-darkCard border border-line dark:border-darkLine shadow-2xl overflow-hidden flex flex-col h-[460px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-teal-400" />
              <div>
                <h4 className="font-bold text-xs">AI Research Co-Pilot</h4>
                <p className="text-[10px] text-teal-300">Active &middot; Academic Context Ready</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-50 dark:bg-darkPanel">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white font-medium rounded-br-none'
                      : 'bg-white dark:bg-darkCard border border-line dark:border-darkLine text-slate-800 dark:text-slate-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 animate-pulse">
                <Sparkles size={12} className="text-primary" /> Synthesizing literature response...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-darkCard border-t border-line dark:border-darkLine flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about papers or methods..."
              className="flex-1 px-3 py-1.5 text-xs rounded border border-line dark:border-darkLine bg-slate-50 dark:bg-darkPanel dark:text-white outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded bg-primary text-white hover:bg-primaryDark transition disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
