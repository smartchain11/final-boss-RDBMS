import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import ResourceDetail from './components/ResourceDetail';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import { authService } from './services/authService';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        const interval = setInterval(checkAuth, 1000);
        return () => {
            window.removeEventListener('storage', checkAuth);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
                {}
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
                                    <Link to="/dashboard" className="bg-[#005587] hover:bg-[#003d5f] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-sm transition-all">
                                        Contribute
                                    </Link>
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
                        <Route path="/resource/:id" element={<ResourceDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
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
                                A public digital library of open educational resources. Explore, create, and collaborate with educators around the world to improve curriculum.
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
                                <li><Link to="/" className="hover:text-[#005587]">Search Resources</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-slate-900 font-bold uppercase text-xs tracking-widest mb-6">About</h6>
                            <ul className="space-y-3 text-sm font-medium">
                                <li><Link to="/" className="hover:text-[#005587]">The Project</Link></li>
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