import React from "react";
import {
    FaMousePointer,
    FaHandPaper,
    FaSearch,
    FaFont,
    FaImage,
    FaShapes,
    FaFileExport,
    FaCrown,
    FaVectorSquare,
    FaMagic,
    FaCrop,
    FaEyeDropper,
    FaBandAid,
    FaPaintBrush,
    FaStamp,
    FaHistory,
    FaEraser,
    FaPen,
    FaBezierCurve,
    FaSquare,
    FaRegSquare,
    FaCircle,
} from "react-icons/fa";
import { MdGradient, MdBlurOn, MdColorize, Md3dRotation, MdTexture, MdSelectAll } from "react-icons/md";
import { BiSelection } from "react-icons/bi";

// Unified Toolbar Component
// Designed for a professional, cohesive look (Figma/Canva style)

const Toolbar = ({
    toolMode,
    setTool,
    addRect,
    addRoundedRect,
    addEllipse,
    addImage,
    removeSelected,
    exportSVG,
    isPro,
    onShowToast,
    onLoadTemplate,
    // Pro Tools
    activateEyedropper,
    selectSimilar,
    applyBlur,
    applyGradient,
    toggleLock
}) => {
    // Helper to handle tool clicks
    const handleToolClick = (toolName, action) => {
        // All tools are free now! No lock checks.

        if (action) action();
        if (typeof toolName === "string") setTool(toolName);
        if (onShowToast) onShowToast(toolName);
    };

    // Unified Tool Definition
    const tools = [
        { icon: <FaMousePointer />, name: "select", tooltip: "Select (V)", action: () => setTool("select") },
        { icon: <FaHandPaper />, name: "hand", tooltip: "Pan Tool (H)", action: () => setTool("hand") },
        { icon: <FaSearch />, name: "zoom", tooltip: "Zoom (Z)", action: null }, // Zoom usually handled by scroll
        { divider: true },
        { icon: <FaFont />, name: "text", tooltip: "Add Text (T)", action: () => setTool("text") },
        { icon: <FaImage />, name: "image", tooltip: "Upload Image", action: addImage },
        { icon: <FaSquare />, name: "rect", tooltip: "Rectangle", action: addRect },
        { icon: <FaCircle />, name: "ellipse", tooltip: "Circle", action: addEllipse },
        { divider: true },
        { icon: <FaPen />, name: "pen", tooltip: "Pen Tool", action: () => setTool("pen") },
        { icon: <FaEyeDropper />, name: "eyedropper", tooltip: "Eyedropper", action: activateEyedropper, isPro: true },
        { icon: <FaMagic />, name: "magic", tooltip: "Select Similar", action: selectSimilar, isPro: true },
        { icon: <MdGradient />, name: "gradient", tooltip: "Gradient", action: applyGradient, isPro: true },
        { icon: <MdBlurOn />, name: "blur", tooltip: "Blur", action: applyBlur, isPro: true },
        { divider: true },
        { icon: <FaEraser />, name: "eraser", tooltip: "Delete", action: removeSelected, danger: true },
        { icon: <FaFileExport />, name: "export", tooltip: "Export Design", action: exportSVG, special: true },
    ];

    return (
        <div className="w-[72px] bg-white h-[calc(100vh-32px)] m-4 rounded-2xl flex flex-col shadow-xl shadow-gray-200/50 border border-gray-100 z-30 font-sans">
            {/* Logo / Brand Area */}
            <div className="h-16 flex items-center justify-center border-b border-gray-50">
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 transform hover:rotate-12 transition-transform duration-300 cursor-pointer">
                    <FaShapes size={20} />
                </div>
            </div>

            {/* Tools Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-none flex flex-col items-center gap-2 py-4">
                {tools.map((tool, index) => {
                    if (tool.divider) {
                        return <div key={index} className="w-8 h-[1px] bg-gray-100 my-1 flex-shrink-0" />;
                    }

                    const isActive = toolMode === tool.name;
                    return (
                        <button
                            key={index}
                            onClick={() => handleToolClick(tool.name, tool.action)}
                            className={`
                                relative w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 group
                                ${isActive
                                    ? "bg-purple-50 text-purple-600 shadow-sm ring-1 ring-purple-100"
                                    : tool.special
                                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        : tool.danger
                                            ? "hover:bg-red-50 hover:text-red-500 text-gray-400"
                                            : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                                }
                            `}
                            title={tool.tooltip}
                        >
                            {tool.icon}

                            {/* Tooltip on Hover */}
                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl translate-x-1 group-hover:translate-x-0">
                                {tool.tooltip}
                                <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-gray-800 rotate-45 transform" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Toolbar;
