import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ResourceDetail() {
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResourceDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/resource/${id}`);
                setResource(response.data);
            } catch (error) {
                console.error("Error fetching resource:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResourceDetails();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005587]"></div>
        </div>
    );

    if (!resource) return (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase">Resource Not Found</h2>
            <Link to="/" className="text-[#005587] font-bold uppercase text-xs hover:underline">Return to Catalog</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-100">
                
                <div className="h-64 bg-slate-100 flex items-center justify-center text-8xl relative border-b border-slate-100">
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    {resource.file_type === 'link' ? '🔗' : '📄'}
                    <div className="absolute bottom-6 left-8 flex gap-3">
                        <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#005587] shadow-sm border border-slate-100">
                            {resource.section_name}
                        </span>
                        <span className="bg-red-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                            {resource.file_type}
                        </span>
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
                        </div>
                        <a 
                            href={resource.file_path.startsWith('http') ? resource.file_path : `http://localhost:8080/${resource.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#005587] hover:bg-[#003d5f] text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-100 text-center uppercase tracking-widest text-xs"
                        >
                            Open Resource
                        </a>
                    </div>

                    <div className="prose max-w-none">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center md:text-left">Description & Metadata</h3>
                        <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                            {resource.description || 'No detailed description provided for this resource.'}
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