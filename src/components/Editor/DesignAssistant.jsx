import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaTimes, FaPalette, FaFont, FaRulerCombined, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaMagic, FaWrench } from 'react-icons/fa';

const DesignAssistant = ({ selectedItem, canvas, projectType }) => {
    const [advice, setAdvice] = useState(null);
    const [show, setShow] = useState(false);
    const [lastAdvice, setLastAdvice] = useState(null);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!selectedItem || !canvas) {
            setShow(false);
            return;
        }

        // Analyze the design and give advice with actions
        const newAdvice = analyzeDesign(selectedItem, canvas, projectType);
        if (newAdvice && JSON.stringify(newAdvice) !== JSON.stringify(lastAdvice)) {
            setAdvice(newAdvice);
            setLastAdvice(newAdvice);
            setShow(true);
        }
    }, [selectedItem, canvas, projectType]);

    const analyzeDesign = (item, canvas, projectType) => {
        const tips = [];

        // Project-specific size recommendations with AUTO-FIX
        if (projectType && canvas) {
            const projectSizes = {
                logo: { width: 500, height: 500, name: 'Logo (500x500px)' },
                poster: { width: 2480, height: 3508, name: 'A4 Poster (2480x3508px @ 300dpi)' },
                social: { width: 1080, height: 1080, name: 'Instagram Post (1080x1080px)' },
                banner: { width: 1200, height: 400, name: 'Web Banner (1200x400px)' }
            };

            const recommended = projectSizes[projectType];
            if (recommended) {
                const currentWidth = canvas.width;
                const currentHeight = canvas.height;

                if (Math.abs(currentWidth - recommended.width) > 100 || Math.abs(currentHeight - recommended.height) > 100) {
                    tips.push({
                        icon: <FaRulerCombined />,
                        type: 'info',
                        message: `💡 Canvas size doesn't match ${projectType} standards`,
                        action: `Current: ${currentWidth}x${currentHeight}px → Recommended: ${recommended.width}x${recommended.height}px`,
                        autoFix: () => {
                            canvas.setDimensions({
                                width: recommended.width,
                                height: recommended.height
                            });
                            canvas.requestRenderAll();
                        },
                        fixLabel: 'Resize Canvas'
                    });
                }
            }
        }

        // Text size checks with AUTO-FIX
        if (item.type === 'i-text' || item.type === 'text') {
            // Too small
            if (item.fontSize < 14) {
                tips.push({
                    icon: <FaFont />,
                    type: 'warning',
                    message: '⚠️ Text is too small and hard to read!',
                    action: `Current: ${Math.round(item.fontSize)}px → Recommended: 18px minimum`,
                    autoFix: () => {
                        item.set('fontSize', 18);
                        item.setCoords();
                        canvas.requestRenderAll();
                    },
                    fixLabel: 'Fix Font Size'
                });
            }
            // Social media specific
            else if (projectType === 'social' && item.fontSize < 20) {
                tips.push({
                    icon: <FaFont />,
                    type: 'warning',
                    message: '⚠️ Text too small for social media!',
                    action: `Boost to 24px for better visibility on mobile`,
                    autoFix: () => {
                        item.set('fontSize', 24);
                        item.setCoords();
                        canvas.requestRenderAll();
                    },
                    fixLabel: 'Optimize for Social'
                });
            }
            // Logo specific
            else if (projectType === 'logo' && item.fontSize > 60) {
                tips.push({
                    icon: <FaFont />,
                    type: 'info',
                    message: '💡 Logo text is quite large',
                    action: 'Reduce to 36px for better scalability',
                    autoFix: () => {
                        item.set('fontSize', 36);
                        item.setCoords();
                        canvas.requestRenderAll();
                    },
                    fixLabel: 'Optimize Logo Size'
                });
            }

            // Color contrast check with AUTO-FIX
            const itemColor = item.fill;
            const bgColor = canvas.backgroundColor;

            if (typeof itemColor === 'string' && typeof bgColor === 'string') {
                const contrast = calculateColorContrast(itemColor, bgColor);

                if (contrast < 3) {
                    const fixedColor = getContrastingColor(bgColor);
                    tips.push({
                        icon: <FaPalette />,
                        type: 'error',
                        message: '🚫 Critical: Text is invisible! Poor contrast detected.',
                        action: `Contrast ratio: ${contrast.toFixed(1)}:1 (Need 4.5:1 minimum)`,
                        autoFix: () => {
                            item.set('fill', fixedColor);
                            canvas.requestRenderAll();
                        },
                        fixLabel: 'Fix Contrast'
                    });
                } else if (contrast < 4.5) {
                    const fixedColor = getContrastingColor(bgColor);
                    tips.push({
                        icon: <FaPalette />,
                        type: 'warning',
                        message: '⚠️ Low contrast. Hard to read for some users.',
                        action: `Current: ${contrast.toFixed(1)}:1 → Target: 4.5:1 (WCAG AA)`,
                        autoFix: () => {
                            item.set('fill', fixedColor);
                            canvas.requestRenderAll();
                        },
                        fixLabel: 'Boost Contrast'
                    });
                }
            }

            // Bad color combinations with AUTO-FIX
            if (typeof itemColor === 'string' && typeof bgColor === 'string') {
                const badCombo = checkBadColorCombinations(itemColor, bgColor);
                if (badCombo) {
                    tips.push({
                        icon: <FaPalette />,
                        type: 'warning',
                        message: `⚠️ ${badCombo.message}`,
                        action: badCombo.suggestion,
                        autoFix: () => {
                            item.set('fill', badCombo.fixColor);
                            canvas.requestRenderAll();
                        },
                        fixLabel: 'Use Better Colors'
                    });
                }
            }
        }

        // Shape size checks with AUTO-FIX
        if (item.type === 'rect' || item.type === 'circle') {
            const width = item.width * (item.scaleX || 1);
            const height = item.height * (item.scaleY || 1);

            if (width < 30 || height < 30) {
                tips.push({
                    icon: <FaRulerCombined />,
                    type: 'warning',
                    message: '⚠️ Shape is too small to see clearly!',
                    action: `Current: ${Math.round(width)}x${Math.round(height)}px → Enlarging to 100x100px`,
                    autoFix: () => {
                        const scale = 100 / Math.min(width, height);
                        item.set({
                            scaleX: (item.scaleX || 1) * scale,
                            scaleY: (item.scaleY || 1) * scale
                        });
                        item.setCoords();
                        canvas.requestRenderAll();
                    },
                    fixLabel: 'Enlarge Shape'
                });
            }

            // Margin check with AUTO-FIX
            const margin = 20;
            if (item.left < margin || item.top < margin) {
                tips.push({
                    icon: <FaRulerCombined />,
                    type: 'info',
                    message: '💡 Element is too close to the edge!',
                    action: 'Auto-adding 20px margin for breathing room',
                    autoFix: () => {
                        if (item.left < margin) item.set('left', margin);
                        if (item.top < margin) item.set('top', margin);
                        item.setCoords();
                        canvas.requestRenderAll();
                    },
                    fixLabel: 'Add Margins'
                });
            }

            // Logo optimization with AUTO-FIX
            if (projectType === 'logo') {
                const canvasWidth = canvas.width || 500;
                const canvasHeight = canvas.height || 500;
                const objectPercent = (width * height) / (canvasWidth * canvasHeight) * 100;

                if (objectPercent < 15) {
                    tips.push({
                        icon: <FaRulerCombined />,
                        type: 'info',
                        message: '💡 Logo element is small. Logos should fill the space!',
                        action: `Currently ${Math.round(objectPercent)}% of canvas → Scaling to 50%`,
                        autoFix: () => {
                            const targetPercent = 50;
                            const scale = Math.sqrt(targetPercent / objectPercent);
                            item.set({
                                scaleX: (item.scaleX || 1) * scale,
                                scaleY: (item.scaleY || 1) * scale
                            });
                            item.center();
                            item.setCoords();
                            canvas.requestRenderAll();
                        },
                        fixLabel: 'Optimize Logo Size'
                    });
                }
            }
        }

        // Color palette analysis with AUTO-FIX
        if (canvas) {
            const objects = canvas.getObjects();
            const colors = extractColors(objects);

            if (colors.length > 5 && projectType === 'logo') {
                tips.push({
                    icon: <FaPalette />,
                    type: 'warning',
                    message: `⚠️ Too many colors (${colors.length}) for a logo!`,
                    action: 'Logos work best with 2-3 colors. Simplify your palette.',
                    autoFix: () => {
                        // Apply a simplified 3-color palette
                        const simplePalette = ['#1e3a8a', '#ffffff', '#f59e0b']; // Blue, White, Orange
                        let colorIndex = 0;
                        objects.forEach(obj => {
                            if (obj.fill && typeof obj.fill === 'string') {
                                obj.set('fill', simplePalette[colorIndex % simplePalette.length]);
                                colorIndex++;
                            }
                        });
                        canvas.requestRenderAll();
                    },
                    fixLabel: 'Simplify Colors'
                });
            }

            // Crowded design with AUTO-FIX
            if (objects.length > 20 && projectType !== 'poster') {
                tips.push({
                    icon: <FaLightbulb />,
                    type: 'info',
                    message: `💡 Design is crowded (${objects.length} objects)`,
                    action: 'Less is more! Consider grouping or removing elements.',
                    autoFix: () => {
                        // Group all selected objects
                        const activeObjects = canvas.getActiveObjects();
                        if (activeObjects.length > 1) {
                            const group = new fabric.Group(activeObjects);
                            canvas.remove(...activeObjects);
                            canvas.add(group);
                            canvas.setActiveObject(group);
                            canvas.requestRenderAll();
                        }
                    },
                    fixLabel: 'Group Elements'
                });
            }
        }

        return tips.length > 0 ? tips[0] : null; // Return highest priority tip
    };

    // Apply the auto-fix
    const handleAutoFix = async () => {
        if (!advice?.autoFix) return;

        setIsApplying(true);
        try {
            await advice.autoFix();
            // Show success and hide after brief delay
            setTimeout(() => {
                setShow(false);
                setIsApplying(false);
            }, 1000);
        } catch (error) {
            console.error('Auto-fix error:', error);
            setIsApplying(false);
        }
    };

    // Helper: Calculate color contrast (WCAG)
    const calculateColorContrast = (color1, color2) => {
        const getLuminance = (color) => {
            const rgb = hexToRgb(color);
            if (!rgb) return 0;

            const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
                val = val / 255;
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);

        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);

        return (brightest + 0.05) / (darkest + 0.05);
    };

    const hexToRgb = (hex) => {
        if (!hex) return null;
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Helper: Get contrasting color
    const getContrastingColor = (bgColor) => {
        const rgb = hexToRgb(bgColor);
        if (!rgb) return '#000000';

        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    };

    // Helper: Check bad color combinations
    const checkBadColorCombinations = (color1, color2) => {
        const c1 = color1.toLowerCase();
        const c2 = color2.toLowerCase();

        // Red-Green (colorblind issue)
        const isRed = c1.includes('ff0000') || c1.includes('red') || c1.match(/#[f9][0-3]0000/);
        const isGreen = c2.includes('00ff00') || c2.includes('green') || c2.match(/#00[f9][0-3]00/);

        if ((isRed && isGreen) || (isGreen && isRed)) {
            return {
                message: 'Red-green combo is hard for colorblind users!',
                suggestion: 'Use blue or orange instead',
                fixColor: '#2563eb' // Blue
            };
        }

        // Check for similar colors
        const rgb1 = hexToRgb(c1);
        const rgb2 = hexToRgb(c2);

        if (rgb1 && rgb2) {
            const diff = Math.abs(rgb1.r - rgb2.r) + Math.abs(rgb1.g - rgb2.g) + Math.abs(rgb1.b - rgb2.b);
            if (diff < 100) {
                return {
                    message: 'Colors are too similar!',
                    suggestion: 'Need more contrast',
                    fixColor: getContrastingColor(c2)
                };
            }
        }

        return null;
    };

    const extractColors = (objects) => {
        const colors = new Set();
        objects.forEach(obj => {
            if (obj.fill && typeof obj.fill === 'string') {
                colors.add(obj.fill.toLowerCase());
            }
            if (obj.stroke && typeof obj.stroke === 'string') {
                colors.add(obj.stroke.toLowerCase());
            }
        });
        return Array.from(colors);
    };

    if (!show || !advice) return null;

    const typeStyles = {
        error: {
            bg: 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100',
            border: 'border-red-400',
            icon: 'text-red-600',
            badge: 'bg-red-500',
            button: 'bg-red-500 hover:bg-red-600'
        },
        warning: {
            bg: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100',
            border: 'border-yellow-400',
            icon: 'text-yellow-600',
            badge: 'bg-yellow-500',
            button: 'bg-yellow-500 hover:bg-yellow-600'
        },
        info: {
            bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
            border: 'border-blue-400',
            icon: 'text-blue-600',
            badge: 'bg-blue-500',
            button: 'bg-blue-500 hover:bg-blue-600'
        },
        success: {
            bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
            border: 'border-green-400',
            icon: 'text-green-600',
            badge: 'bg-green-500',
            button: 'bg-green-500 hover:bg-green-600'
        }
    };

    const style = typeStyles[advice.type] || typeStyles.info;

    return (
        <div className="fixed top-24 right-6 z-[60] animate-in slide-in-from-right-5 duration-300">
            <div className={`w-[420px] ${style.bg} border-2 ${style.border} rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden`}>
                <div className="p-5">
                    <div className="flex items-start gap-3">
                        <div className={`${style.icon} mt-1 text-2xl relative`}>
                            {advice.icon}
                            <div className={`absolute -top-1 -right-1 w-3 h-3 ${style.badge} rounded-full animate-pulse ring-2 ring-white`}></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FaMagic className="text-purple-500 text-sm" />
                                <h4 className="font-bold text-sm text-gray-900">AI Design Agent</h4>
                                {projectType && (
                                    <span className="px-2 py-0.5 bg-white/70 rounded-full text-[10px] font-bold text-purple-600 border border-purple-300 shadow-sm">
                                        {projectType.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-900 font-semibold mb-2 leading-relaxed">{advice.message}</p>
                            <p className="text-xs text-gray-700 bg-white/60 px-3 py-2 rounded-lg border border-gray-200 mb-3">
                                {advice.action}
                            </p>

                            {/* Agent Actions */}
                            {advice.autoFix && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAutoFix}
                                        disabled={isApplying}
                                        className={`flex-1 ${style.button} text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isApplying ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Applying...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaWrench />
                                                <span>{advice.fixLabel || 'Auto-Fix'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShow(false)}
                                        className="px-3 py-2.5 bg-white/80 hover:bg-white text-gray-700 rounded-xl font-medium text-sm border-2 border-gray-300 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}
                        </div>
                        {!advice.autoFix && (
                            <button
                                onClick={() => setShow(false)}
                                className="text-gray-500 hover:text-gray-800 transition-colors p-1 hover:bg-white/60 rounded-full"
                                title="Dismiss"
                            >
                                <FaTimes size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignAssistant;
