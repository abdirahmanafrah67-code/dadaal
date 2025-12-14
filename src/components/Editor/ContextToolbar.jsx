import React from 'react';
import { createPortal } from 'react-dom';
import { FaPalette, FaTrash, FaCopy, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { MdFlip, MdTexture } from 'react-icons/md';

const ContextToolbar = ({ position, onClose, onColorChange, onDuplicate, onDelete, onSendToBack, onBringToFront, showRadius, cornerRadius, onCornerRadiusChange, onTogglePattern, isText, fontFamily, fontWeight, fontSize, onFontFamilyChange, onFontWeightChange, onFontSizeChange }) => {
    if (!position) return null;

    return createPortal(
        <div
            className="fixed z-[9999] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/50 p-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: position.x,
                top: position.y - 60,
                transform: 'translateX(-50%)'
            }}
        >
            <button
                onClick={() => document.getElementById('context-color-picker').click()}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-700 hover:text-purple-600 transition-all relative group"
                title="Fill Color"
            >
                <FaPalette size={14} />
                <input
                    id="context-color-picker"
                    type="color"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => onColorChange(e.target.value)}
                />
            </button>

            <button onClick={onTogglePattern} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-700 hover:text-purple-600 transition-all" title="Opacity / Texture">
                <MdTexture size={16} />
            </button>

            <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

            <button onClick={onDuplicate} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-700 hover:text-purple-600 transition-all" title="Duplicate">
                <FaCopy size={14} />
            </button>

            <button onClick={onBringToFront} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-700 hover:text-purple-600 transition-all" title="Bring Forward">
                <FaLayerGroup size={14} />
            </button>

            <button onClick={onSendToBack} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-700 hover:text-purple-600 transition-all" title="Send Backward">
                <MdFlip size={16} className="rotate-90" />
            </button>

            <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

            <button onClick={onDelete} className="w-9 h-9 flex items-center justify-center hover:bg-red-50 rounded-xl text-gray-700 hover:text-red-500 transition-all" title="Delete">
                <FaTrash size={14} />
            </button>
        </div>,
        document.body
    );
};

export default ContextToolbar;
