import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaMagic, FaHeart, FaBook, FaLightbulb } from "react-icons/fa";

const AIHelper = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Soo dhowow! Waxaan ahay macalinka Dadaal AI. 📚 Maanta waxaan ku baran doonnaa naqshadeynta (design). Sidee baan kuu caawin karaa?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [aiSession, setAiSession] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initialize Gemini Nano
    useEffect(() => {
        const initAI = async () => {
            if ('ai' in window && 'languageModel' in window.ai) {
                try {
                    const session = await window.ai.languageModel.create({
                        systemPrompt: "You are Dadaal AI, a design teacher assistant. You teach graphic design concepts in Somali language. Give assignments, explain design principles (color theory, typography, layout), and help students learn. Be encouraging and educational. Use emojis occasionally."
                    });
                    setAiSession(session);
                    console.log('✅ Gemini Nano initialized');
                } catch (err) {
                    console.log('⚠️ Gemini Nano not available, using OpenRouter');
                }
            }
        };
        initAI();
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

        if (!apiKey || apiKey === "your_api_key_here") {
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Fadlan geli furahaaga API-ga (API Key) faylka .env si aan kuugu jawaabo." },
                ]);
                setIsTyping(false);
            }, 1000);
            return;
        }

        try {
            let aiContent = "";

            // Try Gemini Nano first
            if (aiSession) {
                try {
                    aiContent = await aiSession.prompt(input);
                    console.log('✅ Used Gemini Nano');
                } catch (nanoErr) {
                    console.log('⚠️ Nano failed, falling back to OpenRouter');
                    setAiSession(null);
                }
            }

            // Fallback to OpenRouter
            if (!aiContent) {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.href,
                        "X-Title": "Dadaal Studio",
                    },
                    body: JSON.stringify({
                        "model": "google/gemini-2.0-flash-001",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are Dadaal AI, a design teacher for students learning graphic design. You MUST answer in Somali language only. Teach design concepts (color theory, typography, composition, spacing). Give creative assignments. Explain poster sizes (A4: 210x297mm, Instagram: 1080x1080px, etc). Be encouraging and educational. Use emojis occasionally."
                            },
                            ...messages.map(m => ({ role: m.role, content: m.content })),
                            { "role": "user", "content": input }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                aiContent = data.choices[0]?.message?.content || "Waan ka xumahay, cilad ayaa dhacday.";
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: aiContent },
            ]);
        } catch (err) {
            console.error("AI Error:", err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Waan ka xumahay, cilad ayaa ku timid xiriirka." },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    // Quick assignment suggestions
    const giveAssignment = (type) => {
        const assignments = {
            poster: "📝 **Hawsha Maanta:**\n\nSamee poster ku saabsan 'Biyo Badbaadinta'\n\n**Shuruudaha:**\n• Cabbirka: 800x1000 pixels\n• Midabyo: Buluug iyo caddaan\n• Qoraal: Cinwaan weyn + 3 qodob\n• Sawir: Mid ama laba\n\n**Waqtiga:** 30 daqiiqo\n\nBillow hadda! 🎨",
            logo: "📝 **Hawsha Maanta:**\n\nSamee logo shirkad cusub\n\n**Shuruudaha:**\n• Cabbirka: 500x500 pixels\n• Midabyo: 2-3 kaliya\n• Fudud oo la xasuusan karo\n• Magaca shirkadda: 'Dadaal Tech'\n\n**Waqtiga:** 20 daqiiqo\n\nBillow hadda! 💡",
            social: "📝 **Hawsha Maanta:**\n\nSamee social media post\n\n**Shuruudaha:**\n• Cabbirka: 1080x1080 pixels (Instagram)\n• Mawduuca: Cunto caafimaad leh\n• Qoraal: Gaaban oo soo jiidanaya\n• Midabyo: Dhalaalaya\n\n**Waqtiga:** 25 daqiiqo\n\nBillow hadda! 📱"
        };

        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assignments[type] }
        ]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-300 flex items-center justify-center text-white hover:scale-110 transition-transform group border-4 border-white"
                >
                    <FaBook size={28} className="group-hover:animate-bounce" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </button>
            )}

            {isOpen && (
                <div className="w-[550px] h-[750px] bg-white rounded-3xl shadow-2xl shadow-purple-900/20 border-2 border-purple-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                                <FaBook size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Macalinka Dadaal AI</h3>
                                <div className="flex items-center gap-1 text-[10px] text-purple-100">
                                    <FaHeart size={8} className="text-purple-200" />
                                    Baro Naqshadeynta
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-red-500/20 p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center"
                            title="Xir"
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-purple-50/30 space-y-3 scrollbar-thin scrollbar-thumb-purple-200">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm whitespace-pre-line ${msg.role === "user"
                                        ? "bg-purple-500 text-white rounded-br-none"
                                        : "bg-white text-slate-600 border border-purple-100 rounded-bl-none"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-purple-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5">
                                    <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-purple-100">
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
                            <AssignmentChip text="Hawsha Poster" onClick={() => giveAssignment('poster')} />
                            <AssignmentChip text="Hawsha Logo" onClick={() => giveAssignment('logo')} />
                            <AssignmentChip text="Social Media" onClick={() => giveAssignment('social')} />
                        </div>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Wax i weydii macalinka..."
                                className="w-full bg-purple-50 text-slate-700 rounded-full pl-4 pr-12 py-2.5 text-sm font-medium placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-500 transition-colors shadow-sm transform active:scale-95"
                            >
                                <FaPaperPlane size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AssignmentChip = ({ text, onClick }) => (
    <button
        onClick={onClick}
        className="whitespace-nowrap px-3 py-1 bg-purple-50 text-purple-500 text-[10px] font-bold rounded-full border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
    >
        <FaLightbulb size={8} /> {text}
    </button>
);

export default AIHelper;
