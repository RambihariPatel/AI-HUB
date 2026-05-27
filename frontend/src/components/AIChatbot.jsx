import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, RotateCcw, ExternalLink, ChevronDown, Star, Zap } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// ─── Intent Detection ──────────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  Writing:      ['writing', 'write', 'likhna', 'content', 'blog', 'essay', 'copywriting', 'grammar', 'text', 'summarize', 'summarization', 'article', 'email'],
  Coding:       ['coding', 'code', 'programming', 'developer', 'debug', 'github', 'software', 'api', 'javascript', 'python', 'sql', 'code review', 'code assistant'],
  Image:        ['image', 'photo', 'picture', 'generate image', 'art', 'illustration', 'graphic', 'visual', 'midjourney', 'dall-e', 'stable diffusion', 'background removal'],
  Video:        ['video', 'reel', 'clip', 'film', 'animation', 'video editing', 'subtitle', 'youtube', 'shorts'],
  Audio:        ['audio', 'music', 'voice', 'podcast', 'sound', 'speech', 'text to speech', 'tts', 'transcribe', 'transcription'],
  Data:         ['data', 'analytics', 'analysis', 'excel', 'csv', 'database', 'chart', 'visualization', 'spreadsheet', 'insights'],
  Productivity: ['productivity', 'task', 'workflow', 'notes', 'meeting', 'schedule', 'calendar', 'time management', 'organize', 'planner'],
  Marketing:    ['marketing', 'seo', 'ads', 'social media', 'campaign', 'email marketing', 'lead', 'growth', 'branding', 'conversion'],
  Education:    ['education', 'learning', 'study', 'teach', 'tutor', 'quiz', 'flashcard', 'course', 'homework', 'student'],
  Automation:   ['automation', 'automate', 'workflow automation', 'zapier', 'make', 'no-code', 'script', 'trigger'],
  Design:       ['design', 'ui', 'ux', 'figma', 'logo', 'banner', 'canva', 'mockup', 'prototype', 'icon'],
  Finance:      ['finance', 'money', 'invest', 'accounting', 'budget', 'tax', 'financial', 'stock', 'crypto'],
  Legal:        ['legal', 'law', 'contract', 'document', 'compliance', 'terms', 'nda', 'agreement'],
  HR:           ['hr', 'hiring', 'recruit', 'resume', 'job', 'interview', 'employee', 'onboarding', 'talent'],
  Cybersecurity:['cybersecurity', 'security', 'pentest', 'vulnerability', 'firewall', 'threat', 'malware', 'privacy'],
};

const PRICING_KEYWORDS = {
  Free:      ['free', 'free mein', 'bedaam', 'no cost', 'zero cost', 'gratis', 'muft'],
  Paid:      ['paid', 'premium', 'pro version', 'buy', 'purchase', 'subscription'],
  Freemium:  ['freemium', 'free trial', 'trial', 'limited free'],
};

const detectIntent = (q) => {
  const lower = q.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|hola|namaste|sup|yo|hii|heya)\b/.test(lower.trim())) {
    return { type: 'greeting' };
  }

  // Help
  if (/\b(help|kya kar sakte|what can you do|commands)\b/.test(lower)) {
    return { type: 'help' };
  }

  // Named tool lookup — check if query is mostly about a specific tool name
  // We'll do this search server-side instead

  // Detect pricing
  let pricing = null;
  for (const [pricingKey, keywords] of Object.entries(PRICING_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      pricing = pricingKey;
      break;
    }
  }

  // Detect category — check all keywords, pick longest match to avoid false positives
  let category = null;
  let bestMatchLen = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && kw.length > bestMatchLen) {
        category = cat;
        bestMatchLen = kw.length;
      }
    }
  }

  // Extract search term — strip filler words to get the core query
  const coreQuery = lower
    .replace(/\b(best|top|good|acha|acche|suggest|recommend|chahiye|kya|hai|hain|ke liye|for|show me|find|list|de do|bata do|please|karo|kardo|mujhe|give|need|want|looking for|tools?)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return { type: 'search', category, pricing, coreQuery, rawQuery: q };
};

