import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import PaymentModal from './PaymentModal';
import SuccessCelebration from './SuccessCelebration';

const API_URL = 'http://localhost:8080';

function ResourceDetail() {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');

    const fetchResourceDetails = useCallback(async () => {
        const token = authService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_URL}/book/${id}`, { headers });
        setResource(response.data);
    }, [id]);

    useEffect(() => {
        const run = async () => {
            try {
                await fetchResourceDetails();
            } catch (error) {
                setActionError('Failed to load book details.');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [fetchResourceDetails]);

    const handleOpenMaterial = async () => {
        setActionError('');
        setActionMessage('');

        const token = authService.getToken();
        if (!token) {
            setActionError('Please sign in to open books.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/book/${id}/open`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const openUrl = response.data.open_url?.startsWith('http')
                ? response.data.open_url
                : `${API_URL}/${response.data.open_url}`;
            window.open(openUrl, '_blank', 'noopener,noreferrer');
            setActionMessage('Book opened successfully.');
            await fetchResourceDetails();
        } catch (error) {
            setActionError(error.response?.data?.error || 'Unable to open book.');
        }
    };

    const handleConfirmPayment = async (method) => {
        setActionError('');
        setActionMessage('');
        setIsPaymentModalOpen(false);

        const token = authService.getToken();
        if (!token) {
            setActionError('Please sign in to purchase premium books.');
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/book/${id}/purchase`,
                { payment_method: method },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCelebrationMessage(response.data.message || 'Purchase successful!');
            setIsCelebrationOpen(true);
            await fetchResourceDetails();
        } catch (error) {
            setActionError(error.response?.data?.error || 'Purchase failed.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005587]"></div>
        </div>
    );

    if (!resource) return (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase">Book Not Found</h2>
            <Link to="/" className="text-[#005587] font-bold uppercase text-xs hover:underline">Return to Catalog</Link>
        </div>
    );

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

    const renderBookCover = (res, heightClass = "h-64") => {
        if (res.cover_image_path) {
            return (
                <div className={`${heightClass} relative overflow-hidden group/cover`}>
                    <img 
                        src={`http://localhost:8080/${res.cover_image_path}`} 
                        alt={res.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/cover:bg-black/0 transition-all"></div>
                </div>
            );
        }

        return (
            <div className={`${heightClass} bg-gradient-to-br ${getPlaceholderGradient(res.title)} relative overflow-hidden flex items-center justify-center p-10 text-center group/cover`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <h4 className="text-white font-black text-2xl uppercase tracking-tighter leading-tight drop-shadow-2xl z-10 line-clamp-2">
                    {res.title}
                </h4>
                <div className="absolute bottom-6 right-8 opacity-30 text-white text-6xl font-black italic select-none">
                    {res.material_type === 'book' ? 'OER' : 'RES'}
                </div>
            </div>
        );
    };

    const access = resource.access || {};
    const canAccessFull = Boolean(access.can_access_full);
    const requiresPurchase = Boolean(access.requires_purchase);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
                price={access.discounted_price || access.listed_price}
                bookTitle={resource.title}
            />

            <SuccessCelebration 
                isOpen={isCelebrationOpen}
                message={celebrationMessage}
                onClose={() => setIsCelebrationOpen(false)}
                type="purchase"
            />

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-100">
                <div className="relative">
                    {renderBookCover(resource)}
                    <div className="absolute bottom-6 left-8 flex gap-3 z-20">
                        <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#005587] shadow-sm border border-slate-100">
                            {resource.section_name}
                        </span>
                        <span className="bg-red-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                            {resource.file_type}
                        </span>
                        {requiresPurchase && (
                            <span className="bg-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                                Premium ₱{Number(access.listed_price || 0).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-slate-100">
                        <div className="flex-grow">
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight mb-4">{resource.title}</h1>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Author: <span className="text-[#005587]">{resource.uploader_name || 'System'}</span></span>
                                <span>•</span>
                                <span>Part of: <span className="text-slate-600">{resource.course_title}</span></span>
                            </div>
                            {access.open_limit && (
                                <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Open limit: {access.opened_count}/{access.open_limit} (rolling 30 days)
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button
                                onClick={handleOpenMaterial}
                                className="bg-[#005587] hover:bg-[#003d5f] text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-100 text-center uppercase tracking-widest text-xs"
                            >
                                Open Book
                            </button>
                            {requiresPurchase && !canAccessFull && (
                                <div className="flex flex-col gap-2">
                                    {access.discount_percent > 0 && access.listed_price > access.discounted_price && (
                                        <p className="text-[9px] font-bold text-emerald-700 text-center bg-emerald-50 px-3 py-1.5 rounded-xl">
                                            <span className="line-through text-slate-400 mr-1">₱{Number(access.listed_price).toLocaleString()}</span>
                                            Save {access.discount_percent}% (₱{Number(access.listed_price - access.discounted_price).toLocaleString()})
                                        </p>
                                    )}
                                    <button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 text-center uppercase tracking-widest text-xs"
                                    >
                                        Purchase (₱{Number(access.discounted_price || access.listed_price || 0).toLocaleString()})
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {actionError && <p className="mb-4 text-red-600 font-bold text-sm bg-red-50 p-4 rounded-2xl border border-red-100">{actionError}</p>}
                    {actionMessage && <p className="mb-4 text-emerald-700 font-bold text-sm bg-emerald-50 p-4 rounded-2xl border border-emerald-100">{actionMessage}</p>}

                    {!canAccessFull && requiresPurchase && (
                        <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="text-amber-800 font-bold text-sm">
                                You can preview {access.preview_percent || 20}% of this book before purchase.
                            </p>
                            {access.preview_pages && access.total_pages && (
                                <p className="text-amber-700 text-xs mt-2">
                                    Preview pages: {access.preview_pages} of {access.total_pages}.
                                </p>
                            )}
                            {access.discount_percent > 0 && (
                                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                                    <p className="text-emerald-800 font-bold text-sm flex items-center gap-2">
                                        <span>🎉</span>
                                        <span>You save {access.discount_percent}% — </span>
                                        {access.discount_source === 'subscription' ? (
                                            <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">{access.subscription_discount}% Subscriber Benefit</span>
                                        ) : (
                                            <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">Verified Student {access.student_discount}% Off</span>
                                        )}
                                    </p>
                                    <p className="text-emerald-600 text-xs mt-1">
                                        Listed: ₱{Number(access.listed_price).toLocaleString()} → 
                                        <span className="font-black"> ₱{Number(access.discounted_price).toLocaleString()}</span>
                                    </p>
                                </div>
                            )}
                            {access.discount_percent === 0 && (
                                <p className="text-amber-700 text-xs mt-2">
                                    <Link to="/signup" className="font-bold underline">Register as a student</Link> to get up to 20% off, or 
                                    <Link to="/dashboard" className="font-bold underline"> upgrade to Pro+</Link> for 25% off all purchases.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="prose max-w-none">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center md:text-left">Description & Metadata</h3>
                        <div className="mb-4 text-sm text-slate-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <span><strong>Book Author:</strong> {resource.book_author || 'N/A'}</span>
                            <span><strong>ISBN:</strong> {resource.isbn || 'N/A'}</span>
                            <span><strong>Edition:</strong> {resource.edition || 'N/A'}</span>
                            <span><strong>Publisher:</strong> {resource.publisher || 'N/A'}</span>
                            <span><strong>Language:</strong> {resource.language_code || 'N/A'}</span>
                            <span><strong>Pages:</strong> {resource.page_count || 'N/A'}</span>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                            {canAccessFull
                                ? (resource.description || 'No detailed description provided for this book.')
                                : (resource.preview_description || 'Preview content is not available for this book.')}
                        </p>
                    </div>

                    <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
                        <Link to="/" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-[#005587] transition-colors">&larr; Back to Search</Link>
                        <span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest italic">Strictly Verified Open Knowledge</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResourceDetail;
