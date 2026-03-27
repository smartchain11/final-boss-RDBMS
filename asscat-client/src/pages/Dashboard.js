import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
    const [books, setBooks] = useState([]);
    const [form, setForm] = useState({ title: '', author: '', description: '' });
    const token = localStorage.getItem('token');

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = () => {
        axios.get('http://localhost:8080/api/books').then(res => setBooks(res.data));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/api/books', form, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => { fetchBooks(); setForm({title:'', author:'', description:''}); });
    };

    return (
        <div>
            <h2>Instructor OER Library</h2>
            <form onSubmit={handleAdd}>
                <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input placeholder="Author" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                <button type="submit">Add Resource</button>
            </form>
            <ul>
                {books.map(b => <li key={b.id}>{b.title} by {b.author}</li>)}
            </ul>
        </div>
    );
}
export default Dashboard;