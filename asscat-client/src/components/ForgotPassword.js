import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    const startCooldown = () => {
        setCooldown(60);
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const data = await authService.forgotPassword(email);
            setMessage(data.message);
            setStep(2);
            startCooldown();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const data = await authService.resendCode(email, 'password_reset');
            setMessage(data.message);
            startCooldown();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsLoading(true);
        try {
            const data = await authService.resetPassword(email, code, newPassword);
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-md w-full space-y-10 bg-white p-12 rounded-[50px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-slate-50 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-[#005587]/10 rounded-2xl flex items-center justify-center mb-6 text-3xl">
                        {step === 1 ? '🔑' : '📧'}
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
                        {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter Code' : 'New Password'}
                    </h2>
                    <p className="text-[10px] font-black text-[#005587] uppercase tracking-[0.4em]">
                        {step === 1 ? 'Enter your registered email' : step === 2 ? 'Check your inbox' : 'Create new secret key'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-5 rounded-3xl">
                        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest text-center">{error}</p>
                    </div>
                )}
                {message && (
                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl">
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-center">{message}</p>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-8">
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5" placeholder="juan@example.com" required />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-6 bg-[#005587] text-white rounded-[30px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleReset} className="space-y-8">
                        <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100 text-center">
                            <p className="text-[11px] text-slate-600 font-bold">Code sent to</p>
                            <p className="text-sm font-black text-[#005587]">{email}</p>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-center">6-Digit Code</label>
                            <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="appearance-none block w-full px-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-2xl text-center tracking-[0.4em] transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5" placeholder="000000" maxLength={6} required autoFocus />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">New Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="appearance-none block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5" placeholder="Min 6 characters" required minLength="6" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-lg">{showPassword ? '🙈' : '👁️'}</button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-6 bg-[#005587] text-white rounded-[30px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <div className="text-center">
                            <button type="button" onClick={handleResend} disabled={cooldown > 0 || isLoading} className="text-[10px] font-black text-[#005587] uppercase tracking-widest hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed">
                                {isLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Link to="/login" className="text-red-600 hover:text-black transition-colors">Back to Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
