import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [recentUploads, setRecentUploads] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');
    const [subjects, setSubjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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

    const renderBookCover = (resource, heightClass = "h-40") => {
        if (resource.cover_image_path) {
            return (
                <div className={`${heightClass} relative overflow-hidden group/cover`}>
                    <img 
                        src={`http://localhost:8080/${resource.cover_image_path}`} 
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/cover:bg-black/0 transition-all"></div>
                </div>
            );
        }

        return (
            <div className={`${heightClass} bg-gradient-to-br ${getPlaceholderGradient(resource.title)} relative overflow-hidden flex items-center justify-center p-6 text-center group/cover`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <h4 className="text-white font-black text-xs uppercase tracking-tighter leading-tight drop-shadow-lg z-10 line-clamp-3">
                    {resource.title}
                </h4>
                <div className="absolute bottom-2 right-2 opacity-30 text-white text-2xl font-black italic select-none">
                    {resource.material_type === 'book' ? 'OER' : 'RES'}
                </div>
            </div>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resResponse = await axios.get('http://localhost:8080/courses');
                setResources(resResponse.data);
                setFilteredResources(resResponse.data);

                const recentResponse = await axios.get('http://localhost:8080/courses/recent');
                setRecentUploads(recentResponse.data);

                const deptResponse = await axios.get('http://localhost:8080/departments');
                const dynamicSubjects = deptResponse.data.map((dept, index) => ({
                    id: dept.dept_id,
                    name: dept.dept_name,
                    icon: ['🔬', '💻', '⚙️', '🎨', '💼', '📊', '📚', '⚖️'][index % 8],
                    color: [
                        'bg-emerald-50 text-emerald-700',
                        'bg-blue-50 text-blue-700',
                        'bg-orange-50 text-orange-700',
                        'bg-purple-50 text-purple-700',
                        'bg-indigo-50 text-indigo-700',
                        'bg-rose-50 text-rose-700',
                        'bg-amber-50 text-amber-700',
                        'bg-cyan-50 text-cyan-700'
                    ][index % 8]
                }));
                setSubjects(dynamicSubjects);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (query, subject = selectedSubject) => {
        setSearchQuery(query);
        let filtered = resources;

        if (query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(lowerQuery) || 
                (r.description && r.description.toLowerCase().includes(lowerQuery)) ||
                (r.uploader_name && r.uploader_name.toLowerCase().includes(lowerQuery))
            );
        }

        if (subject !== 'All Subjects') {
            const subjectObj = subjects.find(s => s.name === subject);
            if (subjectObj) {
                filtered = filtered.filter(r => parseInt(r.dept_id) === parseInt(subjectObj.id));
            }
        }

        setFilteredResources(filtered);
    };

    const handleSubjectFilter = (subjectName) => {
        setSelectedSubject(subjectName);
        handleSearch(searchQuery, subjectName);
    };

    return (
        <div className="flex flex-col">
            
            <section className="bg-slate-50 py-20 border-b border-slate-200">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-[#005587] mb-6 tracking-tight tracking-tighter uppercase">Find Digital Books</h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
                        Search and discover approved digital books, textbooks, and references shared by the community.
                    </p>
                    
                    <div className="max-w-5xl mx-auto bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-2">
                        <div className="flex-grow flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100">
                            <span className="text-slate-400 mr-3">🔍</span>
                            <input 
                                type="text" 
                                className="w-full focus:outline-none font-medium" 
                                placeholder="Search books..." 
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="md:w-64 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100">
                            <select 
                                className="w-full focus:outline-none bg-transparent font-bold text-slate-600 appearance-none"
                                value={selectedSubject}
                                onChange={(e) => handleSubjectFilter(e.target.value)}
                            >
                                <option>All Subjects</option>
                                {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <button 
                            onClick={() => handleSearch(searchQuery)}
                            className="bg-red-700 hover:bg-red-800 text-white font-black px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-black text-slate-900 mb-12 uppercase tracking-widest text-center">Browse by Subject</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <div 
                            onClick={() => handleSubjectFilter('All Subjects')}
                            className={`group cursor-pointer flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 ${selectedSubject === 'All Subjects' ? 'border-[#005587] bg-blue-50' : 'border-slate-100 hover:border-[#005587] hover:shadow-xl'}`}
                        >
                            <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                📚
                            </div>
                            <span className="text-sm font-bold text-slate-700">All Subjects</span>
                        </div>
                        {subjects.map(subject => (
                            <div 
                                key={subject.name} 
                                onClick={() => handleSubjectFilter(subject.name)}
                                className={`group cursor-pointer flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 ${selectedSubject === subject.name ? 'border-[#005587] bg-blue-50' : 'border-slate-100 hover:border-[#005587] hover:shadow-xl'}`}
                            >
                                <div className={`w-16 h-16 ${subject.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {subject.icon}
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-[#005587]">{subject.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {recentUploads.length > 0 && searchQuery === '' && selectedSubject === 'All Subjects' && (
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">✨</span>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">New Arrivals</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recentUploads.map(resource => (
                                <div key={resource.resource_id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-100 group cursor-pointer relative">
                                    {renderBookCover(resource)}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#005587] transition-colors uppercase">
                                            {resource.title}
                                        </h3>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.uploader_name || 'System'}</span>
                                            </div>
                                            <Link to={`/book/${resource.resource_id}`} className="text-[#005587] font-black text-[10px] uppercase tracking-widest hover:underline hover:scale-105 transition-all">Explore &rarr;</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {resources.length > 0 && searchQuery === '' && selectedSubject === 'All Subjects' && (
                <section className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3 mb-10">
                            <span className="text-3xl animate-pulse">🔥</span>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Trending Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...resources].sort((a, b) => (b.opened_count || 0) - (a.opened_count || 0)).slice(0, 4).map(resource => (
                                <div key={resource.resource_id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col border-2 border-red-50 hover:border-red-200 group relative cursor-pointer">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full blur-xl group-hover:bg-red-100 transition-colors"></div>
                                     <div className="relative">
                                         {renderBookCover(resource)}
                                         <div className="absolute top-4 left-4">
                                             <span className="bg-white/90 backdrop-blur-sm text-red-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm shadow-red-100">
                                                 {resource.opened_count || 0} Reads
                                             </span>
                                         </div>
                                         {Number(resource.price || 0) > 0 && (
                                             <div className="absolute top-4 right-4">
                                                 <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                                     ₱{Number(resource.price).toLocaleString()}
                                                 </span>
                                             </div>
                                         )}
                                     </div>
                                    <div className="p-6 flex flex-col flex-grow relative z-10">
                                        <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-red-700 transition-colors uppercase">
                                            {resource.title}
                                        </h3>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.uploader_name || 'System'}</span>
                                            </div>
                                            <Link to={`/book/${resource.resource_id}`} className="text-red-700 font-black text-[10px] uppercase tracking-widest hover:underline hover:scale-105 transition-all">View &rarr;</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
                            {selectedSubject === 'All Subjects' ? 'Public Books' : `${selectedSubject} Books`}
                        </h2>
                        <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">{filteredResources.length} Items</span>
                    </div>

                    {filteredResources.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No books found in this collection.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredResources.map(resource => (
                                <div key={resource.resource_id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-200 group">
                                     <div className="relative">
                                         {renderBookCover(resource)}
                                         <div className="absolute top-4 left-4">
                                             <span className="bg-white/90 backdrop-blur-sm text-[#005587] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                                 {resource.section_name}
                                             </span>
                                         </div>
                                         {Number(resource.price || 0) > 0 && (
                                             <div className="absolute top-4 right-4">
                                                 <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                                     ₱{Number(resource.price).toLocaleString()}
                                                 </span>
                                             </div>
                                         )}
                                     </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#005587] transition-colors uppercase">
                                            {resource.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                             {resource.description || 'Access this digital book shared by the community.'}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-[#005587] uppercase tracking-widest">{resource.uploader_name || 'System'}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{resource.course_title}</span>
                                            </div>
                                            <Link 
                                                to={`/book/${resource.resource_id}`} 
                                                className="text-red-700 font-black text-xs uppercase tracking-widest hover:underline"
                                            >
                                                View &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;
