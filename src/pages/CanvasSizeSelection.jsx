import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage, FaFile, FaShareAlt, FaCog } from "react-icons/fa";
import { MdViewWeek } from "react-icons/md";

const CanvasSizeSelection = () => {
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const navigate = useNavigate();

  const presetSizes = [
    {
      id: "logo",
      name: "Logo",
      width: 500,
      height: 500,
      icon: FaImage,
      description: "Great for brand marks and avatars",
    },
    {
      id: "poster",
      name: "Poster",
      width: 800,
      height: 1200,
      icon: FaFile,
      description: "Perfect for print posters and flyers",
    },
    {
      id: "social",
      name: "Social Media Square",
      width: 1080,
      height: 1080,
      icon: FaShareAlt,
      description: "Optimized for Instagram, Facebook, and X",
    },
    {
      id: "banner",
      name: "Web Banner",
      width: 1200,
      height: 400,
      icon: MdViewWeek,
      description: "Ideal for hero sections and site headers",
    },
  ];

  const handleSelectSize = (w, h) => {
    navigate("/editor", {
      state: {
        canvasWidth: w,
        canvasHeight: h,
      },
    });
  };

  const handleCustomSize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (!width || !height || width < 100 || height < 100) {
      alert("Please enter a valid size (minimum 100px).");
      return;
    }

    if (width > 5000 || height > 5000) {
      alert("Size is too large (maximum 5000px).");
      return;
    }

    handleSelectSize(width, height);
  };

  return (
    <div className="min-h-screen bg-[#F6F5FB] py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-[#3F3F46] mb-3">
          Choose Your Canvas Size
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Pick a preset or create a custom dimension
        </p>

        {/* Preset Size Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {presetSizes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectSize(item.width, item.height)}
                className="card hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#F4EAFF] flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Icon className="text-[var(--primary)] text-2xl" />
                </div>

                <h3 className="font-semibold text-lg mb-1 text-[#3F3F46]">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500 mb-3">{item.description}</p>

                <div className="py-2 px-4 bg-gray-100 rounded-lg font-medium text-gray-700">
                  {item.width} × {item.height} px
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Size */}
        <div className="card hover:shadow-xl transition cursor-pointer mb-4"
          onClick={() => setShowCustom((x) => !x)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#F4EAFF] flex items-center justify-center">
                <FaCog className="text-[var(--primary)] text-xl" />
              </div>

              <div>
                <h3 className="font-semibold text-xl text-[#3F3F46]">
                  Custom Size
                </h3>
                <p className="text-sm text-gray-500">
                  Define your own width and height
                </p>
              </div>
            </div>

            <span className="text-3xl text-gray-400">
              {showCustom ? "−" : "+"}
            </span>
          </div>
        </div>

        {showCustom && (
          <div className="card fade-in">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Width (px)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 800"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Height (px)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g., 1200"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                />
              </div>
            </div>

            {/* Preview */}
            {customWidth && customHeight && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg text-center">
                <span className="font-semibold text-gray-700 text-lg">
                  {customWidth} × {customHeight} px
                </span>
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleCustomSize}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold"
            >
              Start Designing →
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CanvasSizeSelection;
