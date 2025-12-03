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

const Toolbar = ({
    toolMode,
    setTool,
    addRect,
    addRoundedRect,
    addEllipse,
    addImage,
    removeSelected,
    exportSVG,
    setShowUpgradeModal,
    isPro,
    onShowToast,
    onLoadTemplate, // New prop
}) => {
    const handleToolClick = (toolName, action, locked) => {
        if (locked && !isPro) {
            setShowUpgradeModal(true);
        } else {
            if (action) {
                action();
            } else if (locked) {
                // Placeholder for Pro tools that don't have an action yet
                alert(`The ${toolName} tool is coming soon!`);
            }

            if (typeof toolName === "string") setTool(toolName);
            if (onShowToast) onShowToast(toolName);
        }
    };

    return (
        <div className="w-72 bg-white h-[calc(100vh-40px)] m-5 rounded-[24px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 font-sans">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-gray-900 font-bold text-lg">Tools</h2>
                <p className="text-gray-500 text-xs mt-1">Select a tool to edit</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {/* Essentials Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Essentials</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <ToolButton icon={<FaMousePointer />} active={toolMode === "select"} onClick={() => handleToolClick("select", () => setTool("select"))} tooltip="Select (V)" />
                        <ToolButton icon={<FaHandPaper />} active={toolMode === "hand"} onClick={() => handleToolClick("hand", () => setTool("hand"))} tooltip="Pan (H)" />
                        <ToolButton icon={<FaSearch />} active={toolMode === "zoom"} onClick={() => handleToolClick("zoom", null)} tooltip="Zoom (Z)" />
                        <ToolButton icon={<FaFont />} active={toolMode === "text"} onClick={() => handleToolClick("text", () => setTool("text"))} tooltip="Text (T)" />
                    </div>
                </div>

                {/* Insert Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Insert</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <ToolButton icon={<FaImage />} onClick={() => handleToolClick("image", addImage)} tooltip="Add Image" />
                        <ToolButton icon={<FaSquare />} onClick={() => handleToolClick("rect", addRect)} tooltip="Rectangle" />
                        <ToolButton icon={<FaRegSquare />} onClick={() => handleToolClick("rounded-rect", addRoundedRect)} tooltip="Rounded Rect" />
                        <ToolButton icon={<FaCircle />} onClick={() => handleToolClick("ellipse", addEllipse)} tooltip="Circle" />
                    </div>
                </div>

                {/* Drawing Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Draw & Edit</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <ToolButton icon={<FaPen />} active={toolMode === "pen"} onClick={() => handleToolClick("pen", () => setTool("pen"))} tooltip="Pen Tool" />
                        <ToolButton icon={<FaEraser />} onClick={() => handleToolClick("eraser", removeSelected)} tooltip="Eraser / Delete" danger />
                        <ToolButton icon={<FaFileExport />} onClick={() => handleToolClick("export", exportSVG)} tooltip="Export Design" special />
                    </div>
                </div>

                {/* Templates Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Templates</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <ToolButton icon={<FaMagic />} onClick={() => handleToolClick("template", onLoadTemplate)} tooltip="Watch Template" special />
                    </div>
                </div>

                {/* Pro Tools Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 uppercase tracking-wider">Pro Features</h3>
                        {!isPro && <FaCrown className="text-yellow-500 text-xs animate-pulse" />}
                    </div>

                    <div className="p-3 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-blue-100/50">
                        <div className="grid grid-cols-4 gap-2">
                            <ToolButton icon={<BiSelection />} onClick={() => handleToolClick("marquee", null, true)} tooltip="Marquee Selection" locked={!isPro} />
                            <ToolButton icon={<FaVectorSquare />} onClick={() => handleToolClick("lasso", null, true)} tooltip="Lasso Tool" locked={!isPro} />
                            <ToolButton icon={<FaMagic />} onClick={() => handleToolClick("magic", null, true)} tooltip="Magic Wand" locked={!isPro} />
                            <ToolButton icon={<FaCrop />} onClick={() => handleToolClick("crop", null, true)} tooltip="Crop Tool" locked={!isPro} />

                            <ToolButton icon={<FaEyeDropper />} onClick={() => handleToolClick("eyedropper", null, true)} tooltip="Eyedropper" locked={!isPro} />
                            <ToolButton icon={<MdColorize />} onClick={() => handleToolClick("sampler", null, true)} tooltip="Color Sampler" locked={!isPro} />
                            <ToolButton icon={<FaBandAid />} onClick={() => handleToolClick("patch", null, true)} tooltip="Healing Brush" locked={!isPro} />
                            <ToolButton icon={<FaPaintBrush />} onClick={() => handleToolClick("brush", null, true)} tooltip="Paint Brush" locked={!isPro} />

                            <ToolButton icon={<FaStamp />} onClick={() => handleToolClick("clone", null, true)} tooltip="Clone Stamp" locked={!isPro} />
                            <ToolButton icon={<MdGradient />} onClick={() => handleToolClick("gradient", null, true)} tooltip="Gradient Tool" locked={!isPro} />
                            <ToolButton icon={<MdBlurOn />} onClick={() => handleToolClick("blur", null, true)} tooltip="Blur Tool" locked={!isPro} />
                            <ToolButton icon={<FaBezierCurve />} onClick={() => handleToolClick("path", null, true)} tooltip="Path Tool" locked={!isPro} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Status */}
            {!isPro && (
                <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                    <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <FaCrown className="text-yellow-300" />
                        Upgrade to Pro
                    </button>
                </div>
            )}
        </div>
    );
};

const ToolButton = ({ icon, onClick, active, danger, special, tooltip, locked }) => (
    <button
        onClick={onClick}
        title={tooltip}
        className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all duration-200 relative group
            ${active
                ? "bg-slate-800 text-white shadow-lg scale-105 ring-2 ring-slate-200"
                : danger
                    ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border border-red-100"
                    : special
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-100"
                        : locked
                            ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                            : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md border border-gray-100 hover:border-gray-200"
            }
        `}
    >
        {icon}

        {/* Tooltip on hover */}
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {tooltip}
        </span>

        {locked && (
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm z-10">
                <FaCrown size={10} className="text-yellow-500" />
            </div>
        )}
    </button>
);

export default Toolbar;
