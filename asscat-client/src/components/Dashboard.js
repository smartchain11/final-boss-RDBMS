import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    
    const [pendingResources, setPendingResources] = useState([]);
    const [myResources, setMyResources] = useState([]);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]); 
    
    const [uploadData, setUploadData] = useState({ title: '', description: '', link: '', dept_id: '', course_id: '' });
    const [file, setFile] = useState(null);

    const [newSubject, setNewSubject] = useState({ dept_name: '', description: '' });
    const [newCourse, setNewCourse] = useState({ title: '', description: '', dept_id: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        if (!token) {
            navigate('/login');
        } else {
            setRole(userRole);
            fetchInitialData();
        }
    }, [navigate]);

    const fetchInitialData = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const res = await axios.get('http://localhost:8080/admin/departments', { headers: { 'Authorization': `Bearer ${token}` } });
            setSubjects(res.data);
        } catch (e) { console.error("Failed to load subjects"); }

        try {
            const res = await axios.get('http://localhost:8080/courses/all');
            setCourses(res.data);
        } catch (e) { console.error("Failed to load courses"); }

        const userRole = localStorage.getItem('role');
        if (userRole === 'admin') {
            fetchPendingResources();
        }
        if (userRole === 'uploader' || userRole === 'admin') {
            fetchMyResources();
        }
    };

    const fetchPendingResources = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8080/admin/resources/pending', { headers: { 'Authorization': `Bearer ${token}` } });
            setPendingResources(response.data);
        } catch (error) {}
    };

    const fetchMyResources = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8080/upload/my', { headers: { 'Authorization': `Bearer ${token}` } });
            setMyResources(response.data);
        } catch (error) {}
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.dept_id) return alert("Please select a Category");
        
        const token = localStorage.getItem('token');
        try {
            const formData = new FormData();
            formData.append('title', uploadData.title);
            formData.append('description', uploadData.description);
            formData.append('link', uploadData.link);
            formData.append('dept_id', uploadData.dept_id);
            if (uploadData.course_id) {
                formData.append('course_id', uploadData.course_id);
            }
            if (file) formData.append('file', file);

            await axios.post('http://localhost:8080/upload/resource', formData, { headers: { 'Authorization': `Bearer ${token}` } });
            alert('Success! Your resource is pending approval.');
            setUploadData({ title: '', description: '', link: '', dept_id: '', course_id: '' });
            setFile(null);
            fetchMyResources();
        } catch (error) { alert(`Upload failed.`); }
    };

    const handleDeleteMyResource = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8080/upload/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchMyResources();
        } catch (error) { alert("Delete failed."); }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/admin/department/add', newSubject, { headers: { Authorization: `Bearer ${token}` } });
            alert("Subject category added!");
            setNewSubject({ dept_name: '', description: '' });
            fetchInitialData();
        } catch (e) { alert("Failed to add subject."); }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Delete this subject category? Warning: This might affect linked courses.")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8080/admin/department/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
        } catch (e) { alert("Delete failed."); }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/admin/course/add', newCourse, { headers: { Authorization: `Bearer ${token}` } });
            alert("Course added!");
            setNewCourse({ title: '', description: '', dept_id: '' });
            fetchInitialData();
        } catch (e) { alert("Failed to add course."); }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8080/admin/course/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
        } catch (e) {}
    };

    const handleResourceAction = async (id, action) => {
        const token = localStorage.getItem('token');
        try {
            if (action === 'approve') {
                await axios.post(`http://localhost:8080/admin/resource/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.delete(`http://localhost:8080/admin/resource/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            }
            fetchPendingResources(); fetchMyResources();
        } catch (err) {}
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                    <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
                        <div className="mx-auto w-20 h-20 bg-[#005587] text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl mb-4 transform -rotate-3">
                            {role ? role[0].toUpperCase() : 'U'}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 capitalize tracking-tight">{role} Dashboard</h3>
                    </div>
                    <div className="p-4 space-y-1">
                        <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[#005587] text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Overview</button>
                        {(role === 'uploader' || role === 'admin') && (
                            <>
                                <button onClick={() => setActiveTab('upload')} className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-[#005587] text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Upload</button>
                                <button onClick={() => setActiveTab('my-resources')} className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'my-resources' ? 'bg-[#005587] text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>My Library</button>
                                <button onClick={() => setActiveTab('manage-content')} className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'manage-content' ? 'bg-[#005587] text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Manage Catalog</button>
                            </>
                        )}
                        {role === 'admin' && (
                            <button onClick={() => setActiveTab('pending')} className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex justify-between items-center ${activeTab === 'pending' ? 'bg-[#005587] text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Review Queue {pendingResources.length > 0 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingResources.length}</span>}</button>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <button onClick={handleLogout} className="w-full px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors">Sign Out</button>
                    </div>
                </div>
            </div>

            
            <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 min-h-[700px]">
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase">Welcome</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                                    <h4 className="text-blue-900 font-black uppercase text-xs mb-4 tracking-widest">Active Library</h4>
                                    <p className="text-blue-800 opacity-70 mb-8">Access and manage verified educational content.</p>
                                    <Link to="/" className="bg-[#005587] text-white font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-[#003d5f] transition-all inline-block shadow-lg shadow-blue-200">Visit Catalog &rarr;</Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase">Contribute Content</h2>
                            <form onSubmit={handleUpload} className="space-y-6 max-w-2xl bg-slate-50 p-10 rounded-3xl border border-slate-200 shadow-sm">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resource Title</label>
                                    <input type="text" className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005587] font-bold" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                                    <textarea className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005587] font-bold min-h-[120px]" value={uploadData.description} onChange={e => setUploadData({...uploadData, description: e.target.value})} placeholder="What is this resource about? (Optional)"></textarea>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Main Subject Category</label>
                                    <select className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none font-bold bg-white uppercase text-xs tracking-widest" value={uploadData.dept_id} onChange={e => setUploadData({...uploadData, dept_id: e.target.value, course_id: ''})} required>
                                        <option value="">Select Subject...</option>
                                        {subjects.map(s => (
                                            <option key={s.dept_id} value={s.dept_id}>{s.dept_name}</option>
                                        ))}
                                    </select>
                                </div>
                                {uploadData.dept_id && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Linked Course (Recommended)</label>
                                        <select className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none font-bold bg-white uppercase text-xs tracking-widest" value={uploadData.course_id} onChange={e => setUploadData({...uploadData, course_id: e.target.value})}>
                                            <option value="">General / No Specific Course</option>
                                            {courses.filter(c => c.dept_id == uploadData.dept_id).map(c => (
                                                <option key={c.course_id} value={c.course_id}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Source URL (Optional)</label>
                                    <input type="url" className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005587] font-bold" value={uploadData.link} onChange={e => setUploadData({...uploadData, link: e.target.value})} />
                                </div>
                                <div className="pt-6 border-t border-slate-200">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">File Upload</label>
                                    <input type="file" className="w-full px-6 py-8 border-2 border-dashed border-slate-200 rounded-xl font-bold text-slate-400" onChange={e => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="w-full bg-[#005587] text-white font-black py-5 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-[#003d5f] transition-all">Submit for Review</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'manage-content' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-16">
                            
                            <section>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">1. Manage Subjects</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 italic">These appear as the main categories on the Home page (e.g. Technology, Science).</p>
                                <form onSubmit={handleAddSubject} className="mb-8 flex flex-col md:flex-row gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <input type="text" placeholder="Subject Name (e.g. Artificial Intelligence)" className="flex-grow px-6 py-4 rounded-xl border border-slate-200 font-bold" value={newSubject.dept_name} onChange={e => setNewSubject({...newSubject, dept_name: e.target.value})} required />
                                    <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Add Subject</button>
                                </form>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {subjects.map(s => (
                                        <div key={s.dept_id} className="p-4 bg-white border border-slate-100 rounded-xl flex justify-between items-center group">
                                            <span className="font-bold text-slate-700 uppercase text-xs tracking-widest">{s.dept_name}</span>
                                            <button onClick={() => handleDeleteSubject(s.dept_id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black uppercase text-[10px]">Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            
                            <section className="pt-16 border-t border-slate-100">
                                <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">2. Manage Specific Courses (Optional)</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 italic">Use these to group related materials under a specific course name.</p>
                                <form onSubmit={handleAddCourse} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <input type="text" placeholder="Course Title (e.g. Intro to Python)" className="px-6 py-4 rounded-xl border border-slate-200 font-bold" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                                    <select className="px-6 py-4 rounded-xl border border-slate-200 font-bold bg-white" value={newCourse.dept_id} onChange={e => setNewCourse({...newCourse, dept_id: e.target.value})} required>
                                        <option value="">Select Subject Category...</option>
                                        {subjects.map(s => <option key={s.dept_id} value={s.dept_id}>{s.dept_name}</option>)}
                                    </select>
                                    <button type="submit" className="md:col-span-2 bg-[#005587] text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#003d5f] transition-all">Add Course Framework</button>
                                </form>
                                <div className="grid grid-cols-1 gap-3">
                                    {courses.map(c => (
                                        <div key={c.course_id} className="p-4 bg-white border border-slate-100 rounded-xl flex justify-between items-center group">
                                            <span className="font-bold text-slate-700 text-sm">{c.title} <span className="text-[10px] text-slate-400 ml-2 uppercase tracking-tighter italic">in {subjects.find(s => s.dept_id == c.dept_id)?.dept_name}</span></span>
                                            <button onClick={() => handleDeleteCourse(c.course_id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all font-black uppercase text-[10px]">Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase">Approval Queue</h2>
                            <div className="space-y-4">
                                {pendingResources.map(res => (
                                    <div key={res.resource_id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{res.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Category: {subjects.find(s => s.dept_id == res.dept_id)?.dept_name || 'General'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleResourceAction(res.resource_id, 'approve')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100">Approve</button>
                                            <button onClick={() => handleResourceAction(res.resource_id, 'delete')} className="bg-red-600 text-white px-6 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'my-resources' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase">My Contributions</h2>
                            <div className="space-y-4">
                                {myResources.map(res => (
                                    <div key={res.resource_id} className="p-6 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${res.is_approved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">{res.title}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.is_approved ? 'Verified' : 'Pending Review'} • {subjects.find(s => s.dept_id == res.dept_id)?.dept_name}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteMyResource(res.resource_id)} className="text-red-400 hover:text-red-600 font-black uppercase text-[10px] tracking-widest">Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;