import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaMagic, FaHeart, FaBook, FaLightbulb, FaChalkboardTeacher, FaPlus, FaFont, FaSquare, FaCircle } from "react-icons/fa";

const AIHelper = ({ projectType, setProjectType, canvas, selectedItem, addText, addRect, addEllipse }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "👋 Hello! I'm your AI Design Agent. I don't just advise—I can **take actions** for you!\n\n🎯 What are you designing today?",
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

    // Ask about project type when opened for the first time
    useEffect(() => {
        if (isOpen && !projectType && messages.length === 1) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Choose your project type below, and I'll help you create it! 👇",
                    actions: [
                        { label: '🎨 Create Logo', onClick: () => selectProjectType('logo') },
                        { label: '📄 Create Poster', onClick: () => selectProjectType('poster') },
                        { label: '📱 Social Media', onClick: () => selectProjectType('social') },
                        { label: '🎪 Create Banner', onClick: () => selectProjectType('banner') }
                    ]
                }]);
            }, 500);
        }
    }, [isOpen, projectType, messages.length]);

    // Initialize Gemini Nano
    useEffect(() => {
        const initAI = async () => {
            if ('ai' in window && 'languageModel' in window.ai) {
                try {
                    const session = await window.ai.languageModel.create({
                        systemPrompt: `You are an AI design agent that can take actions, not just give advice. You can:
- Add shapes, text, and elements to the canvas
- Modify sizes, colors, and positions
- Create layouts automatically
- Apply design principles programmatically
Provide specific, actionable guidance and offer to execute changes directly.`
                    });
                    setAiSession(session);
                    console.log('✅ Gemini Nano AI Agent initialized');
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
                    {
                        role: "assistant",
                        content: "⚠️ API key not configured. But I can still help with quick actions!",
                        actions: [
                            { label: '➕ Add Title Text', onClick: () => executeAction('addText') },
                            { label: '🟦 Add Rectangle', onClick: () => executeAction('addRect') },
                            { label: '⭕ Add Circle', onClick: () => executeAction('addCircle') }
                        ]
                    },
                ]);
                setIsTyping(false);
            }, 1000);
            return;
        }

        try {
            let aiContent = "";
            let suggestedActions = [];

            // Try Gemini Nano first
            if (aiSession) {
                try {
                    const contextPrompt = projectType
                        ? `User is creating a ${projectType}. ${input}`
                        : input;
                    aiContent = await aiSession.prompt(contextPrompt);
                    console.log('✅ Used Gemini Nano');
                } catch (nanoErr) {
                    console.log('⚠️ Nano failed, falling back to OpenRouter');
                    setAiSession(null);
                }
            }

            // Fallback to OpenRouter
            if (!aiContent) {
                const systemPrompt = `You are an AI design agent, not just a chatbot. You can execute actions.
${projectType ? `The user is working on a ${projectType}.` : ''}

When users ask for help:
1. Provide brief, actionable advice
2. Suggest specific actions you can take for them
3. Keep responses concise (2-3 sentences max)

Example responses:
User: "I need a title"
You: "I'll add a professional title text for you! For ${projectType || 'your design'}, I recommend 48px bold text. Would you like me to create it?"

User: "Add some shapes"
You: "I can add rectangles, circles, or custom shapes. What suits your ${projectType || 'design'} best?"`;

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.href,
                        "X-Title": "ViDo",
                    },
                    body: JSON.stringify({
                        "model": "google/gemini-2.0-flash-001",
                        "messages": [
                            {
                                "role": "system",
                                "content": systemPrompt
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
                aiContent = data.choices[0]?.message?.content || "I apologize, but I encountered an error. Let me help with quick actions instead.";
            }

            // Parse user intent and suggest actions
            const lowerInput = input.toLowerCase();
            const actions = [];

            if (lowerInput.includes('text') || lowerInput.includes('title') || lowerInput.includes('heading')) {
                actions.push({ label: '➕ Add Title Text', onClick: () => executeAction('addText') });
            }
            if (lowerInput.includes('shape') || lowerInput.includes('rectangle') || lowerInput.includes('box')) {
                actions.push({ label: '🟦 Add Rectangle', onClick: () => executeAction('addRect') });
            }
            if (lowerInput.includes('circle') || lowerInput.includes('round')) {
                actions.push({ label: '⭕ Add Circle', onClick: () => executeAction('addCircle') });
            }
            if (lowerInput.includes('optimize') || lowerInput.includes('fix')) {
                actions.push({ label: '✨ Optimize Selected', onClick: () => executeAction('optimize') });
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: aiContent,
                    actions: actions.length > 0 ? actions : undefined
                },
            ]);
        } catch (err) {
            console.error("AI Error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "⚠️ Connection error. But I can still help with quick actions!",
                    actions: [
                        { label: '➕ Add Text', onClick: () => executeAction('addText') },
                        { label: '🟦 Add Shape', onClick: () => executeAction('addRect') }
                    ]
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    // Execute agent actions
    const executeAction = (action) => {
        if (!canvas) {
            alert('Canvas not ready!');
            return;
        }

        switch (action) {
            case 'addText':
                if (addText) {
                    addText();
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "✅ Title text added! Double-click to edit the text."
                    }]);
                }
                break;

            case 'addRect':
                if (addRect) {
                    addRect();
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "✅ Rectangle added! Resize and style it from the right panel."
                    }]);
                }
                break;

            case 'addCircle':
                if (addEllipse) {
                    addEllipse();
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "✅ Circle added! Customize its color and size."
                    }]);
                }
                break;

            case 'optimize':
                if (selectedItem) {
                    // Center the selected item
                    selectedItem.center();
                    canvas.requestRenderAll();
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "✅ Element centered on canvas!"
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "ℹ️ Please select an element first to optimize it."
                    }]);
                }
                break;

            default:
                break;
        }
    };

    // Project type selection
    const selectProjectType = (type) => {
        setProjectType(type);
        const recommendations = {
            logo: {
                content: "🎨 **Logo Mode Activated!**\n\n✅ **Setup:**\n• Canvas: 500x500px\n• Colors: 2-3 maximum\n• Style: Simple & memorable\n\n💡 **Quick Start:**",
                actions: [
                    { label: '➕ Add Logo Text', onClick: () => executeAction('addText') },
                    { label: '🟦 Add Shape', onClick: () => executeAction('addRect') },
                    { label: '⭕ Add Circle', onClick: () => executeAction('addCircle') }
                ]
            },
            poster: {
                content: "📄 **Poster Mode Activated!**\n\n✅ **Setup:**\n• Size: A4 (2480x3508px)\n• Title: Bold & large\n• Layout: Clear hierarchy\n\n💡 **Quick Start:**",
                actions: [
                    { label: '➕ Add Main Title', onClick: () => executeAction('addText') },
                    { label: '🟦 Add Background', onClick: () => executeAction('addRect') }
                ]
            },
            social: {
                content: "📱 **Social Media Mode Activated!**\n\n✅ **Setup:**\n• Instagram: 1080x1080px\n• Colors: Vibrant\n• Text: Large & readable\n\n💡 **Quick Start:**",
                actions: [
                    { label: '➕ Add Caption Text', onClick: () => executeAction('addText') },
                    { label: '🎨 Add Accent Shape', onClick: () => executeAction('addCircle') }
                ]
            },
            banner: {
                content: "🎪 **Banner Mode Activated!**\n\n✅ **Setup:**\n• Web: 1200x400px\n• Layout: Horizontal focus\n• CTA: Bold & centered\n\n💡 **Quick Start:**",
                actions: [
                    { label: '➕ Add Banner Text', onClick: () => executeAction('addText') },
                    { label: '🟦 Add CTA Button', onClick: () => executeAction('addRect') }
                ]
            }
        };

        const rec = recommendations[type] || {
            content: `Great! Let me help you create an amazing ${type}.`,
            actions: [
                { label: '➕ Add Text', onClick: () => executeAction('addText') },
                { label: '🟦 Add Shape', onClick: () => executeAction('addRect') }
            ]
        };

        setMessages((prev) => [
            ...prev,
            { role: "user", content: `I want to create a ${type}` },
            { role: "assistant", content: rec.content, actions: rec.actions }
        ]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative w-16 h-16 rounded-full shadow-2xl shadow-gray-400/50 flex items-center justify-center overflow-hidden hover:scale-110 transition-all duration-300 group border-4 border-white"
                >
                    <img src="/vido-logo.png" alt="ViDo AI" className="w-full h-full object-cover" />
                </button>
            )}

            {isOpen && (
                <div className="w-[550px] h-[750px] bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-2xl shadow-[#013232]/30 border-2 border-teal-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#013232] to-[#025555] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40 shadow-lg">
                                <FaRobot size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">AI Design Agent</h3>
                                <div className="flex items-center gap-1.5 text-[11px] text-yellow-100">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    Can Take Actions • Not Just Chat
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-red-500/30 p-2 rounded-full transition-all duration-200 w-9 h-9 flex items-center justify-center hover:rotate-90"
                            title="Close"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-teal-50/50 to-white space-y-3 scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-teal-50">
                        {messages.map((msg, idx) => (
                            <div key={idx}>
                                <div
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-md whitespace-pre-line ${msg.role === "user"
                                            ? "bg-gradient-to-br from-[#013232] to-[#025555] text-white rounded-br-none"
                                            : "bg-white text-slate-700 border border-teal-200 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 ml-2 mb-2">
                                        {msg.actions.map((action, actionIdx) => (
                                            <button
                                                key={actionIdx}
                                                onClick={action.onClick}
                                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#013232] text-xs font-bold rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-teal-200 p-4 rounded-2xl rounded-bl-none shadow-md flex gap-1.5">
                                    <span className="w-2.5 h-2.5 bg-[#013232] rounded-full animate-bounce"></span>
                                    <span className="w-2.5 h-2.5 bg-[#013232] rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2.5 h-2.5 bg-[#013232] rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t-2 border-teal-200">
                        {projectType && (
                            <div className="mb-2 px-3 py-2 bg-gradient-to-r from-teal-100 to-yellow-100 rounded-full text-xs font-bold text-[#013232] flex items-center justify-between">
                                <span>🎯 Project: {projectType.charAt(0).toUpperCase() + projectType.slice(1)}</span>
                                <button
                                    onClick={() => setProjectType(null)}
                                    className="text-[#013232] hover:text-teal-700 ml-2"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        )}

                        {/* Quick Actions */}
                        {!projectType && (
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
                                <ActionChip icon="➕" text="Add Text" onClick={() => executeAction('addText')} />
                                <ActionChip icon="🟦" text="Add Shape" onClick={() => executeAction('addRect')} />
                                <ActionChip icon="⭕" text="Add Circle" onClick={() => executeAction('addCircle')} />
                            </div>
                        )}

                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Tell me what to create..."
                                className="w-full bg-gradient-to-r from-teal-50 to-yellow-50 text-slate-800 rounded-full pl-4 pr-12 py-3 text-sm font-medium placeholder:text-teal-400 focus:outline-none focus:ring-2 focus:ring-[#013232] transition-all border border-teal-200"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 p-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#013232] rounded-full hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform active:scale-95"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionChip = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="whitespace-nowrap px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 text-[11px] font-bold rounded-full border-2 border-purple-300 transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md transform hover:scale-105"
    >
        <span>{icon}</span>
        {text}
    </button>
);

export default AIHelper;
