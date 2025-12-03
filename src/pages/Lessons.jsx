import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPaintBrush, FaLayerGroup, FaMagic, FaArrowRight, FaStar, FaHeart } from "react-icons/fa";

const Lessons = () => {
    const navigate = useNavigate();

    const handleStart = (level) => {
        navigate("/editor", { state: { level } });
    };

    return (
        <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute top-0 -right-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            <div className="text-center mb-12 z-10">
                <div className="inline-block p-4 rounded-3xl bg-white shadow-xl shadow-sky-100 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl shadow-inner">
                        💠
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Dadaal Studio</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                    Master the art of digital design with our professional tools. Choose your skill level to begin your journey!
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full z-10">
                <LessonCard
                    title="Beginner"
                    description="Learn the basics of shapes, colors, and selection tools."
                    icon={<FaPaintBrush className="text-3xl text-teal-500" />}
                    color="teal"
                    features={["Basic Tools", "Shape Manipulation", "Color Theory"]}
                    onClick={() => handleStart("beginner")}
                />
                <LessonCard
                    title="Intermediate"
                    description="Master layers, typography, and advanced object properties."
                    icon={<FaLayerGroup className="text-3xl text-sky-500" />}
                    color="sky"
                    features={["Layer Management", "Typography", "Grouping & Alignment"]}
                    recommended
                    onClick={() => handleStart("intermediate")}
                />
                <LessonCard
                    title="Advanced"
                    description="Unlock professional tools, AI generation, and complex vector paths."
                    icon={<FaMagic className="text-3xl text-indigo-500" />}
                    color="indigo"
                    features={["Vector Paths", "AI Generation", "Pro Export Options"]}
                    onClick={() => handleStart("advanced")}
                />
            </div>

            <div className="mt-12 text-slate-400 text-sm font-medium flex items-center gap-2">
                Made with <FaHeart className="text-sky-400" /> by Dadaal Design Studio
            </div>
        </div>
    );
};

const LessonCard = ({ title, description, icon, color, features, onClick, recommended }) => {
    const colorClasses = {
        teal: "hover:border-teal-300 hover:shadow-teal-100",
        sky: "border-sky-400 shadow-sky-200 ring-4 ring-sky-50",
        indigo: "hover:border-indigo-300 hover:shadow-indigo-100",
    };

    const btnColors = {
        teal: "bg-teal-50 text-teal-600 hover:bg-teal-100",
        sky: "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-200",
        indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    };

    return (
        <div
            className={`bg-white rounded-[2rem] p-8 shadow-xl border-2 transition-all duration-300 transform hover:-translate-y-2 flex flex-col relative ${recommended ? colorClasses.sky : "border-white hover:border-slate-100"}`}
        >
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                    <FaStar size={10} className="text-yellow-300" /> RECOMMENDED
                </div>
            )}

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${recommended ? "bg-sky-50" : "bg-slate-50"}`}>
                {icon}
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm">{description}</p>

            <div className="space-y-3 mb-8 flex-1">
                {features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                        <div className={`w-2 h-2 rounded-full ${recommended ? "bg-sky-400" : "bg-slate-300"}`} />
                        {feat}
                    </div>
                ))}
            </div>

            <button
                onClick={onClick}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${btnColors[color]}`}
            >
                Start Learning <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

export default Lessons;
