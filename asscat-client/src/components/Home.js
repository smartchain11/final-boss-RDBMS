import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resResponse = await axios.get('http://localhost:8080/courses');
                setResources(resResponse.data);
                setFilteredResources(resResponse.data);

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

    const handleSubjectFilter = (subjectName) => {
        setSelectedSubject(subjectName);
        if (subjectName === 'All Subjects') {
            setFilteredResources(resources);
        } else {
            const subject = subjects.find(s => s.name === subjectName);
            if (subject) {
                setFilteredResources(resources.filter(r => parseInt(r.dept_id) === parseInt(subject.id)));
            }
        }
    };

    return (
        <div className="flex flex-col">
            
            <section className="bg-slate-50 py-20 border-b border-slate-200">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-[#005587] mb-6 tracking-tight tracking-tighter uppercase">Find Open Educational Resources</h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
                        Search and discover approved materials, textbooks, and more.
                    </p>
                    
                    <div className="max-w-5xl mx-auto bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-2">
                        <div className="flex-grow flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100">
                            <span className="text-slate-400 mr-3">🔍</span>
                            <input type="text" className="w-full focus:outline-none font-medium" placeholder="Search resources..." />
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
                        <button className="bg-red-700 hover:bg-red-800 text-white font-black px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm">
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

            
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
                            {selectedSubject === 'All Subjects' ? 'Public Resources' : `${selectedSubject} Materials`}
                        </h2>
                        <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">{filteredResources.length} Items</span>
                    </div>

                    {filteredResources.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No resources found in this collection.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredResources.map(resource => (
                                <div key={resource.resource_id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-200 group">
                                    <div className="h-40 bg-slate-200 relative overflow-hidden flex items-center justify-center text-4xl">
                                        {resource.file_type === 'link' ? '🔗' : '📄'}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-sm text-[#005587] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                                {resource.section_name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#005587] transition-colors uppercase">
                                            {resource.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                            {resource.description || 'Access this open educational resource shared by the community.'}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-[#005587] uppercase tracking-widest">{resource.uploader_name || 'System'}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{resource.course_title}</span>
                                            </div>
                                            <Link 
                                                to={`/resource/${resource.resource_id}`} 
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