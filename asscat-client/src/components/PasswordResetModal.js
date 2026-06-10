import React, { useState } from 'react';

const PasswordResetModal = ({ isOpen, onClose, onConfirm, userName }) => {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (newPassword.length < 6) {
            setError('Security Error: Password must be at least 6 characters.');
            return;
        }
        onConfirm(newPassword);
        setNewPassword('');
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                            </svg>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-all">✕</button>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Override Password</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">User: <span className="text-[#005587]">{userName}</span></p>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl animate-shake">
                            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest text-center">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">New Secret Key</label>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5 shadow-inner"
                                placeholder="••••••••"
                                autoFocus
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 bottom-5 text-lg opacity-40 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-2xl active:scale-95"
                    >
                        Confirm Override
                    </button>

                    <p className="mt-8 text-center text-[8px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                        🛡️ This action will be logged in the system security audit.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetModal;
