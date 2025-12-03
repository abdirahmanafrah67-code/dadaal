import React from 'react';
import { createPortal } from 'react-dom';
import { FaPalette, FaTrash, FaCopy, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { MdFlip, MdTexture } from 'react-icons/md';

const ContextToolbar = ({ position, onClose, onColorChange, onDuplicate, onDelete, onSendToBack, onBringToFront, showRadius, cornerRadius, onCornerRadiusChange, onTogglePattern, isText, fontFamily, fontWeight, fontSize, onFontFamilyChange, onFontWeightChange, onFontSizeChange }) => {
    if (!position) return null;

    return createPortal(
        <div
            className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex items-center gap-2 animate-in fade-in zoom-in duration-200"
            style={{
                left: position.x,
                top: position.y - 80, // Position higher to accommodate extra controls
                transform: 'translateX(-50%)'
            }}
        >
            <button
                onClick={() => document.getElementById('context-color-picker').click()}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors relative"
                title="Change Color"
            >
                <FaPalette />
                <input
                    id="context-color-picker"
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => onColorChange(e.target.value)}
                />
            </button>

            <button onClick={onTogglePattern} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors" title="Toggle Pattern">
                <MdTexture />
            </button>

            {isText && (
                <>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <select
                        value={fontFamily}
                        onChange={(e) => onFontFamilyChange(e.target.value)}
                        className="w-24 text-xs p-1 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        title="Font Family"
                    >
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Poppins, sans-serif">Poppins</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Lato, sans-serif">Lato</option>
                        <option value="Playfair Display, serif">Playfair</option>
                    </select>

                    <select
                        value={fontWeight}
                        onChange={(e) => onFontWeightChange(e.target.value)}
                        className="w-20 text-xs p-1 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        title="Font Weight"
                    >
                        <option value="300">Thin</option>
                        <option value="normal">Normal</option>
                        <option value="500">Medium</option>
                        <option value="bold">Bold</option>
                    </select>

                    <input
                        type="number"
                        value={fontSize || 20}
                        onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                        className="w-12 text-xs p-1 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        title="Font Size"
                    >
                        <option value="1">1</option>
                        <option value="12">12</option>
                        <option value="24">24</option>
                        <option value="36">36</option>
                        <option value="48">48</option>
                        <option value="60">60</option>
                        <option value="72">72</option>
                        <option value="96">96</option>
                    </input>
                </>
            )}

            {showRadius && (
                <>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1 px-1">
                        <span className="text-[10px] font-bold text-gray-500">R:</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={cornerRadius || 0}
                            onChange={(e) => onCornerRadiusChange(parseInt(e.target.value))}
                            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            title="Corner Radius"
                        />
                    </div>
                </>
            )}

            <div className="w-px h-4 bg-gray-200"></div>

            <button onClick={onDuplicate} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors" title="Duplicate">
                <FaCopy />
            </button>

            <button onClick={onBringToFront} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors" title="Bring to Front">
                <FaLayerGroup />
            </button>

            <button onClick={onSendToBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors" title="Send to Back">
                <MdFlip className="rotate-90" />
            </button>

            <div className="w-px h-4 bg-gray-200"></div>

            <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-500 transition-colors" title="Delete">
                <FaTrash />
            </button>

            <button onClick={onClose} className="ml-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600" title="Close">
                <FaTimes size={12} />
            </button>
        </div>,
        document.body
    );
};

export default ContextToolbar;
