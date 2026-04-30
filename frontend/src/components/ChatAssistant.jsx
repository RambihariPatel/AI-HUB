import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../api/client';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', parts: [{ text: 'Hi! I\'m your AI Assistant. How can I help you find the perfect AI tool today?' }] }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/ai/chat', {
                message,
                history: chatHistory
            });

            const botMessage = { role: 'model', parts: [{ text: response.data.reply }] };
            setChatHistory(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = { 
                role: 'model', 
                parts: [{ text: 'Sorry, I am having trouble connecting. Please make sure the Gemini API key is set up.' }] 
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-blue-400 dark:text-blue-600" />
                            <span className="font-semibold">AI Tool Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`mt-1 p-1 rounded-full ${chat.role === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                                        {chat.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${
                                        chat.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                                    }`}>
                                        {chat.parts[0].text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="mt-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                        <Bot size={14} />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-2 text-sm rounded-tl-none">
                                        <Loader2 size={14} className="animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask about AI tools..."
                                className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !message.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-90 ${
                    isOpen 
                        ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-800 rotate-90' 
                        : 'bg-blue-600 text-white'
                }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-zinc-900"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;
