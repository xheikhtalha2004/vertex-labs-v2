'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_REPLIES = [
    { label: 'Services Overview', message: 'What services do you offer?' },
    { label: 'Pricing & Timeline', message: 'How much does it cost and how long does it take?' },
    { label: 'Portfolio Examples', message: 'Can you show me some example projects?' },
    { label: 'Get Started', message: 'How do I get started with a project?' },
];

const AIConsultant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "👋 Hi! I'm the Vertex Engineering Architect. I can help you understand our CAD, CFD, FEA, and prototyping services. What brings you here today?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(true);
    const [showHandoff, setShowHandoff] = useState(false);
    const [userInfo, setUserInfo] = useState({ name: '', email: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const lastUserMessage = messages.filter((m) => m.role === 'user').slice(-1)[0];
        if (!lastUserMessage) return;

        const content = lastUserMessage.content.toLowerCase();
        const wantsContact =
            content.includes('whatsapp') ||
            content.includes('contact') ||
            content.includes('talk') ||
            content.includes('call') ||
            content.includes('reach out') ||
            content.includes('get in touch');

        if (wantsContact) setShowHandoff(true);
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: textToSend };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setShowQuickReplies(false);

        try {
            const { sendChatMessage } = await import('../../lib/chatService');
            const response = await sendChatMessage(textToSend, messages);
            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: error instanceof Error
                        ? error.message
                        : 'Connection error. Please check your API key configuration.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsAppHandoff = () => {
        const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923135229867';
        const userName = userInfo.name || '';
        const userEmail = userInfo.email || '';

        let message = 'Hi! I am interested in your engineering services';
        if (userName && userEmail) message += `.\n\nName: ${userName}\nEmail: ${userEmail}`;
        else if (userName) message += `.\n\nName: ${userName}`;
        else if (userEmail) message += `.\n\nEmail: ${userEmail}`;

        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[998] w-14 h-14 sm:w-16 sm:h-16 bg-[#4F6DF5] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(79,109,245,0.45)] border border-white/10 hover:scale-105 transition-transform duration-300"
                aria-label="Toggle AI Assistant"
            >
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    )}
                </svg>
            </button>

            {isOpen && (
                <div className="fixed right-3 left-3 sm:left-auto sm:right-6 bottom-20 sm:bottom-24 z-[997] sm:w-[420px] max-h-[calc(100vh-7rem)] flex flex-col rounded-2xl border border-white/10 bg-[#0D0F15]/95 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r from-[#9AA8FF] to-[#7B8FF7] text-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-white font-bold">V</span>
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">Vertex AI</div>
                                <div className="text-[11px] opacity-90 truncate">Engineering Architect</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '923135229867';
                                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi! I am interested in your engineering services')}`, '_blank');
                                }}
                                className="px-2.5 py-1 text-[11px] rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1"
                                title="Chat on WhatsApp"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-white/15 transition-colors"
                                aria-label="Close chat"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#4F6DF5] text-white'
                                        : 'bg-[#121521] border border-white/10 text-[#D7DBE7]'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#121521] border border-white/10 text-gray-300 px-3 py-2 rounded-2xl">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-[#4F6DF5] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showQuickReplies && messages.length === 1 && (
                            <div className="grid grid-cols-2 gap-2">
                                {QUICK_REPLIES.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(reply.message)}
                                        className="px-3 py-2 text-xs rounded-full bg-[#111420] border border-white/10 text-[#C7CBD6] hover:bg-[#4F6DF5] hover:text-white hover:border-[#4F6DF5] transition-all"
                                    >
                                        {reply.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showHandoff && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl space-y-2">
                                <div className="text-xs text-green-300 font-semibold">Connect on WhatsApp</div>
                                <input
                                    type="text"
                                    placeholder="Your name (optional)"
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Your email (optional)"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 text-xs bg-[#0B0E14] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    onClick={handleWhatsAppHandoff}
                                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    Continue on WhatsApp
                                </button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="px-4 py-3 border-t border-white/10 bg-[#0B0E14] rounded-b-2xl"
                    >
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type message..."
                                className="flex-1 px-3 py-2 text-sm bg-[#111420] border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#4F6DF5]"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 rounded-full bg-[#4F6DF5] hover:bg-[#7B8FF7] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIConsultant;