// ─── Fetch tools from backend ─────────────────────────────────────────────────
const fetchTools = async (intent) => {
  try {
    const params = {};

    if (intent.category) params.category = intent.category;
    if (intent.pricing) params.pricing = intent.pricing;
    // Use the core query as search param if there's something meaningful
    if (intent.coreQuery && intent.coreQuery.length > 1) {
      params.search = intent.coreQuery;
    }

    const { data } = await axios.get(`${API}/tools`, { params });

    // Sort: rating desc, clicks desc
    const sorted = [...data].sort((a, b) =>
      (b.rating - a.rating) || (b.clicks - a.clicks)
    );

    return sorted.slice(0, 6);
  } catch {
    return [];
  }
};

// ─── Build response text ──────────────────────────────────────────────────────
const buildResponseText = (intent, tools) => {
  if (intent.type === 'greeting') {
    return "Namaste! 👋 Main hun **AI Tools Hub Assistant**.\n\nMujhse kuch bhi pooch sakte ho:\n- *\"Best free writing tools\"*\n- *\"Image generate karne ka tool\"*\n- *\"Coding assistant suggest karo\"*\n- *\"Marketing ke liye freemium tools\"*\n\nYa neeche quick options try karo! 👇";
  }

  if (intent.type === 'help') {
    return "Main ye sab kar sakta hoon 🚀\n\n**Category search:** *\"coding tools\"*, *\"video editing AI\"*\n**Pricing filter:** *\"free image tools\"*, *\"paid marketing tools\"*\n**Tool info:** *\"ChatGPT ke baare mein batao\"*\n**Combined:** *\"free education tools\"*, *\"best freemium writing AI\"*";
  }

  if (tools.length === 0) {
    return "😕 Koi tool nahi mila is query ke liye.\n\nTry karo:\n- *\"free writing tools\"*\n- *\"image generation AI\"*\n- *\"best coding assistant\"*";
  }

  const parts = [];
  if (intent.category) parts.push(`**${intent.category}**`);
  if (intent.pricing) parts.push(`**${intent.pricing}**`);
  const label = parts.length ? parts.join(' + ') : 'AI';

  if (tools.length === 1) {
    const t = tools[0];
    return `🔍 **${t.name}** ke baare mein:\n\n📌 *${t.tagline}*\n💰 Pricing: **${t.pricing}** · 📂 **${t.category}**\n${t.rating > 0 ? `⭐ Rating: **${t.rating.toFixed(1)}**\n` : ''}\n${t.descriptionShort}`;
  }

  return `✨ Top ${label} tools (${tools.length} results):`;
};

