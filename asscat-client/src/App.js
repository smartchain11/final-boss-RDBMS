import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import ResourceDetail from './components/ResourceDetail';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import { authService } from './services/authService';
import axios from 'axios';


const API_URL = 'http://localhost:8080';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
    const [notifications, setNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/user/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
            setNotifications(response.data);
        } catch (error) {}
    };

    const handleMarkNotifRead = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/user/notification/read/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchNotifications();
        } catch (err) {}
    };

    const handleMarkAllNotifRead = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/user/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchNotifications();
        } catch (err) {}
    };

    useEffect(() => {
        const checkAuth = () => {
            const auth = authService.isAuthenticated();
            setIsAuthenticated(auth);
            setUserRole(localStorage.getItem('role') || '');
            if (auth) {
                fetchNotifications();
                fetchProfile();
            }
        };

        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get(`${API_URL}/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                const p = res.data;
                // Sync profile data to localStorage for other components
                localStorage.setItem('user_name', p.name);
                localStorage.setItem('role', p.role);
                localStorage.setItem('subscription_tier', p.subscription_tier);
                localStorage.setItem('subscription_expires_at', p.subscription_expires_at);
                localStorage.setItem('promo_discount', p.promo_discount);
                localStorage.setItem('verification_status', p.verification_status);
            } catch (e) {}
        };
        
        checkAuth();
        const interval = setInterval(() => {
            if (authService.isAuthenticated()) {
                fetchNotifications();
                fetchProfile();
            }
        }, 15000); // Check every 15s for faster sync
        
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUserRole('');
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                    <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                        <div className="flex items-center space-x-10">
                            <Link className="flex items-center space-x-2" to="/">
                                <div className="w-10 h-10 bg-[#005587] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-black text-xl">N</span>
                                </div>
                                <span className="text-2xl font-black text-[#005587] tracking-tighter">NECRY<span className="text-red-700">OER</span></span>
                            </Link>
                            
                            <nav className="hidden lg:flex items-center space-x-6 text-sm font-bold text-slate-600 uppercase tracking-wide">
                                <Link className="hover:text-[#005587] transition-colors" to="/">Discover</Link>
                                {isAuthenticated && (
                                    <Link className="hover:text-[#005587] transition-colors" to="/dashboard">My Dashboard</Link>
                                )}
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[#005587] px-4 py-2">Sign In</Link>
                                    <Link to="/signup" className="bg-red-700 hover:bg-red-800 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-all">
                                        Register Now
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    {(userRole === 'admin' || userRole === 'uploader') && (
                                        <Link to="/dashboard" className="bg-[#005587] hover:bg-[#003d5f] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-all text-center">
                                            Contribute
                                        </Link>
                                    )}
                                    
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowNotifPanel(!showNotifPanel)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-95 ${showNotifPanel ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            🔔
                                            {notifications.filter(n => n.is_read === '0').length > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                                    {notifications.filter(n => n.is_read === '0').length}
                                                </span>
                                            )}
                                        </button>

                                        {showNotifPanel && (
                                            <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="p-5 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                                                    <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Notifications</h4>
                                                    <button onClick={handleMarkAllNotifRead} className="text-[8px] font-black text-[#005587] uppercase tracking-widest hover:underline">Clear All</button>
                                                </div>
                                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                                    {notifications.length > 0 ? notifications.map(n => (
                                                        <div 
                                                            key={n.notif_id} 
                                                            className={`p-5 border-b border-slate-50 hover:bg-slate-50/50 transition-all group ${n.is_read === '0' ? 'bg-blue-50/10' : 'opacity-50'}`}
                                                            onClick={() => handleMarkNotifRead(n.notif_id)}
                                                        >
                                                            <h5 className="font-black text-slate-900 text-[10px] mb-1 uppercase tracking-tight">{n.title}</h5>
                                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-2">{n.message}</p>
                                                            <span className="text-[7px] font-bold text-slate-300 uppercase">{new Date(n.created_at).toLocaleTimeString()}</span>
                                                        </div>
                                                    )) : (
                                                        <div className="p-10 text-center text-slate-300 font-black uppercase text-[8px] tracking-widest">Inbox Clean</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleLogout}
                                        className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {}
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/book/:id" element={<ResourceDetail />} />
                        <Route path="/resource/:id" element={<ResourceDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={['student', 'uploader', 'admin']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </main>

                {}
                <footer className="bg-slate-100 border-t border-slate-200 py-16">
                    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-slate-600">
                        <div className="col-span-1 md:col-span-2">
                            <h5 className="text-[#005587] text-xl font-black mb-4">NECRY OPEN KNOWLEDGE</h5>
                            <p className="max-w-md leading-relaxed mb-6">
                                A public digital library of open educational books. Explore, create, and collaborate with educators around the world to improve curriculum.
                            </p>
                            <div className="flex space-x-4">
                                <span className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold hover:bg-[#005587] hover:text-white transition-all cursor-pointer">f</span>
                                <span className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold hover:bg-[#005587] hover:text-white transition-all cursor-pointer">t</span>
                                <span className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold hover:bg-[#005587] hover:text-white transition-all cursor-pointer">in</span>
                            </div>
                        </div>
                        <div>
                            <h6 className="text-slate-900 font-bold uppercase text-xs tracking-widest mb-6">Explore</h6>
                            <ul className="space-y-3 text-sm font-medium">
                                <li><Link to="/" className="hover:text-[#005587]">Curated Collections</Link></li>
                                <li><Link to="/" className="hover:text-[#005587]">Subject Areas</Link></li>
                                <li><Link to="/" className="hover:text-[#005587]">Search Books</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-slate-900 font-bold uppercase text-xs tracking-widest mb-6">About</h6>
                            <ul className="space-y-3 text-sm font-medium">
                                <li><Link to="/" className="hover:text-[#005587]">The Project</Link></li>
                                <li><a href="/downloads/User_Manual_NecryOER.pdf" download className="hover:text-[#005587]">Download User Manual (PDF)</a></li>
                                <li><Link to="/" className="hover:text-[#005587]">Open Education</Link></li>
                                <li><Link to="/" className="hover:text-[#005587]">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-200 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        &copy; 2026 Necry Talkie Project. Built for Open Access and Relational Integrity.
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
