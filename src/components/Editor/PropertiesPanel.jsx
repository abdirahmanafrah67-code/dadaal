import React from "react";
import {
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaBold,
    FaItalic,
    FaLock,
    FaLockOpen,
    FaEye,
    FaEyeSlash,
    FaTrash,
    FaCopy,
    FaLayerGroup,
    FaArrowsAltH,
    FaArrowsAltV,
    FaCube,
    FaMagic,
} from "react-icons/fa";

const PropertiesPanel = ({
    selectedItem,
    // Transform
    posX, setPosX,
    posY, setPosY,
    width, setWidth,
    height, setHeight,
    rotation, setRotation,
    // Appearance
    opacity, setOpacity,
    fill, setFill,
    stroke, setStroke,
    strokeW, setStrokeW,
    cornerRadius, setCornerRadius,
    // Text
    textContent, setTextContent,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    fontWeight, setFontWeight,
    textAlign, setTextAlign,
    // Actions
    centerOnCanvas,
    bringToFront,
    sendToBack,
    flipHorizontal,
    flipVertical,
    toggleLock,
    toggleVisibility,
    duplicate,
    onRemoveBackground,
    isProcessing, // New prop
}) => {
    if (!selectedItem) {
        return (
            <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <p className="text-xs font-medium">No selection</p>
            </div>
        );
    }

    const isText = ['i-text', 'text', 'textbox'].includes(selectedItem.type);
    const isImage = selectedItem.type === 'image';

    return (
        <div className="flex-1 overflow-y-auto p-4 font-sans scrollbar-thin scrollbar-thumb-gray-200">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {selectedItem.data?.label || selectedItem.className || "Object"}
                </span>
                <div className="flex gap-1">
                    <IconButton onClick={toggleLock} icon={selectedItem.locked ? <FaLock size={10} /> : <FaLockOpen size={10} />} />
                    <IconButton onClick={toggleVisibility} icon={selectedItem.visible ? <FaEye size={10} /> : <FaEyeSlash size={10} />} />
                    <IconButton onClick={duplicate} icon={<FaCopy size={10} />} />
                    <IconButton onClick={() => selectedItem.remove()} icon={<FaTrash size={10} />} danger />
                </div>
            </div>

            {/* Layout Section */}
            <Section title="Layout">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <InputGroup label="X" value={posX} onChange={setPosX} />
                    <InputGroup label="Y" value={posY} onChange={setPosY} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <InputGroup label="W" value={width} onChange={setWidth} />
                    <InputGroup label="H" value={height} onChange={setHeight} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <InputGroup label="R" value={rotation} onChange={setRotation} icon="°" />
                    {!isText && !isImage && (
                        <InputGroup label="Cr" value={cornerRadius} onChange={setCornerRadius} />
                    )}
                </div>
            </Section>

            <Divider />

            {/* Layer Section */}
            <Section title="Layer">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500">Opacity</label>
                    <span className="text-xs text-slate-800">{opacity}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
                <div className="flex gap-2 mt-3">
                    <ActionIcon onClick={bringToFront} icon={<FaLayerGroup />} tooltip="Bring to Front" />
                    <ActionIcon onClick={centerOnCanvas} icon={<FaAlignCenter />} tooltip="Center" />
                    <ActionIcon onClick={flipHorizontal} icon={<FaArrowsAltH />} tooltip="Flip H" />
                    <ActionIcon onClick={flipVertical} icon={<FaArrowsAltV />} tooltip="Flip V" />
                </div>
            </Section>

            <Divider />

            {/* Image Actions */}
            {isImage && (
                <>
                    <Section title="Image Actions">
                        <button
                            onClick={onRemoveBackground}
                            disabled={isProcessing}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all
                                ${isProcessing
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                                }`}
                        >
                            <FaMagic className={isProcessing ? "animate-spin" : ""} />
                            {isProcessing ? "Removing..." : "Remove Background"}
                        </button>
                    </Section>
                    <Divider />
                </>
            )}

            {/* Fill & Stroke */}
            {!isImage && (
                <>
                    <Section title="Fill">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded border border-gray-200 overflow-hidden relative">
                                <input
                                    type="color"
                                    value={fill}
                                    onChange={(e) => setFill(e.target.value)}
                                    className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0"
                                />
                            </div>
                            <input
                                type="text"
                                value={fill}
                                onChange={(e) => setFill(e.target.value)}
                                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 text-slate-700 uppercase font-mono focus:border-blue-500 outline-none"
                            />
                        </div>
                    </Section>

                    {!isText && (
                        <Section title="Stroke">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded border border-gray-200 overflow-hidden relative">
                                    <input
                                        type="color"
                                        value={stroke}
                                        onChange={(e) => setStroke(e.target.value)}
                                        className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={stroke}
                                    onChange={(e) => setStroke(e.target.value)}
                                    className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 text-slate-700 uppercase font-mono focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-6">Width</span>
                                <input
                                    type="number"
                                    value={strokeW}
                                    onChange={(e) => setStrokeW(Number(e.target.value))}
                                    className="w-16 text-xs border border-gray-200 rounded px-2 py-1 text-slate-700 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </Section>
                    )}
                    <Divider />
                </>
            )}

            {/* Typography */}
            {isText && (
                <Section title="Typography">
                    <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded p-1.5 mb-2 text-slate-700 focus:border-blue-500 outline-none bg-white"
                    >
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Georgia, serif">Georgia</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <select
                            value={fontWeight}
                            onChange={(e) => setFontWeight(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded p-1.5 text-slate-700 focus:border-blue-500 outline-none bg-white"
                        >
                            <option value="400">Regular</option>
                            <option value="600">SemiBold</option>
                            <option value="700">Bold</option>
                        </select>
                        <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full text-xs border border-gray-200 rounded p-1.5 text-slate-700 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-1 bg-gray-50 p-1 rounded border border-gray-100 mb-2">
                        <StyleButton active={textAlign === "left"} onClick={() => setTextAlign("left")} icon={<FaAlignLeft />} />
                        <StyleButton active={textAlign === "center"} onClick={() => setTextAlign("center")} icon={<FaAlignCenter />} />
                        <StyleButton active={textAlign === "right"} onClick={() => setTextAlign("right")} icon={<FaAlignRight />} />
                    </div>
                    <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded p-2 focus:border-blue-500 outline-none resize-none text-slate-700"
                        rows={3}
                    />
                </Section>
            )}
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
        {children}
    </div>
);

const Divider = () => <div className="h-px bg-gray-100 my-4" />;

const InputGroup = ({ label, value, onChange, icon }) => (
    <div className="flex items-center gap-2 group">
        <label className="text-[10px] text-gray-400 w-3 font-medium">{label}</label>
        <div className="relative flex-1">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 px-1 py-1 text-xs text-slate-700 outline-none transition-colors text-right"
            />
            {icon && <span className="absolute right-0 top-1 text-[10px] text-gray-300 pointer-events-none opacity-0 group-hover:opacity-100">{icon}</span>}
        </div>
    </div>
);

const IconButton = ({ icon, onClick, danger }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${danger ? "text-red-400 hover:bg-red-50" : "text-gray-500 hover:text-slate-800"}`}
    >
        {icon}
    </button>
);

const ActionIcon = ({ icon, onClick, tooltip }) => (
    <button
        onClick={onClick}
        title={tooltip}
        className="p-1.5 rounded border border-gray-200 text-gray-500 hover:text-slate-800 hover:border-gray-300 transition-colors"
    >
        {icon}
    </button>
);

const StyleButton = ({ icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 p-1 rounded flex items-center justify-center text-xs transition-all ${active ? "bg-white text-slate-800 shadow-sm" : "text-gray-400 hover:text-slate-600"}`}
    >
        {icon}
    </button>
);

export default PropertiesPanel;
