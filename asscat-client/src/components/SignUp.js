import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

function SignUp() {
    const [step, setStep] = useState(1); // 1 = form, 2 = OTP verify
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('student');
    const [educationLevel, setEducationLevel] = useState('secondary');
    const [proofFile, setProofFile] = useState(null);
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSending(true);

        try {
            const formData = new URLSearchParams();
            formData.append('email', email);
            const response = await axios.post(`${API_URL}/auth/register/send-otp`, formData.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            setSuccess(response.data.message);
            setStep(2);
            startCooldown();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code.');
        } finally {
            setIsSending(false);
        }
    };

    const startCooldown = () => {
        setCooldown(60);
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOtp = async () => {
        if (cooldown > 0) return;
        setError('');
        setSuccess('');
        setIsSending(true);

        try {
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('type', 'email_verify');
            const response = await axios.post(`${API_URL}/auth/resend-code`, formData.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            setSuccess(response.data.message);
            startCooldown();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('code', otpCode);

        if (userType === 'student') {
            formData.append('role', 'student');
            formData.append('account_type', 'student');
            formData.append('education_level', educationLevel);
            if (!proofFile) {
                setError('Verification Error: Proof document required.');
                return;
            }
            formData.append('proof_file', proofFile);
        } else if (userType === 'uploader') {
            formData.append('role', 'uploader');
            formData.append('account_type', 'regular');
            formData.append('education_level', 'none');
        } else {
            formData.append('role', 'student');
            formData.append('account_type', 'regular');
            formData.append('education_level', 'none');
        }

        try {
            const response = await axios.post(`${API_URL}/auth/register`, formData);
            setSuccess(response.data.message || 'Registration successful!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Check details.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-md w-full space-y-12 bg-white p-12 rounded-[50px] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-slate-50 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="text-center">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
                        {step === 1 ? 'Join Us' : 'Verify Email'}
                    </h2>
                    <p className="text-[10px] font-black text-[#005587] uppercase tracking-[0.4em]">
                        {step === 1 ? 'Establish your identity' : 'Enter the 6-digit code'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-3xl animate-bounce">
                        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest text-center">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl animate-in zoom-in-95">
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-center">{success}</p>
                    </div>
                )}

                {step === 1 ? (
                    <form className="mt-8 space-y-8" onSubmit={handleSendOtp}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Identity</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="appearance-none block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5" placeholder="Name" required />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Access</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5" placeholder="Email" required />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Secret Key</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5" placeholder="Min 6 characters" required minLength="6" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-6 flex items-center text-lg">{showPassword ? '🙈' : '👁️'}</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Engagement Type</label>
                                <select value={userType} onChange={(e) => setUserType(e.target.value)} className="appearance-none block w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5">
                                    <option value="student">Student (Promo Applied)</option>
                                    <option value="regular">Regular Citizen</option>
                                    <option value="uploader">Verified Author</option>
                                </select>
                            </div>

                            {userType === 'student' && (
                                <div className="bg-blue-50/50 p-8 rounded-[35px] border border-blue-100 space-y-6 animate-in slide-in-from-top-8 duration-700">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[#005587] font-black text-[10px] uppercase tracking-[0.2em]">Verification</h4>
                                        <span className="bg-[#005587] text-white text-[8px] px-2 py-0.5 rounded-full font-black tracking-widest">REQUIRED</span>
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional ID Upload</label>
                                        <input type="file" onChange={(e) => setProofFile(e.target.files[0])} className="block w-full text-[10px] text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#005587] file:text-white hover:file:bg-black transition-all cursor-pointer" accept="image/*,.pdf" required />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Tier</label>
                                        <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="appearance-none block w-full px-6 py-4 border border-slate-200 rounded-2xl bg-white font-black text-[10px] uppercase tracking-widest focus:outline-none">
                                            <option value="tertiary">Higher Education (20% Off)</option>
                                            <option value="secondary">Basic Education (15% Off)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isSending} className="w-full py-6 bg-[#005587] text-white rounded-[30px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-200 hover:bg-black hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSending ? 'Sending Code...' : 'Send Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8 space-y-8" onSubmit={handleCompleteRegistration}>
                        <div className="bg-blue-50/50 p-8 rounded-[35px] border border-blue-100 text-center space-y-4">
                            <div className="w-16 h-16 bg-[#005587]/10 rounded-2xl flex items-center justify-center mx-auto text-3xl">📧</div>
                            <p className="text-[11px] text-slate-600 font-bold">A 6-digit code was sent to</p>
                            <p className="text-sm font-black text-[#005587]">{email}</p>
                        </div>

                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-center">Verification Code</label>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="appearance-none block w-full px-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl font-black text-2xl text-center tracking-[0.4em] transition-all focus:outline-none focus:ring-4 focus:ring-[#005587]/5"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        <button type="submit" className="w-full py-6 bg-[#005587] text-white rounded-[30px] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-200 hover:bg-black hover:scale-[1.02] transition-all active:scale-95">
                            Complete Registration
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={cooldown > 0 || isSending}
                                className="text-[10px] font-black text-[#005587] uppercase tracking-widest hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {isSending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center pt-10 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Already have access? <Link to="/login" className="text-red-600 hover:text-black transition-colors">Authorize Here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