// ─── Tool Card ────────────────────────────────────────────────────────────────
const ToolResultCard = ({ tool, index, onToolClick }) => {
  const logoSrc = (() => {
    try {
      const domain = new URL(tool.link).hostname;
      return `/api/utils/proxy-logo?domain=${domain}&name=${encodeURIComponent(tool.name)}`;
    } catch {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&size=128`;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 bg-slate-900/70 border border-white/5 hover:border-indigo-500/40 rounded-xl p-2.5 cursor-pointer group transition-all hover:bg-slate-800/70"
      onClick={() => onToolClick && onToolClick(tool)}
    >
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden border border-white/5 group-hover:scale-105 transition-transform">
        <img src={logoSrc} alt={tool.name} className="w-full h-full object-contain p-1" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{tool.name}</p>
          {tool.rating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[9px] text-amber-400 font-bold">{tool.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-slate-500 truncate leading-relaxed">{tool.tagline}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
          tool.pricing === 'Free' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
          tool.pricing === 'Freemium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
          'bg-rose-500/15 text-rose-400 border border-rose-500/20'
        }`}>
          {tool.pricing}
        </span>
        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
      </div>
    </motion.div>
  );
};

// ─── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onToolClick }) => {
  const isBot = msg.role === 'bot';

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-indigo-300 not-italic">$1</em>');
      return <p key={i} className="leading-relaxed min-h-[4px]" dangerouslySetInnerHTML={{ __html: formatted || '' }} />;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-indigo-500/30">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={`max-w-[88%] space-y-2 ${!isBot ? 'items-end flex flex-col' : ''}`}>
        {/* Text bubble */}
        <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] ${
          isBot
            ? 'bg-slate-800/90 border border-white/5 text-slate-200 rounded-tl-sm'
            : 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-lg shadow-indigo-500/20'
        }`}>
          <div className="space-y-0.5">{formatText(msg.text)}</div>
        </div>

        {/* Tool Cards */}
        {msg.tools && msg.tools.length > 1 && (
          <div className="w-full space-y-1.5">
            {msg.tools.map((tool, i) => (
              <ToolResultCard key={tool._id} tool={tool} index={i} onToolClick={onToolClick} />
            ))}
          </div>
        )}

        {/* Single tool card (for named tool lookup) */}
        {msg.tools && msg.tools.length === 1 && (
          <div className="w-full">
            <ToolResultCard tool={msg.tools[0]} index={0} onToolClick={onToolClick} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Quick Prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '✍️ Writing tools', query: 'best writing tools' },
  { label: '🆓 Free tools', query: 'free AI tools' },
  { label: '💻 Coding AI', query: 'coding assistant' },
  { label: '🎨 Image AI', query: 'image generation tools' },
  { label: '📈 Marketing', query: 'marketing tools' },
  { label: '🎬 Video AI', query: 'video editing tools' },
];

// ─── Main Chatbot ─────────────────────────────────────────────────────────────
const AIChatbot = ({ onToolClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "Namaste! 👋 Main hun **AI Tools Hub Assistant**.\n\nMujhse kuch bhi pooch sakte ho:\n- *\"Best free writing tools\"*\n- *\"Image generate karne ka tool\"*\n- *\"Coding assistant suggest karo\"*\n\nYa neeche quick options try karo! 👇",
    tools: [],
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toolCount, setToolCount] = useState(0);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch total tool count for header display
  useEffect(() => {
    axios.get(`${API}/tools`)
      .then(res => setToolCount(res.data.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMsg(false);
    }
  }, [isOpen]);

  const sendMessage = async (textOverride) => {
    const query = (textOverride || input).trim();
    if (!query || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query, tools: [] }]);
    setIsTyping(true);

    try {
      const intent = detectIntent(query);

      // Minimum delay for UX
      const [tools] = await Promise.all([
        intent.type === 'greeting' || intent.type === 'help'
          ? Promise.resolve([])
          : fetchTools(intent),
        new Promise(r => setTimeout(r, 500)),
      ]);

      const text = buildResponseText(intent, tools);
      setMessages(prev => [...prev, { role: 'bot', text, tools }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '⚠️ Kuch error aayi. Backend se connect nahi ho paya. Try again!',
        tools: [],
      }]);
    } finally {
      setIsTyping(false);
      if (!isOpen) setHasNewMsg(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const reset = () => {
    setMessages([{
      role: 'bot',
      text: "Chat reset ho gaya! 🔄 Ab koi nayi query pooch lo.",
      tools: [],
    }]);
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <motion.button
        id="ai-chatbot-toggle"
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl shadow-indigo-500/40 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={isOpen ? {} : {
          boxShadow: [
            '0 0 0 0px rgba(99,102,241,0.6)',
            '0 0 0 12px rgba(99,102,241,0)',
            '0 0 0 0px rgba(99,102,241,0)',
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <Bot className="w-6 h-6 text-white" />
              {hasNewMsg && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-purple-800 animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/8"
            style={{ height: '540px', background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(28px)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gradient-to-r from-slate-900/80 to-indigo-950/40 flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white">AI Tools Assistant</p>
                  <Zap className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-500">{toolCount > 0 ? `${toolCount} tools indexed` : 'Connecting...'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all" title="Reset chat">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-all">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} onToolClick={onToolClick} />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2.5 items-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-800/90 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                      {[0, 1, 2].map(idx => (
                        <motion.div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: idx * 0.18 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 border-t border-white/5 flex gap-2 overflow-x-auto flex-shrink-0"
              style={{ scrollbarWidth: 'none' }}>
              {QUICK_PROMPTS.map(({ label, query }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(query)}
                  className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-slate-800/60 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 transition-all whitespace-nowrap"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-white/8 focus-within:border-indigo-500/60 focus-within:bg-slate-800/80 rounded-xl px-3 py-2.5 transition-all">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Koi bhi tool ya category pooch lo..."
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-600 outline-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 active:scale-90"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
