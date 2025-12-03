import React, { useState } from 'react';
import { FaCrown, FaTimes, FaCheck } from 'react-icons/fa';

const UpgradeModal = ({ isOpen, onClose, onUpgrade }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        onUpgrade();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-[500px] overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border-2 border-white/30">
                            <FaCrown size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Upgrade to Pro</h2>
                        <p className="text-white/90 text-sm">Unlock all premium tools and features</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <span className="text-gray-600">Pro Plan</span>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900">$9.99</div>
                                <div className="text-xs text-gray-500">per month</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Feature text="Advanced selection tools" />
                            <Feature text="Magic wand & lasso" />
                            <Feature text="Professional brushes" />
                            <Feature text="Gradient & blur effects" />
                            <Feature text="3D material tools" />
                            <Feature text="Clone stamp & history brush" />
                            <Feature text="Priority support" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaCrown size={18} />
                                    Pay Now & Unlock Pro
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        This is a simulated payment for demonstration purposes
                    </p>
                </div>
            </div>
        </div>
    );
};

const Feature = ({ text }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaCheck size={10} className="text-green-600" />
        </div>
        <span className="text-gray-700 text-sm">{text}</span>
    </div>
);

export default UpgradeModal;
