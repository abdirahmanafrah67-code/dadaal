import React from "react";
import { FaEye, FaEyeSlash, FaLock, FaLockOpen, FaLayerGroup, FaCube } from "react-icons/fa";

const LayersPanel = ({
    layers,
    selectedItem,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
}) => {
    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
                {layers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs italic flex flex-col items-center gap-2">
                        <FaCube className="text-gray-200 text-xl" />
                        No layers yet
                    </div>
                ) : (
                    layers.map((layer) => (
                        <div
                            key={layer.id}
                            onClick={() => selectLayer(layer)}
                            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-all ${selectedItem === layer.ref
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "hover:bg-gray-50 text-slate-600"
                                }`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <div className={`w-2 h-2 rounded-full border ${selectedItem === layer.ref ? "bg-blue-500 border-blue-500" : "bg-transparent border-gray-300"}`} />
                                <span className="truncate max-w-[120px]">{layer.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLayerLock(layer);
                                    }}
                                    className={`p-1 rounded hover:bg-gray-200 ${layer.locked ? "text-slate-800" : "text-gray-400"}`}
                                >
                                    {layer.locked ? <FaLock size={10} /> : <FaLockOpen size={10} />}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLayerVisibility(layer);
                                    }}
                                    className={`p-1 rounded hover:bg-gray-200 ${!layer.visible ? "text-gray-400" : "text-slate-600"}`}
                                >
                                    {layer.visible ? <FaEye size={10} /> : <FaEyeSlash size={10} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LayersPanel;
