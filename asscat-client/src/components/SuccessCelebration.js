import React, { useEffect, useState } from 'react';

const SuccessCelebration = ({ isOpen, message, onClose, type = 'purchase' }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-[#005587]/20 backdrop-blur-xl pointer-events-auto" onClick={onClose}></div>

            <div className={`relative bg-white p-12 rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] text-center max-w-sm w-full mx-4 border border-white/50 pointer-events-auto transform transition-all duration-700 ${isOpen ? 'scale-100 translate-y-0 rotate-0' : 'scale-75 translate-y-24 rotate-6'}`}>
                
                <div className="absolute inset-0 overflow-hidden rounded-[50px]">
                    {[...Array(30)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full animate-pulse opacity-30"
                            style={{
                                backgroundColor: i % 3 === 0 ? '#005587' : i % 3 === 1 ? '#b91c1c' : '#10b981',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>

                <div className="relative mb-10 flex justify-center">
                    <div className="w-28 h-24 bg-emerald-50 rounded-[35px] flex items-center justify-center animate-bounce shadow-inner">
                        <svg className="w-14 h-14 text-emerald-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <div className="absolute inset-0 w-28 h-24 mx-auto bg-emerald-400 rounded-[35px] animate-ping opacity-10"></div>
                </div>

                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">
                    {type === 'upgrade' ? 'Level Up!' : 'Success!'}
                </h2>
                <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10 px-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 fill-mode-both">
                    {message || "Transaction confirmed. Your educational journey just got an upgrade!"}
                </p>

                <button 
                    onClick={onClose}
                    className="w-full py-5 bg-[#005587] text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] hover:bg-[#003d5f] hover:scale-[1.02] transition-all shadow-2xl shadow-blue-200 active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-700 fill-mode-both"
                >
                    Keep Exploring
                </button>
            </div>
        </div>
    );
};

export default SuccessCelebration;
