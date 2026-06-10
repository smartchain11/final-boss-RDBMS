import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm, price, bookTitle }) => {
    const [method, setMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [cardType, setCardType] = useState('Unknown');
    const [error, setError] = useState('');

    useEffect(() => {
        if (method === 'card') {
            const firstDigit = cardNumber.charAt(0);
            if (firstDigit === '4') setCardType('Visa');
            else if (firstDigit === '5') setCardType('Mastercard');
            else if (firstDigit === '3') setCardType('Amex');
            else if (cardNumber.length > 0) setCardType('Invalid');
            else setCardType('Unknown');
        }
    }, [cardNumber, method]);

    useEffect(() => {
        let interval;
        if (isProcessing) {
            setProcessingProgress(0);
            interval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 4;
                });
            }, 80);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const handleConfirm = async () => {
        setError('');
        
        if (method === 'card') {
            if (cardType === 'Invalid' || cardType === 'Unknown') {
                setError('Payment failed: Unrecognized card network.');
                return;
            }
            if (cardNumber.length < 15) {
                setError('Error: Incomplete card number.');
                return;
            }
        } else {
            if (!phoneNumber.startsWith('09') || phoneNumber.length !== 11) {
                setError('Error: Invalid 11-digit mobile number.');
                return;
            }
        }

        setIsProcessing(true);
        setTimeout(() => {
            onConfirm(method);
            setIsProcessing(false);
        }, 2800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                
                {isProcessing ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center min-h-[500px] animate-in fade-in zoom-in-90 duration-700">
                        <div className="w-28 h-28 mb-12 relative">
                            <div className="absolute inset-0 border-[10px] border-slate-50 rounded-full shadow-inner"></div>
                            <div 
                                className="absolute inset-0 border-[10px] border-[#005587] rounded-full border-t-transparent animate-spin"
                                style={{ animationDuration: '0.6s' }}
                            ></div>
                            <div className="absolute inset-4 bg-[#005587]/5 rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-black text-[#005587]">{processingProgress}%</span>
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3">Authenticating</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-12">Verifying simulated gateway...</p>
                        
                        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-[#005587] to-blue-400 h-full transition-all duration-300 ease-out"
                                style={{ width: `${processingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Secure Checkout</h3>
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 hover:rotate-90 rounded-full text-slate-400 transition-all font-bold">✕</button>
                        </div>

                        <div className="mb-10 p-8 bg-gradient-to-br from-[#005587] to-[#003d5f] rounded-[32px] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:scale-150 duration-1000"></div>
                            <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-2">Total Amount</p>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-xl font-bold opacity-70">₱</span>
                                <span className="text-4xl font-black tracking-tight">{Number(price).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] font-bold opacity-60 truncate bg-black/10 px-3 py-1 rounded-full inline-block">{bookTitle}</p>
                        </div>

                        <div className="flex gap-2 mb-10 p-1.5 bg-slate-50 rounded-[22px] border border-slate-100">
                            {['card', 'gcash', 'maya'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => { setMethod(m); setError(''); }}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[16px] transition-all duration-300 ${
                                        method === m ? 'bg-white text-[#005587] shadow-xl shadow-slate-200 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        {error && <div className="mb-8 text-[11px] font-black text-red-600 bg-red-50 p-5 rounded-2xl border border-red-100 animate-bounce">{error}</div>}

                        <div className="space-y-6">
                            {method === 'card' ? (
                                <>
                                    <div className="animate-in fade-in slide-in-from-top-4">
                                        <div className="flex justify-between mb-2 px-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Number</label>
                                            <span className="text-[10px] font-black text-[#005587] uppercase tracking-widest">{cardType}</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#005587]/5 text-sm font-black shadow-inner transition-all"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Expiry</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#005587]/5 text-sm font-black shadow-inner transition-all"
                                                value={expiry}
                                                onChange={(e) => setExpiry(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">CVC</label>
                                            <input
                                                type="password"
                                                placeholder="***"
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#005587]/5 text-sm font-black shadow-inner transition-all"
                                                value={cvc}
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-top-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{method} Connected Number</label>
                                    <input
                                        type="text"
                                        placeholder="09XX XXX XXXX"
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#005587]/5 text-sm font-black shadow-inner transition-all"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            disabled={isProcessing}
                            onClick={handleConfirm}
                            className="w-full mt-12 py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-[0_20px_50px_rgba(0,85,135,0.3)] bg-[#005587] hover:bg-[#003d5f] hover:scale-[1.02] text-white active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                        >
                            Complete Authorization
                        </button>

                        <div className="mt-10 flex items-center justify-center gap-3 opacity-30 grayscale hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center"><span className="text-[10px] text-white font-bold">✓</span></div>
                            <span className="text-[8px] font-black uppercase tracking-widest">Encrypted Simulated environment</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
