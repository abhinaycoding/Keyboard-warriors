import { useState } from 'react';
import { Bot, X, Send, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';

const suggestions = [
  'What assets can I include?',
  'How many witnesses needed?',
  'Can I change my will later?',
];

export default function LegalAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant', content: 'Namaste 🙏 I\'m your AI legal assistant. Ask me anything about wills, inheritance, and Indian succession law.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setInput(''); setLoading(true); setOffline(false);
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ model: 'llama3', prompt: `You are an Indian legal expert. Max 80 words. User: ${msg}`, stream: false })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.response }]);
    } catch {
      setOffline(true);
      setMessages(m => [...m, { role: 'assistant', content: 'Unable to connect to AI. Please try again later.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={()=>setOpen(o=>!o)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5
          bg-gradient-to-r from-navy to-saffron text-navy
          pl-4 pr-5 py-3 rounded-full shadow-glow-md
          transition-all duration-300 hover:shadow-glow-lg hover:scale-105
          ${open ? 'scale-95 opacity-90' : ''}`}>
        {open ? <X size={18} /> : <Sparkles size={18} />}
        <span className="text-sm font-semibold">{open ? 'Close' : 'Legal AI'}</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 glass-strong rounded-3xl flex flex-col overflow-hidden animate-slide-up shadow-2xl" style={{ maxHeight: '520px' }}>
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy/20 to-saffron/20 flex items-center justify-center border border-slate-200">
              <Bot size={16} className="text-navy" />
            </div>
            <div><p className="text-navy font-bold text-sm">Legal AI</p><p className="text-slate-500 text-xs">Ollama-powered</p></div>
            {offline && <span className="ml-auto flex items-center gap-1 bg-red-500/15 text-red-400 text-xs rounded-full px-2 py-0.5 border border-red-500/20"><AlertTriangle size={10} /> Offline</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role==='user'
                    ? 'bg-gradient-to-r from-navy to-saffron text-navy rounded-br-sm'
                    : 'glass text-slate-700 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-100 animate-bounce" style={{ animationDelay:`${i*150}ms` }} />)}
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-slate-200 flex gap-2 overflow-x-auto scrollbar-thin">
              {suggestions.map(s => (
                <button key={s} onClick={()=>send(s)}
                  className="shrink-0 text-xs glass px-3 py-1.5 rounded-full text-slate-500 hover:border-slate-200 hover:text-navy transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={e=>{e.preventDefault();send();}} className="px-4 py-3 border-t border-slate-200 flex gap-2">
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a legal question…"
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-navy placeholder-gray-600 focus:outline-none focus:border-slate-200" />
            <button type="submit" disabled={loading||!input.trim()}
              className="bg-gradient-to-r from-navy to-saffron p-2.5 rounded-xl transition-all disabled:opacity-30 hover:shadow-glow-sm">
              <Send size={16} className="text-navy" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
