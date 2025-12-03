import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaImage, FaIcons, FaDownload, FaSpinner, FaLink, FaMagic, FaPalette, FaPinterest, FaExternalLinkAlt, FaCamera } from 'react-icons/fa';
import * as fabric from 'fabric';

const ImageIconSearch = ({ isOpen, onClose, onAddToCanvas }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('design'); // 'design', 'photos', 'icons', 'ai'
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [directUrl, setDirectUrl] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const inputRef = useRef(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
            if (results.length === 0) handleSearch('creative design');
        }
    }, [isOpen]);

    const checkSpelling = async (query) => {
        try {
            const response = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                // If the top result is different from query (case-insensitive), suggest it
                if (data[0].word.toLowerCase() !== query.toLowerCase()) {
                    setSuggestion(data[0].word);
                } else {
                    setSuggestion('');
                }
            }
        } catch (error) {
            console.error("Spell check failed:", error);
        }
    };

    const searchLexica = async (query) => {
        // Fallback to Pollinations since Lexica might have CORS issues in browser
        return searchPollinations(query, 'digital art, detailed, 8k, trending on artstation');
    };

    const searchPollinations = async (query, style = '') => {
        const basePrompt = style ? `${query}, ${style}` : query;
        // Simplified URL for better caching and speed
        return Array.from({ length: 12 }, (_, i) => ({
            id: `pollinations-${Date.now()}-${i}`,
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent(basePrompt)}?width=400&height=400&nologo=true&seed=${i}`,
            fullUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(basePrompt)}?width=1024&height=1024&nologo=true&seed=${i}`,
            author: 'AI Generated',
            type: 'image'
        }));
    };

    const searchIcons = async (query) => {
        const iconSets = ['mdi', 'fa', 'bi', 'heroicons', 'noto', 'twemoji', 'fluent', 'ri', 'ph'];
        return iconSets.map((set, i) => ({
            id: `icon-${i}`,
            url: `https://api.iconify.design/${set}:${query}.svg?height=100`,
            fullUrl: `https://api.iconify.design/${set}:${query}.svg?height=300`,
            author: set,
            type: 'icon'
        }));
    };

    const handleSearch = async (overrideQuery) => {
        const query = overrideQuery || searchQuery;
        if (!query.trim()) return;

        setIsLoading(true);
        setResults([]);
        setSuggestion('');

        // Check spelling in background
        checkSpelling(query);

        try {
            let newResults = [];

            if (activeTab === 'design') {
                // Prioritize "Pinterest" aesthetic - mix of photo and high-end design, avoiding "cartoons"
                newResults = await searchPollinations(query, 'aesthetic, trending on pinterest, high quality, 8k, photography');
            } else if (activeTab === 'ai') {
                // Use Lexica for AI Art specifically
                newResults = await searchLexica(query);
                if (newResults.length === 0) {
                    newResults = await searchPollinations(query, 'digital art, masterpiece, detailed, fantasy');
                }
            } else if (activeTab === 'photos') {
                newResults = await searchPollinations(query, 'raw photo, realistic, cinematic lighting, 8k, high resolution, photography');
            } else if (activeTab === 'icons') {
                newResults = await searchIcons(query);
            }

            setResults(newResults);
        } catch (error) {
            console.error("Search error:", error);
            setResults(await searchPollinations(query, 'aesthetic, high quality'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCanvas = async (item) => {
        if (onAddToCanvas) {
            try {
                setIsLoading(true);
                await onAddToCanvas(item.fullUrl);
                onClose();
            } catch (error) {
                console.error(error);
                alert('Failed to load image. It might be a CORS issue or the image is unavailable.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const openPinterest = () => {
        if (searchQuery) {
            window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center animate-in fade-in duration-200 font-sans">
            <div className="bg-white rounded-[32px] shadow-2xl w-[1200px] h-[85vh] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-white px-8 pt-6 pb-2 z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search for inspiration..."
                                className="w-full pl-12 pr-12 py-3.5 bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 border-none rounded-full text-gray-900 text-base font-medium placeholder-gray-500 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => onClose()}
                            className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Spell Check Suggestion */}
                    {suggestion && (
                        <div className="mb-4 px-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Did you mean:</span>
                            <button
                                onClick={() => {
                                    setSearchQuery(suggestion);
                                    handleSearch(suggestion);
                                }}
                                className="text-red-600 font-bold hover:underline"
                            >
                                {suggestion}
                            </button>
                        </div>
                    )}

                    {/* Tabs & External Links */}
                    <div className="flex items-center justify-between pb-2">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <TabButton active={activeTab === 'design'} onClick={() => setActiveTab('design')} label="All" />
                            <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Art" />
                            <TabButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} label="Photos" />
                            <TabButton active={activeTab === 'icons'} onClick={() => setActiveTab('icons')} label="Icons" />
                        </div>

                        <button
                            onClick={openPinterest}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors font-semibold text-sm"
                        >
                            <FaPinterest className="text-red-600" size={16} />
                            <span className="hidden sm:inline">Pinterest</span>
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <FaSpinner className="animate-spin text-gray-400 mb-4" size={32} />
                            <p className="text-gray-500 font-medium">Finding ideas...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className={`
                            ${activeTab === 'icons' ? 'grid grid-cols-6 gap-4' : 'columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'}
                        `}>
                            {results.map((item) => (
                                <div
                                    key={item.id}
                                    className="break-inside-avoid group relative rounded-2xl overflow-hidden cursor-zoom-in mb-4"
                                    onClick={() => handleAddToCanvas(item)}
                                >
                                    <div className={`
                                        ${activeTab === 'icons' ? 'p-6 flex items-center justify-center aspect-square bg-gray-50 rounded-2xl' : ''}
                                    `}>
                                        <img
                                            src={item.url}
                                            alt={item.author}
                                            className={`w-full h-auto object-cover ${activeTab === 'icons' ? 'w-12 h-12' : 'rounded-2xl'}`}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/400x300?text=Image+Error';
                                                e.target.parentElement.classList.add('bg-gray-100');
                                            }}
                                        />
                                    </div>

                                    {/* Hover Overlay - Pinterest Style */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                                        <div className="flex justify-end">
                                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm transform translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-200">
                                                Save
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 transform translate-y-[10px] group-hover:translate-y-0 transition-transform duration-200">
                                            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                                                <FaExternalLinkAlt size={10} className="text-gray-900" />
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                                                <FaLink size={10} className="text-gray-900" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <FaSearch size={48} className="mb-4 opacity-10" />
                            <p className="text-lg font-medium text-gray-500">No results found</p>
                        </div>
                    )}
                </div>

                {/* Direct Link Footer - Minimalist */}
                <div className="bg-white border-t border-gray-100 p-4 flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full w-full max-w-2xl">
                        <FaLink className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Paste image URL..."
                            value={directUrl}
                            onChange={(e) => setDirectUrl(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-600 placeholder-gray-400"
                        />
                        <button
                            onClick={() => handleAddToCanvas({ fullUrl: directUrl })}
                            disabled={!directUrl}
                            className="text-gray-900 font-bold text-sm hover:underline disabled:opacity-30"
                        >
                            Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`
            px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all
            ${active
                ? 'bg-black text-white'
                : 'bg-transparent text-gray-900 hover:bg-gray-100'
            }
        `}
    >
        {label}
    </button>
);

export default ImageIconSearch;
