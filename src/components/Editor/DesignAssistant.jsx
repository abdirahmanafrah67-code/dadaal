import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaTimes, FaPalette, FaFont, FaRulerCombined } from 'react-icons/fa';

const DesignAssistant = ({ selectedItem, canvas }) => {
    const [advice, setAdvice] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!selectedItem || !canvas) {
            setShow(false);
            return;
        }

        // Analyze the design and give advice
        const newAdvice = analyzeDesign(selectedItem, canvas);
        if (newAdvice) {
            setAdvice(newAdvice);
            setShow(true);
        }
    }, [selectedItem, canvas]);

    const analyzeDesign = (item, canvas) => {
        const tips = [];

        // Check text properties
        if (item.type === 'i-text' || item.type === 'text') {
            // Font size check
            if (item.fontSize < 16) {
                tips.push({
                    icon: <FaFont />,
                    type: 'warning',
                    message: '⚠️ Qoraalku aad buu u yar yahay! Kor u qaad ilaa 16px ama ka badan.',
                    action: 'Qoraalka yareynta waa in la akhristo.'
                });
            } else if (item.fontSize > 100) {
                tips.push({
                    icon: <FaFont />,
                    type: 'info',
                    message: '💡 Qoraalku aad buu u weyn yahay. Hoos u dhig si loo naqshadeeyo.',
                    action: 'Qoraalka waa in la isku dhafayo naqshada.'
                });
            }

            // Color contrast check
            if (item.fill === '#FFFFFF' || item.fill === '#ffffff') {
                const bgColor = canvas.backgroundColor;
                if (bgColor === '#FFFFFF' || bgColor === '#ffffff' || bgColor === '#f3f4f6') {
                    tips.push({
                        icon: <FaPalette />,
                        type: 'error',
                        message: '🚫 Midabka qoraalka iyo asalka way isku eg yihiin! Beddel midkood.',
                        action: 'Contrast wanaagsan samee si loo akhristo.'
                    });
                }
            }

            // Text length check
            if (item.text && item.text.length > 100) {
                tips.push({
                    icon: <FaFont />,
                    type: 'info',
                    message: '📝 Qoraalku aad buu u dheer yahay. Gaabso oo qodobka muhiimka ah ka soo qaad.',
                    action: 'Qoraalka gaaban waa mid soo jiidanaya.'
                });
            }
        }

        // Check shape properties
        if (item.type === 'rect' || item.type === 'circle') {
            // Size check
            const width = item.width * (item.scaleX || 1);
            const height = item.height * (item.scaleY || 1);

            if (width < 50 || height < 50) {
                tips.push({
                    icon: <FaRulerCombined />,
                    type: 'warning',
                    message: '⚠️ Qaabkan aad buu u yar yahay! Weynee si loo arko.',
                    action: 'Qaababka yaryar way ku luntaan naqshada.'
                });
            }

            // Position check - too close to edge
            if (item.left < 20 || item.top < 20) {
                tips.push({
                    icon: <FaRulerCombined />,
                    type: 'info',
                    message: '💡 Qaabku aad buu ugu dhow yahay cirifka! Dhex dhig.',
                    action: 'Bannaan ka tag cirifka (margin).'
                });
            }
        }

        // General design tips
        const objects = canvas.getObjects();
        if (objects.length > 15) {
            tips.push({
                icon: <FaPalette />,
                type: 'warning',
                message: '⚠️ Naqshadu aad bay u buuxdaa! Ka yareee waxyaabaha.',
                action: 'Naqshad fudud = naqshad qurux badan.'
            });
        }

        return tips.length > 0 ? tips[0] : null; // Return first tip
    };

    if (!show || !advice) return null;

    const bgColor = advice.type === 'error' ? 'bg-red-50 border-red-200' :
        advice.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200';

    const iconColor = advice.type === 'error' ? 'text-red-500' :
        advice.type === 'warning' ? 'text-yellow-500' :
            'text-blue-500';

    return (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div className={`w-80 ${bgColor} border-2 rounded-2xl shadow-lg p-4`}>
                <div className="flex items-start gap-3">
                    <div className={`${iconColor} mt-1`}>
                        {advice.icon}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-gray-800 mb-1">Talo AI</h4>
                        <p className="text-xs text-gray-700 mb-2">{advice.message}</p>
                        <p className="text-[10px] text-gray-500 italic">{advice.action}</p>
                    </div>
                    <button
                        onClick={() => setShow(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesignAssistant;
