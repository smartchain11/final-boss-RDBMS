import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import PaymentModal from './PaymentModal';
import SuccessCelebration from './SuccessCelebration';
import PasswordResetModal from './PasswordResetModal';

const API_URL = 'http://localhost:8080';

function Dashboard() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');
    const [role, setRole] = useState(localStorage.getItem('role') || '');
    const [subscriptionTier, setSubscriptionTier] = useState(localStorage.getItem('subscription_tier') || 'free');
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(localStorage.getItem('subscription_expires_at') || null);
    const [promoDiscount, setPromoDiscount] = useState(parseFloat(localStorage.getItem('promo_discount') || '0'));
    const [verificationStatus, setVerificationStatus] = useState(localStorage.getItem('verification_status') || '1');
    const [profileImage, setProfileImage] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    
    const [pendingResources, setPendingResources] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [myResources, setMyResources] = useState([]);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]); 
    const [activityHistory, setActivityHistory] = useState([]);
    const [earningsData, setEarningsData] = useState({ total_earnings: 0, sales_count: 0, sales_history: [] });
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchMyResources, setSearchMyResources] = useState('');
    const [purchases, setPurchases] = useState([]);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');
    const [resetUser, setResetUser] = useState(null);

    const [withdrawalForm, setWithdrawalForm] = useState({ amount: '', account_id: '' });
    const [payoutInfo, setPayoutInfo] = useState(null);
    const [showPayoutSetup, setShowPayoutSetup] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const [payoutSetupForm, setPayoutSetupForm] = useState({ payout_method: 'gcash', payout_account: '', payout_name: '', pin: '', confirm_pin: '', card_number: '', expiry_date: '', cvv: '' });
    const [addAccountForm, setAddAccountForm] = useState({ account_type: 'gcash', account_number: '', account_name: '', card_number: '', expiry_date: '', cvv: '' });
    const [showAddAccount, setShowAddAccount] = useState(false);

    const subscriptionOptions = [
        { id: 'pro', name: 'Pro Plan', price: 499, description: '50 opens/mo, downloads allowed, and 10% off all purchases.' },
        { id: 'pro_plus', name: 'Pro+ Plan', price: 899, description: 'Unlimited opens, downloads allowed, and 25% off all purchases.' }
    ];
    
    const [uploadData, setUploadData] = useState({
        title: '', description: '', link: '', dept_id: '', course_id: '', price: '',
        book_author: '', isbn: '', edition: '', publisher: '', page_count: '',
        free_preview_pages: '', language_code: '',
    });
    const [file, setFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [reProofFile, setReProofFile] = useState(null);

    const [newSubject, setNewSubject] = useState({ dept_name: '', description: '' });
    const [newCourse, setNewCourse] = useState({ title: '', description: '', dept_id: '' });

    const handleLogout = useCallback(() => {
        authService.logout();
        localStorage.clear();
        window.location.href = '/login';
    }, []);

    const fetchPendingResources = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/admin/books/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
            setPendingResources(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchAllUsers = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            setUsers(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchPendingUsers = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/admin/users/unverified`, { headers: { 'Authorization': `Bearer ${token}` } });
            setPendingUsers(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchMyResources = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/upload/my`, { headers: { 'Authorization': `Bearer ${token}` } });
            setMyResources(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchActivityHistory = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/user/history`, { headers: { 'Authorization': `Bearer ${token}` } });
            setActivityHistory(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchEarnings = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/user/earnings`, { headers: { 'Authorization': `Bearer ${token}` } });
            setEarningsData(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchWithdrawals = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/user/withdrawal/history`, { headers: { 'Authorization': `Bearer ${token}` } });
            setWithdrawalHistory(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchPayoutInfo = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/user/payout/info`, { headers: { 'Authorization': `Bearer ${token}` } });
            setPayoutInfo(response.data);
            if (!response.data.has_setup) setShowPayoutSetup(true);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const fetchPurchases = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_URL}/user/purchases`, { headers: { 'Authorization': `Bearer ${token}` } });
            setPurchases(response.data);
        } catch (error) { if (error.response?.status === 401) handleLogout(); }
    }, [handleLogout]);

    const handleVerifyUser = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/admin/user/verify/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchPendingUsers();
            fetchAllUsers();
        } catch (err) { alert('Verification failed'); }
    };

    const handleRejectUser = async (id) => {
        if (!window.confirm('Reject this user? They will be locked out of promo discounts but can re-apply up to 3 times total.')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/admin/user/reject/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchPendingUsers();
            fetchAllUsers();
        } catch (err) { alert('Rejection failed'); }
    };

    const fetchInitialData = useCallback(async () => {
        const token = localStorage.getItem('token');
        
        try {
            const profileRes = await axios.get(`${API_URL}/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
            const p = profileRes.data;
            setUserName(p.name);
            setRole(p.role);
            setSubscriptionTier(p.subscription_tier);
            setSubscriptionExpiresAt(p.subscription_expires_at);
            setPromoDiscount(parseFloat(p.promo_discount || '0'));
            setVerificationStatus(String(p.verification_status));
            
            localStorage.setItem('user_name', p.name);
            localStorage.setItem('role', p.role);
            localStorage.setItem('education_level', p.education_level);
            localStorage.setItem('subscription_tier', p.subscription_tier);
            localStorage.setItem('subscription_expires_at', p.subscription_expires_at);
            localStorage.setItem('promo_discount', p.promo_discount);
            localStorage.setItem('verification_status', p.verification_status);
        } catch (e) { if (e.response?.status === 401) handleLogout(); }

        try {
            const res = await axios.get(`${API_URL}/user/departments`, { headers: { 'Authorization': `Bearer ${token}` } });
            setSubjects(res.data);
        } catch (e) {}

        try {
            const res = await axios.get(`${API_URL}/courses/all`);
            setCourses(res.data);
        } catch (e) {}

        const userRole = localStorage.getItem('role');
        if (userRole === 'admin') {
            fetchPendingResources();
            fetchAllUsers();
            fetchPendingUsers();
        }
        if (userRole === 'uploader') {
            fetchMyResources();
            fetchEarnings();
            fetchWithdrawals();
        }
        fetchActivityHistory();
    }, [fetchMyResources, fetchPendingResources, fetchPendingUsers, fetchActivityHistory, fetchEarnings, fetchWithdrawals, fetchAllUsers, handleLogout]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            const savedImg = localStorage.getItem('profile_image_path');
            setProfileImage(savedImg ? (savedImg.startsWith('http') ? savedImg : `${API_URL}/${savedImg}`) : '');
            fetchInitialData();
        }
    }, [fetchInitialData, navigate]);

    useEffect(() => {
        if (activeTab === 'purchased') fetchPurchases();
        if (activeTab === 'earnings') { fetchPayoutInfo(); fetchWithdrawals(); }
    }, [activeTab, fetchPurchases, fetchPayoutInfo, fetchWithdrawals]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'earnings') { fetchPayoutInfo(); fetchWithdrawals(); }
            if (activeTab === 'history') fetchActivityHistory();
            if (activeTab === 'purchased') fetchPurchases();
            fetchInitialData(); // Periodic profile sync
        }, 15000);
        return () => clearInterval(interval);
    }, [activeTab, fetchWithdrawals, fetchPayoutInfo, fetchActivityHistory, fetchPurchases, fetchInitialData]);

    const handleProfileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('profile_image', file);
        try {
            const response = await axios.post(`${API_URL}/user/profile-image`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            const newPath = response.data.profile_image_path;
            localStorage.setItem('profile_image_path', newPath);
            setProfileImage(`${API_URL}/${newPath}`);
        } catch (error) { alert('Upload Error'); }
    };

    const handleUpgrade = async (method) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_URL}/auth/upgrade`, {
                tier: selectedTier.id, payment_method: method
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            setIsPaymentModalOpen(false);
            setCelebrationMessage(response.data.message);
            setIsCelebrationOpen(true);
            
            localStorage.setItem('subscription_tier', response.data.tier);
            localStorage.setItem('subscription_expires_at', response.data.expires_at);
            setSubscriptionTier(response.data.tier);
            setSubscriptionExpiresAt(response.data.expires_at);
            setActiveTab('overview');
            fetchActivityHistory();
        } catch (error) { alert('Upgrade Failed'); }
    };

    const handleOpenPinModal = (e) => {
        e.preventDefault();
        if (!withdrawalForm.account_id) return alert('Select a payout account.');
        if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) < 100) return alert('Minimum withdrawal is ₱100.00');
        setPinInput('');
        setPinError('');
        setIsPinModalOpen(true);
    };

    const handleConfirmWithdrawal = async () => {
        if (!/^\d{6}$/.test(pinInput)) {
            setPinError('PIN must be exactly 6 digits.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/user/withdrawal/request`, { ...withdrawalForm, pin: pinInput }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Withdrawal queued. Processing (3m)');
            setWithdrawalForm({ amount: '', account_id: '' });
            setPinInput('');
            setIsPinModalOpen(false);
            fetchWithdrawals();
        } catch (error) { setPinError(error.response?.data?.error || 'Withdrawal failed.'); }
    };

    const handleSavePayoutSetup = async (e) => {
        e.preventDefault();
        if (payoutSetupForm.pin !== payoutSetupForm.confirm_pin) {
            return alert('PINs do not match.');
        }
        if (!/^\d{6}$/.test(payoutSetupForm.pin)) {
            return alert('PIN must be exactly 6 digits.');
        }
        const token = localStorage.getItem('token');
        try {
            const pinRes = await axios.post(`${API_URL}/user/payout/pin`, { pin: payoutSetupForm.pin }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const accRes = await axios.post(`${API_URL}/user/payout/account/add`, {
                account_type: payoutSetupForm.payout_method,
                account_number: payoutSetupForm.payout_account,
                account_name: payoutSetupForm.payout_name,
                card_number: payoutSetupForm.card_number || undefined,
                expiry_date: payoutSetupForm.expiry_date || undefined,
                cvv: payoutSetupForm.cvv || undefined,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Payout setup complete!');
            setShowPayoutSetup(false);
            setPayoutSetupForm({ payout_method: 'gcash', payout_account: '', payout_name: '', pin: '', confirm_pin: '', card_number: '', expiry_date: '', cvv: '' });
            fetchPayoutInfo();
        } catch (error) { alert(error.response?.data?.error || 'Setup failed'); }
    };

    const handleAddPayoutAccount = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/user/payout/account/add`, addAccountForm, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Account added!');
            setAddAccountForm({ account_type: 'gcash', account_number: '', account_name: '', card_number: '', expiry_date: '', cvv: '' });
            setShowAddAccount(false);
            fetchPayoutInfo();
        } catch (error) { alert(error.response?.data?.error || 'Failed to add account.'); }
    };

    const handleDeletePayoutAccount = async (id) => {
        if (!window.confirm('Remove this payout account?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/user/payout/account/delete/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPayoutInfo();
        } catch (error) { alert('Failed to remove account.'); }
    };

    const handleReVerify = async (e) => {
        e.preventDefault();
        if (!reProofFile) return alert('Please select a file');
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('proof_file', reProofFile);
        try {
            const res = await axios.post(`${API_URL}/user/reverify`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message);
            setReProofFile(null);
            fetchInitialData(); // Refresh profile/status
        } catch (err) { alert(err.response?.data?.error || 'Re-submission failed'); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const formData = new FormData();
            Object.keys(uploadData).forEach(key => { if (uploadData[key]) formData.append(key, uploadData[key]); });
            if (file) formData.append('file', file);
            if (coverImage) formData.append('cover_image', coverImage);
            await axios.post(`${API_URL}/upload/book`, formData, { headers: { 'Authorization': `Bearer ${token}` } });
            alert('Uploaded');
            setUploadData({ title: '', description: '', link: '', dept_id: '', course_id: '', price: '', book_author: '', isbn: '', edition: '', publisher: '', page_count: '', free_preview_pages: '', language_code: '' });
            setFile(null); setCoverImage(null); fetchMyResources();
        } catch (error) { alert('Upload Error'); }
    };

    const handleResourceAction = async (id, action) => {
        const token = localStorage.getItem('token');
        try {
            if (action === 'approve') { await axios.post(`${API_URL}/admin/book/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } }); } 
            else { await axios.delete(`${API_URL}/admin/book/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } }); }
            fetchPendingResources(); fetchMyResources();
        } catch (err) {}
    };

    const handleDeleteMyResource = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this resource?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/upload/delete/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMyResources();
        } catch (error) {
            alert('Failed to delete resource');
        }
    };

    const handleUserAction = async (id, action) => {
        const token = localStorage.getItem('token');
        try {
            if (action === 'toggle') {
                await axios.post(`${API_URL}/admin/user/toggle-status/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                fetchAllUsers();
            } else if (action === 'reset') {
                const userToReset = users.find(u => u.user_id === id);
                setResetUser(userToReset);
            }
        } catch (err) {}
    };

    const handleConfirmPasswordReset = async (newPassword) => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API_URL}/admin/user/reset-password/${resetUser.user_id}`, { password: newPassword }, { headers: { Authorization: `Bearer ${token}` } });
            alert(res.data.message);
            setResetUser(null);
            fetchAllUsers();
        } catch (err) { alert('Failed to reset password.'); }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/admin/department/add`, newSubject, { headers: { Authorization: `Bearer ${token}` } });
            setNewSubject({ dept_name: '', description: '' }); fetchInitialData();
        } catch (e) {}
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/admin/course/add`, newCourse, { headers: { Authorization: `Bearer ${token}` } });
            setNewCourse({ title: '', description: '', dept_id: '' }); fetchInitialData();
        } catch (e) {}
    };

    const getPlaceholderGradient = (title) => {
        const colors = [
            'from-blue-600 to-indigo-700',
            'from-emerald-500 to-teal-700',
            'from-purple-600 to-pink-600',
            'from-amber-500 to-orange-600',
            'from-rose-500 to-red-700',
            'from-slate-700 to-slate-900'
        ];
        let hash = 0;
        if (title) {
            for (let i = 0; i < title.length; i++) {
                hash = title.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const renderBookCover = (res, heightClass = "w-16 h-20") => {
        if (res.cover_image_path) {
            return (
                <div className={`${heightClass} relative overflow-hidden rounded-xl shadow-md flex-shrink-0`}>
                    <img 
                        src={`http://localhost:8080/${res.cover_image_path}`} 
                        alt={res.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }

        return (
            <div className={`${heightClass} bg-gradient-to-br ${getPlaceholderGradient(res.title)} relative overflow-hidden flex items-center justify-center p-2 text-center rounded-xl shadow-md flex-shrink-0`}>
                <h4 className="text-white font-black text-[6px] uppercase tracking-tighter leading-none line-clamp-2">
                    {res.title}
                </h4>
            </div>
        );
    };

    return (
        <>
            <style>{`
                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .print-report { display: block !important; }
                }
            `}</style>
            <div className="print:hidden">
                <PaymentModal 
                    isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onConfirm={handleUpgrade}
                    price={selectedTier ? (selectedTier.price * (1 - (promoDiscount / 100))) : 0}
                    bookTitle={`Monthly ${selectedTier?.name}`}
                />
                <SuccessCelebration 
                    isOpen={isCelebrationOpen}
                    message={celebrationMessage}
                    onClose={() => setIsCelebrationOpen(false)}
                    type="upgrade"
                />
                <PasswordResetModal
                    isOpen={!!resetUser}
                    onClose={() => setResetUser(null)}
                    onConfirm={handleConfirmPasswordReset}
                    userName={resetUser?.name}
                />
            </div>

            {isPinModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in print:hidden" onClick={() => setIsPinModalOpen(false)}>
                    <div className="bg-white rounded-[45px] shadow-2xl p-10 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Enter PIN</h3>
                        <p className="text-[10px] font-bold text-slate-400 mb-8">Authorize this withdrawal with your 6-digit payout PIN.</p>
                        <div className="flex justify-center gap-3 mb-6">
                            {[0,1,2,3,4,5].map(i => (
                                <div key={i} className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pinInput.length > i ? 'border-[#005587] bg-blue-50 text-[#005587]' : 'border-slate-200 bg-slate-50'}`}>
                                    {pinInput.length > i ? '•' : ''}
                                </div>
                            ))}
                        </div>
                        <input
                            autoFocus
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-2xl tracking-[0.5em] text-center focus:outline-none focus:ring-4 focus:ring-[#005587]/10 mb-6"
                            value={pinInput}
                            onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                            onKeyDown={e => { if (e.key === 'Enter') handleConfirmWithdrawal(); if (e.key === 'Escape') setIsPinModalOpen(false); }}
                        />
                        {pinError && <p className="text-red-500 text-[10px] font-bold text-center mb-4">{pinError}</p>}
                        <button onClick={handleConfirmWithdrawal} disabled={pinInput.length !== 6} className={`w-full py-5 rounded-[28px] font-black uppercase tracking-widest text-[11px] transition-all shadow-xl ${pinInput.length === 6 ? 'bg-[#005587] text-white hover:bg-black active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>Confirm Withdrawal</button>
                        <button onClick={() => setIsPinModalOpen(false)} className="w-full mt-3 py-3 rounded-2xl text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 md:px-0 print:hidden">
                <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden sticky top-24 transition-all hover:shadow-xl group/card">
                    <div className="p-10 text-center bg-slate-50/50 border-b border-slate-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover/card:scale-150 transition-all duration-1000"></div>
                        <div 
                            className="relative mx-auto w-28 h-28 mb-6 group cursor-pointer" onClick={() => document.getElementById('profileUpload').click()}
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-[35px] shadow-2xl transform group-hover:scale-105 transition-all border-4 border-white active:scale-95" />
                            ) : (
                                <div className="w-full h-full bg-[#005587] text-white rounded-[35px] flex items-center justify-center text-4xl font-black shadow-2xl transform group-hover:scale-105 transition-all active:scale-95">
                                    {userName ? userName[0].toUpperCase() : 'U'}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-[35px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Update</span>
                            </div>
                            <input type="file" id="profileUpload" className="hidden" accept="image/*" onChange={handleProfileUpload} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2">{userName || 'User'}</h3>
                        <p className="text-[10px] font-black text-[#005587] uppercase tracking-[0.2em]">{role}</p>
                    </div>

                    <div className="p-6 space-y-2">
                        <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>Dashboard</button>
                        
                        {role !== 'admin' && (
                            <>
                                <button onClick={() => setActiveTab('purchased')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'purchased' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>My Purchases</button>
                                <button onClick={() => setActiveTab('subscription')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'subscription' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>Upgrade Tier</button>
                                <button onClick={() => setActiveTab('history')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>Activity History</button>
                            </>
                        )}
                        
                        {role === 'uploader' && (
                            <>
                                <button onClick={() => setActiveTab('upload')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>Upload Book</button>
                                <button onClick={() => setActiveTab('my-resources')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-resources' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>My Library</button>
                                <button onClick={() => setActiveTab('earnings')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'earnings' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>
                                    Balance & Payout (₱{Number(earningsData.total_earnings - withdrawalHistory.reduce((sum, w) => sum + (w.status !== 'failed' ? parseFloat(w.amount) : 0), 0)).toLocaleString()})
                                </button>
                            </>
                        )}

                        {role === 'admin' && (
                            <>
                                <button onClick={() => setActiveTab('users')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>User Control</button>
                                <button onClick={() => setActiveTab('verify-users')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all flex justify-between items-center ${activeTab === 'verify-users' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>User Requests {pendingUsers.length > 0 && <span className="bg-[#005587] text-white text-[9px] px-2 py-0.5 rounded-full border border-blue-400/30">{pendingUsers.length}</span>}</button>
                                <button onClick={() => setActiveTab('pending')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all flex justify-between items-center ${activeTab === 'pending' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>Review Queue {pendingResources.length > 0 && <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse">{pendingResources.length}</span>}</button>
                                <button onClick={() => setActiveTab('manage-content')} className={`w-full text-left px-8 py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'manage-content' ? 'bg-[#005587] text-white shadow-2xl shadow-blue-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'}`}>Content Manager</button>
                            </>
                        )}
                    </div>
                    <div className="p-6 border-t border-slate-50">
                        <button onClick={handleLogout} className="w-full px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-red-500 transition-colors">Terminate Session</button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3">
                <div className="bg-white rounded-[50px] shadow-sm border border-slate-100 p-12 min-h-[800px] animate-in fade-in slide-in-from-right-8 duration-700 relative">
                    
                    {verificationStatus === '0' && (
                        <div className="mb-10 p-6 bg-amber-50 border border-amber-100 rounded-[30px] flex items-center gap-6 animate-pulse-slow">
                            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                                ⏳
                            </div>
                            <div>
                                <h4 className="text-amber-900 font-black uppercase text-[10px] tracking-widest mb-1">Identity Under Review</h4>
                                <p className="text-amber-800/70 text-xs font-bold">Your student ID is currently being verified by our team. Some features may be restricted until approval.</p>
                            </div>
                        </div>
                    )}

                    {verificationStatus === '2' && (
                        <div className="mb-10 p-10 bg-red-50 border border-red-100 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-red-500/5 transition-all hover:scale-[1.01]">
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                                ⚠️
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h4 className="text-red-900 font-black uppercase text-xs tracking-widest mb-2">Identity Verification Failed</h4>
                                <p className="text-red-800/70 text-sm font-bold mb-6">Your student ID proof was rejected. You can re-submit a valid ID below to continue.</p>
                                
                                <form onSubmit={handleReVerify} className="flex flex-col sm:flex-row gap-3">
                                    <input 
                                        type="file" 
                                        className="flex-grow bg-white px-6 py-3 rounded-2xl border border-red-200 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                                        onChange={(e) => setReProofFile(e.target.files[0])}
                                        accept="image/*,.pdf"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-red-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/20"
                                    >
                                        Re-submit Proof
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <h2 className="text-5xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group bg-blue-50/50 p-10 rounded-[40px] border border-blue-100 transition-all hover:shadow-2xl hover:shadow-blue-100/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-150 transition-all"></div>
                                        <h4 className="text-blue-900 font-black uppercase text-[10px] mb-6 tracking-[0.3em]">Access Privilege</h4>
                                        <p className="text-blue-800 font-black mb-2 uppercase text-4xl tracking-tighter">{role === 'admin' ? 'SYSTEM ROOT' : subscriptionTier.replace('_', '+ ')}</p>
                                        <p className="text-blue-800/60 font-bold mb-10 text-xs">{role === 'admin' ? 'Root level system permissions.' : (subscriptionTier === 'free' ? 'Standard Public License' : `Valid until ${new Date(subscriptionExpiresAt).toLocaleDateString()}`)}</p>
                                        <Link to="/" className="bg-[#005587] text-white font-black px-10 py-5 rounded-[22px] text-[11px] uppercase tracking-widest hover:bg-[#003d5f] transition-all inline-block shadow-2xl shadow-blue-900/20 active:scale-95">Browse Library &rarr;</Link>
                                    </div>
                                    
                                    {promoDiscount > 0 && (
                                        <div className="group bg-emerald-50/50 p-10 rounded-[40px] border border-emerald-100 transition-all hover:shadow-2xl hover:shadow-emerald-100/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-150 transition-all"></div>
                                            <h4 className="text-emerald-900 font-black uppercase text-[10px] mb-6 tracking-[0.3em]">Verified Benefits</h4>
                                            <p className="text-emerald-800 font-black mb-2 uppercase text-4xl tracking-tighter">{promoDiscount}% OFF</p>
                                            <p className="text-emerald-800/60 font-bold mb-10 text-xs">Active {localStorage.getItem('education_level')} student discount.</p>
                                            <button onClick={() => setActiveTab('subscription')} className="bg-emerald-600 text-white font-black px-10 py-5 rounded-[22px] text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all inline-block shadow-2xl shadow-emerald-900/20 active:scale-95">Use Discount</button>
                                        </div>
                                    )}
                                {role === 'uploader' && (
                                    <div className="group bg-emerald-50/50 p-10 rounded-[40px] border border-emerald-100 transition-all hover:shadow-2xl hover:shadow-emerald-100/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-150 transition-all"></div>
                                        <h4 className="text-emerald-900 font-black uppercase text-[10px] mb-6 tracking-[0.3em]">Net Balance</h4>
                                        <p className="text-emerald-800 font-black mb-2 uppercase text-4xl tracking-tighter">₱{Number(earningsData.total_earnings - withdrawalHistory.reduce((sum, w) => sum + (w.status !== 'failed' ? parseFloat(w.amount) : 0), 0)).toLocaleString()}</p>
                                        <p className="text-emerald-800/60 font-bold mb-10 text-xs">Verified author earnings.</p>
                                        <button onClick={() => setActiveTab('earnings')} className="bg-emerald-600 text-white font-black px-10 py-5 rounded-[22px] text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all inline-block shadow-2xl shadow-emerald-900/20 active:scale-95">Manage Funds</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && role === 'admin' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <h2 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Accounts</h2>
                            <div className="bg-slate-50/30 rounded-[40px] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map(u => (
                                            <tr key={u.user_id} className="hover:bg-white group/row transition-all duration-300">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-900 text-sm tracking-tight">{u.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">{u.email}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[9px] font-black text-[#005587] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{u.role}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {u.role !== 'student' ? (
                                                        <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-[#005587]">Authorized</span>
                                                    ) : Number(u.verification_status) === 1 ? (
                                                        <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Verified Student</span>
                                                    ) : Number(u.verification_status) === 0 ? (
                                                        <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending Review</span>
                                                    ) : (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">Rejected</span>
                                                            <span className="text-[7px] font-bold text-slate-400 uppercase">Attempt {u.verification_attempts}/3</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right space-x-2">
                                                    {u.role !== 'admin' ? (
                                                        <>
                                                            <button onClick={() => handleUserAction(u.user_id, 'toggle')} className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl border transition-all ${u.is_blocked === '1' ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white' : 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'}`}>
                                                                {u.is_blocked === '1' ? 'Restore' : 'Suspend'}
                                                            </button>
                                                            <button onClick={() => handleUserAction(u.user_id, 'reset')} className="text-[9px] font-black uppercase px-4 py-2 rounded-xl border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                                                                Reset Pwd
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Protected</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'verify-users' && role === 'admin' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <h2 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Verification Requests</h2>
                            <div className="bg-slate-50/30 rounded-[40px] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Tier</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID Proof</th>
                                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {pendingUsers.map(u => (
                                            <tr key={u.user_id} className="hover:bg-white group/row transition-all duration-300">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-slate-900 text-sm tracking-tight">{u.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">{u.email}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[9px] font-black text-[#005587] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">{u.education_level}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {u.proof_file_path ? (
                                                        <a href={`${API_URL}/${u.proof_file_path}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-[#005587] uppercase tracking-widest hover:underline flex items-center gap-2">
                                                            <span>📄 View ID Document</span>
                                                            <span className="text-xs">↗</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-300 italic">No File Provided</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right space-x-2">
                                                    <button onClick={() => handleVerifyUser(u.user_id)} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all">Verify</button>
                                                    <button onClick={() => handleRejectUser(u.user_id)} className="bg-red-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all">Reject</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No pending verification requests.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Select Plan</h2>
                                {promoDiscount > 0 && (
                                    <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                                        <span className="text-lg">🎓</span>
                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified Student Discount: {promoDiscount}% Applied</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-10 bg-slate-50/50 rounded-[40px] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Benefit</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Free</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-[#005587] uppercase tracking-[0.2em] text-center bg-blue-50/50">Pro</th>
                                            <th className="px-8 py-5 text-[9px] font-black text-[#005587] uppercase tracking-[0.2em] text-center bg-blue-50/50">Pro+</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="hover:bg-white/50 transition-all">
                                            <td className="px-8 py-4 text-[11px] font-bold text-slate-600">Monthly Price</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-black text-slate-400">₱0</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-black text-[#005587] bg-blue-50/30">₱499</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-black text-[#005587] bg-blue-50/30">₱899</td>
                                        </tr>
                                        <tr className="hover:bg-white/50 transition-all">
                                            <td className="px-8 py-4 text-[11px] font-bold text-slate-600">Material Opens</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-400">5 / 30 days</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-700 bg-blue-50/30">50 / 30 days</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-700 bg-blue-50/30">Unlimited</td>
                                        </tr>
                                        <tr className="hover:bg-white/50 transition-all">
                                            <td className="px-8 py-4 text-[11px] font-bold text-slate-600">Downloads</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-400">❌</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-700 bg-blue-50/30">✅</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-700 bg-blue-50/30">✅</td>
                                        </tr>
                                        <tr className="hover:bg-white/50 transition-all bg-emerald-50/30">
                                            <td className="px-8 py-4 text-[11px] font-bold text-slate-600">
                                                <span className="text-emerald-700">Purchase Discount</span>
                                                <span className="block text-[8px] text-slate-400 font-normal">On paid materials</span>
                                            </td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-slate-400">0%</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-emerald-700 bg-blue-50/30">10% OFF</td>
                                            <td className="px-8 py-4 text-center text-[11px] font-bold text-emerald-700 bg-blue-50/30">25% OFF</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {subscriptionOptions.map(tier => {
                                    const finalPrice = tier.price * (1 - (promoDiscount / 100));
                                    const isCurrent = subscriptionTier === tier.id;
                                    return (
                                        <div key={tier.id} className={`group p-12 rounded-[45px] border-2 transition-all duration-500 relative overflow-hidden ${isCurrent ? 'border-[#005587] bg-blue-50/20 shadow-2xl' : 'border-slate-50 hover:border-blue-100 bg-white hover:shadow-2xl hover:-translate-y-2'}`}>
                                            <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                                                {isCurrent && <span className="bg-[#005587] text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-xl">Active Plan</span>}
                                                {promoDiscount > 0 && !isCurrent && (
                                                    <span className="bg-emerald-500 text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg animate-bounce-slow">
                                                        Student {promoDiscount}% OFF
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 leading-none">{tier.name}</h4>
                                            <p className="text-slate-400 text-sm font-medium mb-4 leading-relaxed h-12 overflow-hidden">{tier.description}</p>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <span>🎁</span>
                                                <span>+ {tier.id === 'pro_plus' ? '25%' : '10%'} off all material purchases</span>
                                            </p>
                                            <div className="mb-12 flex items-baseline gap-1">
                                                <span className="text-sm font-bold text-slate-400">₱</span>
                                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">/ month</span>
                                            </div>
                                            {promoDiscount > 0 && !isCurrent && (
                                                <p className="text-[10px] font-bold text-slate-400 line-through mb-2">Original: ₱{tier.price.toLocaleString()}</p>
                                            )}
                                            <button disabled={isCurrent} onClick={() => { setSelectedTier(tier); setIsPaymentModalOpen(true); }} className={`w-full py-6 rounded-[28px] font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl ${isCurrent ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-[#005587] text-white hover:bg-black hover:shadow-blue-900/20 active:scale-95'}`}>{isCurrent ? 'Current' : 'Activate'}</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'earnings' && role === 'uploader' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Revenue & Cashout</h2>
                                <button 
                                    onClick={() => window.print()}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 no-print"
                                >
                                    <span>🖨️</span>
                                    <span>Print Report</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-[#005587] p-8 rounded-[35px] shadow-2xl shadow-blue-900/20 text-white flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Available Balance</p>
                                        <p className="text-4xl font-black tracking-tight">₱{Number(earningsData.total_earnings - withdrawalHistory.reduce((sum, w) => sum + (w.status !== 'failed' ? parseFloat(w.amount) : 0), 0)).toLocaleString()}</p>
                                    </div>
                                    <div className="pt-6 border-t border-white/10 mt-6">
                                        <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-relaxed">
                                            Withdrawable funds after all successful and pending transactions.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lifetime Revenue</p>
                                        <p className="text-4xl font-black tracking-tight">₱{Number(earningsData.total_earnings).toLocaleString()}</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 mt-6 space-y-3">
                                        <div className="flex justify-between items-center"> 
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales</span> 
                                            <span className="text-sm font-black text-slate-900">{earningsData.sales_count}</span> 
                                        </div>
                                        <div className="flex justify-between items-center"> 
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Cashouts</span> 
                                            <span className="text-sm font-black text-emerald-600">₱{Number(withdrawalHistory.filter(w => w.status === 'withdrawn').reduce((sum, w) => sum + parseFloat(w.amount), 0)).toLocaleString()}</span> 
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {payoutInfo && !payoutInfo.has_pin ? (
                                <div className="mb-8 bg-slate-50/50 p-8 rounded-[35px] border border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Set Up Payout PIN</h3>
                                    <p className="text-[11px] font-bold text-slate-500 mb-6">Create a 6-digit PIN to secure your withdrawals.</p>
                                    <form onSubmit={async (e) => { e.preventDefault(); if (payoutSetupForm.pin !== payoutSetupForm.confirm_pin) return alert('PINs do not match.'); if (!/^\d{6}$/.test(payoutSetupForm.pin)) return alert('PIN must be exactly 6 digits.'); const token = localStorage.getItem('token'); try { await axios.post(`${API_URL}/user/payout/pin`, { pin: payoutSetupForm.pin }, { headers: { 'Authorization': `Bearer ${token}` } }); alert('PIN set! Now add a payout account.'); setPayoutSetupForm({ ...payoutSetupForm, pin: '', confirm_pin: '' }); fetchPayoutInfo(); } catch (error) { alert(error.response?.data?.error || 'Failed.'); } }} className="space-y-4 max-w-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="password" placeholder="6-digit PIN" maxLength="6" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={payoutSetupForm.pin} onChange={e => setPayoutSetupForm({...payoutSetupForm, pin: e.target.value.replace(/\D/g, '')})} required />
                                            <input type="password" placeholder="Confirm PIN" maxLength="6" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={payoutSetupForm.confirm_pin} onChange={e => setPayoutSetupForm({...payoutSetupForm, confirm_pin: e.target.value.replace(/\D/g, '')})} required />
                                        </div>
                                        <button type="submit" className="w-full bg-[#005587] text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#003d5f] active:scale-95 transition-all">Save PIN</button>
                                    </form>
                                </div>
                            ) : payoutInfo && payoutInfo.has_pin && payoutInfo.accounts.length === 0 ? (
                                <div className="mb-8 bg-slate-50/50 p-8 rounded-[35px] border border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Add Your First Payout Account</h3>
                                    <p className="text-[11px] font-bold text-slate-500 mb-6">Add a GCash, Maya, or Bank account (up to 3 per type). Bank accounts require card details.</p>
                                    <form onSubmit={handleAddPayoutAccount} className="space-y-4 max-w-lg">
                                        <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.account_type} onChange={e => setAddAccountForm({...addAccountForm, account_type: e.target.value})}>
                                            <option value="gcash">GCash</option>
                                            <option value="maya">Maya</option>
                                            <option value="bank">Bank Transfer</option>
                                        </select>
                                        <input type="text" placeholder="Account Number" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.account_number} onChange={e => setAddAccountForm({...addAccountForm, account_number: e.target.value})} required />
                                        <input type="text" placeholder="Account Name" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.account_name} onChange={e => setAddAccountForm({...addAccountForm, account_name: e.target.value})} required />
                                        {addAccountForm.account_type === 'bank' && (
                                            <>
                                                <input type="text" placeholder="Card Number" maxLength="19" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.card_number} onChange={e => setAddAccountForm({...addAccountForm, card_number: e.target.value.replace(/\D/g, '')})} required />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input type="text" placeholder="Expiry (MM/YY)" maxLength="5" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.expiry_date} onChange={e => setAddAccountForm({...addAccountForm, expiry_date: e.target.value})} required />
                                                    <input type="password" placeholder="CVV" maxLength="4" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.cvv} onChange={e => setAddAccountForm({...addAccountForm, cvv: e.target.value.replace(/\D/g, '')})} required />
                                                </div>
                                            </>
                                        )}
                                        <button type="submit" className="w-full bg-[#005587] text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#003d5f] active:scale-95 transition-all">Add Account</button>
                                    </form>
                                </div>
                            ) : payoutInfo && payoutInfo.has_pin && payoutInfo.accounts.length > 0 && (
                                <>
                                    <div className="mb-8 bg-slate-50/50 p-8 rounded-[35px] border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Accounts</h3>
                                            <button onClick={() => setShowAddAccount(!showAddAccount)} className="text-[9px] font-black text-[#005587] uppercase tracking-widest hover:underline">{showAddAccount ? 'Cancel' : '+ Add Account'}</button>
                                        </div>
                                        {showAddAccount && (
                                            <form onSubmit={handleAddPayoutAccount} className="space-y-4 max-w-lg mb-8 p-6 bg-white rounded-[28px] border border-slate-100">
                                                <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.account_type} onChange={e => setAddAccountForm({...addAccountForm, account_type: e.target.value})}>
                                                    <option value="gcash">GCash</option>
                                                    <option value="maya">Maya</option>
                                                    <option value="bank">Bank Transfer</option>
                                                </select>
                                                <input type="text" placeholder="Account Number" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.account_number} onChange={e => setAddAccountForm({...addAccountForm, account_number: e.target.value})} required />
                                                <input type="text" placeholder="Account Name" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.account_name} onChange={e => setAddAccountForm({...addAccountForm, account_name: e.target.value})} required />
                                                {addAccountForm.account_type === 'bank' && (
                                                    <>
                                                        <input type="text" placeholder="Card Number" maxLength="19" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.card_number} onChange={e => setAddAccountForm({...addAccountForm, card_number: e.target.value.replace(/\D/g, '')})} required />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <input type="text" placeholder="Expiry (MM/YY)" maxLength="5" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.expiry_date} onChange={e => setAddAccountForm({...addAccountForm, expiry_date: e.target.value})} required />
                                                            <input type="password" placeholder="CVV" maxLength="4" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={addAccountForm.cvv} onChange={e => setAddAccountForm({...addAccountForm, cvv: e.target.value.replace(/\D/g, '')})} required />
                                                        </div>
                                                    </>
                                                )}
                                                <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Add Account</button>
                                            </form>
                                        )}
                                        <div className="space-y-3">
                                            {payoutInfo.accounts.map(acc => (
                                                <div key={acc.account_id} className="flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm">
                                                    <div>
                                                        <span className="text-[9px] font-black text-[#005587] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{acc.account_type}</span>
                                                        <p className="font-bold text-slate-800 text-sm mt-2">{acc.account_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{acc.account_number}</p>
                                                        {acc.account_type === 'bank' && (
                                                            <p className="text-[9px] text-slate-400 font-bold">Card: ****{acc.card_number?.slice(-4)} | Exp: {acc.expiry_date}</p>
                                                        )}
                                                    </div>
                                                    <button onClick={() => handleDeletePayoutAccount(acc.account_id)} className="text-red-400 hover:text-red-600 text-[9px] font-black uppercase tracking-widest transition-all">Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-8 bg-slate-50/50 p-8 rounded-[35px] border border-slate-100">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Withdraw Funds</h3>
                                        <form onSubmit={handleOpenPinModal} className="space-y-4 max-w-lg">
                                            <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={withdrawalForm.account_id} onChange={e => setWithdrawalForm({...withdrawalForm, account_id: e.target.value})} required>
                                                <option value="">Select payout account</option>
                                                {payoutInfo.accounts.map(acc => (
                                                    <option key={acc.account_id} value={acc.account_id}>{acc.account_type.toUpperCase()} — {acc.account_name} ({acc.account_number})</option>
                                                ))}
                                            </select>
                                            <input type="number" placeholder="Amount (Min 100)" className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#005587]/10" value={withdrawalForm.amount} onChange={e => setWithdrawalForm({...withdrawalForm, amount: e.target.value})} required />
                                            <button type="submit" className="w-full bg-[#005587] text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#003d5f] active:scale-95 transition-all">Continue to Verification</button>
                                        </form>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Recent Sales</h3>
                                    <div className="space-y-3">
                                        {earningsData.sales_history.length > 0 ? earningsData.sales_history.map((sale, idx) => (
                                            <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                                <div className="max-w-[150px]">
                                                    <h4 className="font-bold text-slate-700 text-xs truncate">{sale.resource_title}</h4>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(sale.purchased_at).toLocaleDateString()}</p>
                                                </div>
                                                <p className="text-xs font-black text-[#005587]">₱{Number(sale.uploader_amount).toLocaleString()}</p>
                                            </div>
                                        )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-[9px]">No sales yet.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Cashout History</h3>
                                    <div className="space-y-3">
                                        {withdrawalHistory.length > 0 ? withdrawalHistory.map((w, idx) => (
                                            <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{w.method}</span>
                                                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${w.status === 'withdrawn' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                                                            {w.status === 'withdrawn' ? 'Success Withdrawn' : w.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(w.created_at).toLocaleTimeString()}</p>
                                                </div>
                                                <p className="text-xs font-black text-slate-900">-₱{Number(w.amount).toLocaleString()}</p>
                                            </div>
                                        )) : <p className="text-center py-10 text-slate-300 font-bold uppercase text-[9px]">No withdrawals yet.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchased' && role !== 'admin' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">My Purchases</h2>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{purchases.length} item{purchases.length !== 1 ? 's' : ''}</span>
                            </div>
                            {purchases.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {purchases.map(p => (
                                        <Link key={p.resource_id} to={`/book/${p.resource_id}`} className="group p-6 bg-slate-50/50 border border-slate-100 rounded-[35px] flex gap-6 hover:bg-white hover:shadow-xl transition-all hover:-translate-y-1">
                                            <div className="flex-shrink-0">
                                                {renderBookCover(p, "w-20 h-28")}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase leading-tight mb-1 group-hover:text-[#005587] transition-colors truncate">{p.title}</h3>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">by {p.uploader_name || 'Unknown'}</p>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-emerald-700">₱{Number(p.paid_amount).toLocaleString()}</span>
                                                    {Number(p.discount_percent) > 0 && (
                                                        <span className="text-[8px] font-black text-slate-400 line-through">₱{Number(p.listed_price).toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{new Date(p.purchased_at).toLocaleDateString()}</span>
                                                    {p.payment_method && (
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#005587]">{p.payment_method}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24">
                                    <p className="text-6xl mb-6">📚</p>
                                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-3">No purchased materials yet.</p>
                                    <Link to="/" className="inline-block bg-[#005587] text-white font-black px-10 py-5 rounded-[22px] text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl hover:shadow-blue-900/20 active:scale-95">Browse Library &rarr;</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && role !== 'admin' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <h2 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Activity History</h2>
                            <div className="space-y-4">
                                {activityHistory.length > 0 ? activityHistory.map((item, idx) => (
                                    <div key={idx} className="p-6 bg-slate-50/50 rounded-[25px] border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all">
                                        <div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-2 ${
                                                item.transaction_type.startsWith('earning') || item.transaction_type === 'withdrawal_withdrawn' 
                                                ? 'text-emerald-600' 
                                                : 'text-[#005587]'
                                            }`}>
                                                {item.transaction_type === 'withdrawal_withdrawn' ? 'Success Withdrawn' : 
                                                 item.transaction_type === 'earning_material_open' ? 'Incentive Earned' :
                                                 item.transaction_type === 'earning_purchase' ? 'Sale Revenue' :
                                                 item.transaction_type.replace('_', ' ')}
                                            </span>
                                            <h4 className="font-bold text-slate-800 tracking-tight">{item.resource_title || item.note}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(item.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            {item.amount > 0 && <p className="text-lg font-black text-slate-900 tracking-tight">₱{Number(item.amount).toLocaleString()}</p>}
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{item.payment_method || 'system'}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-center py-20 text-slate-400 font-black uppercase text-[10px] tracking-widest">No activity found.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && role === 'uploader' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <h2 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Upload Resource</h2>
                            <form onSubmit={handleUpload} className="space-y-6 bg-slate-50/50 p-10 rounded-[40px] border border-slate-100 shadow-inner">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Book Title <span className="text-red-500">*</span></label>
                                        <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Author</label>
                                        <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.book_author} onChange={e => setUploadData({...uploadData, book_author: e.target.value})} placeholder="Author name" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">ISBN</label>
                                        <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.isbn} onChange={e => setUploadData({...uploadData, isbn: e.target.value})} placeholder="978-3-16-148410-0" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Edition</label>
                                        <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.edition} onChange={e => setUploadData({...uploadData, edition: e.target.value})} placeholder="1st Edition" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Publisher</label>
                                        <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.publisher} onChange={e => setUploadData({...uploadData, publisher: e.target.value})} placeholder="Publisher name" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Page Count</label>
                                        <input type="number" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.page_count} onChange={e => setUploadData({...uploadData, page_count: e.target.value})} placeholder="e.g. 250" min="1" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Language</label>
                                        <input type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.language_code} onChange={e => setUploadData({...uploadData, language_code: e.target.value})} placeholder="e.g. English" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Subject <span className="text-red-500">*</span></label>
                                        <select className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm bg-white transition-all" value={uploadData.dept_id} onChange={e => setUploadData({...uploadData, dept_id: e.target.value, course_id: ''})} required>
                                            <option value="">Select Category...</option>
                                            {subjects.map(s => <option key={s.dept_id} value={s.dept_id}>{s.dept_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Course</label>
                                        <select className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm bg-white transition-all" value={uploadData.course_id} onChange={e => setUploadData({...uploadData, course_id: e.target.value})}>
                                            <option value="">Select Course...</option>
                                            {courses.filter(c => String(c.dept_id) === String(uploadData.dept_id)).map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Price (₱) <span className="text-red-500">*</span></label>
                                        <input type="number" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.price} onChange={e => setUploadData({...uploadData, price: e.target.value})} placeholder="0.00" step="0.01" min="0" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Free Preview Pages</label>
                                        <input type="number" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.free_preview_pages} onChange={e => setUploadData({...uploadData, free_preview_pages: e.target.value})} placeholder="e.g. 10" min="1" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Description</label>
                                        <textarea className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all min-h-[120px]" value={uploadData.description} onChange={e => setUploadData({...uploadData, description: e.target.value})} placeholder="Describe the resource content, target audience, and key topics covered..." />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Cover Image (Optional)</label>
                                        <input type="file" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-xs transition-all bg-white" onChange={e => setCoverImage(e.target.files[0])} accept="image/*" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Resource Link (Optional)</label>
                                        <input type="url" className="w-full px-6 py-5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-[#005587]/10 font-bold text-sm transition-all" value={uploadData.link} onChange={e => setUploadData({...uploadData, link: e.target.value})} placeholder="https://example.com/resource" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">File <span className="text-red-500">*</span> <span className="text-slate-400 font-normal normal-case tracking-normal">(PDF, EPUB, DOCX, MP4, MP3, etc.)</span></label>
                                    <input type="file" className="w-full px-6 py-8 border-2 border-dashed border-slate-300 rounded-3xl font-bold text-slate-500 bg-white cursor-pointer hover:border-[#005587]/50 transition-all" onChange={e => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="w-full bg-[#005587] text-white font-black py-6 rounded-[25px] text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-900/20 hover:bg-[#003d5f] active:scale-95 transition-all mt-4">Submit for Review</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'manage-content' && role === 'admin' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 space-y-16">
                            <section>
                                <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Manage Subjects</h2>
                                <form onSubmit={handleAddSubject} className="mb-8 flex gap-4 bg-slate-50/50 p-8 rounded-[35px] border border-slate-100">
                                    <input type="text" placeholder="Subject Name" className="flex-grow px-6 py-4 rounded-2xl border border-slate-200 font-bold focus:outline-none focus:ring-4 focus:ring-[#005587]/10 transition-all" value={newSubject.dept_name} onChange={e => setNewSubject({...newSubject, dept_name: e.target.value})} required />
                                    <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black hover:scale-[1.02] transition-all">Add</button>
                                </form>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {subjects.map(s => ( <div key={s.dept_id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center group"> <span className="font-bold text-slate-800 uppercase text-xs tracking-widest">{s.dept_name}</span> </div> ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'pending' && role === 'admin' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <h2 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Approval Queue</h2>
                            <div className="space-y-4">
                                {pendingResources.map(res => (
                                    <div key={res.resource_id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[30px] flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="text-center md:text-left"> <h4 className="text-lg font-black text-slate-900 tracking-tight">{res.title}</h4> <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Uploader: <span className="text-[#005587]">{res.uploader_name}</span></p> </div>
                                        <div className="flex gap-3">
                                            <Link to={`/book/${res.resource_id}`} target="_blank" className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all">Review</Link>
                                            <button onClick={() => handleResourceAction(res.resource_id, 'approve')} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all">Approve</button>
                                            <button onClick={() => handleResourceAction(res.resource_id, 'delete')} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all">Reject</button>
                                        </div>
                                    </div>
                                ))}
                                {pendingResources.length === 0 && <p className="text-center py-20 text-slate-400 font-black uppercase text-[10px] tracking-widest">No pending resources.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'my-resources' && role === 'uploader' && (
                        <div className="animate-in fade-in slide-in-from-bottom-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">My Library</h2>
                                <div className="relative w-full md:w-72">
                                    <input 
                                        type="text" 
                                        placeholder="Search materials..." 
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs focus:outline-none focus:ring-4 focus:ring-[#005587]/10 transition-all"
                                        value={searchMyResources}
                                        onChange={(e) => setSearchMyResources(e.target.value)}
                                    />
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {myResources.filter(res => res.title.toLowerCase().includes(searchMyResources.toLowerCase())).map(res => (
                                    <div key={res.resource_id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[35px] flex flex-col md:flex-row justify-between items-center hover:bg-white hover:shadow-xl transition-all group/item gap-6">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            {renderBookCover(res, "w-16 h-24")}
                                            <div className="flex-grow"> 
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-slate-800 text-lg tracking-tight group-hover/item:text-[#005587] transition-colors uppercase leading-none">{res.title}</h4> 
                                                    <div className={`w-2 h-2 rounded-full ${res.is_approved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-orange-500 animate-pulse'}`}></div>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{res.is_approved ? 'Verified Public' : 'Pending Review'}</p> 
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteMyResource(res.resource_id)}
                                            className="px-6 py-3 rounded-xl bg-white border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 shadow-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                                {myResources.length === 0 && <p className="text-center py-20 text-slate-400 font-black uppercase text-[10px] tracking-widest">No resources uploaded yet.</p>}
                                {myResources.length > 0 && myResources.filter(res => res.title.toLowerCase().includes(searchMyResources.toLowerCase())).length === 0 && (
                                    <p className="text-center py-20 text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching materials found.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {role === 'uploader' && (
            <div className="print-report" style={{ display: 'none' }}>
                <div className="max-w-4xl mx-auto p-10">
                    <div className="text-center mb-12 border-b-2 border-slate-900 pb-8">
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Earnings Report</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{userName}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-6 mb-12">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Available</p>
                            <p className="text-2xl font-black">₱{Number(earningsData.total_earnings - withdrawalHistory.reduce((sum, w) => sum + (w.status !== 'failed' ? parseFloat(w.amount) : 0), 0)).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-100 p-6 rounded-2xl">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Lifetime</p>
                            <p className="text-2xl font-black text-slate-900">₱{Number(earningsData.total_earnings).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-100 p-6 rounded-2xl">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Sales Count</p>
                            <p className="text-2xl font-black text-slate-900">{earningsData.sales_count}</p>
                        </div>
                        <div className="bg-slate-100 p-6 rounded-2xl">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Cashouts</p>
                            <p className="text-2xl font-black text-slate-900">₱{Number(withdrawalHistory.filter(w => w.status === 'withdrawn').reduce((sum, w) => sum + parseFloat(w.amount), 0)).toLocaleString()}</p>
                        </div>
                    </div>

                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-3">Sales History</h3>
                    <table className="w-full text-left mb-10 text-[9px]">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Book</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Buyer</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Date</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest text-right">Earned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earningsData.sales_history.filter(s => s.buyer_name && !s.buyer_name.startsWith('System')).map((sale, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-3 pr-4 font-bold text-slate-800">{sale.resource_title}</td>
                                    <td className="py-3 pr-4 text-slate-500">{sale.buyer_name}</td>
                                    <td className="py-3 pr-4 text-slate-500">{new Date(sale.purchased_at).toLocaleDateString()}</td>
                                    <td className="py-3 text-right font-black text-slate-900">₱{Number(sale.uploader_amount).toLocaleString()}</td>
                                </tr>
                            ))}
                            {earningsData.sales_history.filter(s => s.buyer_name && !s.buyer_name.startsWith('System')).length === 0 && (
                                <tr><td colSpan="4" className="py-8 text-center text-slate-300 font-bold">No sales yet.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-3">Open Incentives</h3>
                    <table className="w-full text-left mb-10 text-[9px]">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Book</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">User</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Date</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest text-right">Incentive</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earningsData.sales_history.filter(s => s.buyer_name && s.buyer_name.startsWith('System')).map((inc, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-3 pr-4 font-bold text-slate-800">{inc.resource_title}</td>
                                    <td className="py-3 pr-4 text-slate-500">{inc.buyer_name.replace('System Incentive (', '').replace(')', '')}</td>
                                    <td className="py-3 pr-4 text-slate-500">{new Date(inc.purchased_at).toLocaleDateString()}</td>
                                    <td className="py-3 text-right font-black text-slate-900">₱{Number(inc.uploader_amount).toLocaleString()}</td>
                                </tr>
                            ))}
                            {earningsData.sales_history.filter(s => s.buyer_name && s.buyer_name.startsWith('System')).length === 0 && (
                                <tr><td colSpan="4" className="py-8 text-center text-slate-300 font-bold">No incentives yet.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-3">Cashout History</h3>
                    <table className="w-full text-left mb-10 text-[9px]">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Method</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Account</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest pr-4">Date</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                <th className="py-3 font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawalHistory.map((w, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-3 pr-4 font-bold text-slate-800 uppercase">{w.method}</td>
                                    <td className="py-3 pr-4 text-slate-500">{w.account_name}</td>
                                    <td className="py-3 pr-4 text-slate-500">{new Date(w.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 text-right font-black text-slate-900">₱{Number(w.amount).toLocaleString()}</td>
                                    <td className="py-3 text-right"><span className={`font-black uppercase text-[8px] ${w.status === 'withdrawn' ? 'text-emerald-600' : w.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>{w.status}</span></td>
                                </tr>
                            ))}
                            {withdrawalHistory.length === 0 && (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-300 font-bold">No cashouts yet.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest border-t-2 border-slate-900 pt-6 mt-8">
                        Necry OER Portal — Official Earnings Statement
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default Dashboard;
