import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const API_URL = 'http://localhost:8080';

function AdminDashboard() {
    const [pendingResources, setPendingResources] = useState([]);
    const [message, setMessage] = useState('');

    const fetchPendingResources = async () => {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/admin/books/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setPendingResources(data);
    };

    useEffect(() => {
        fetchPendingResources();
    }, []);

    const handleApprove = async (resourceId) => {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/admin/book/approve/${resourceId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            setMessage('Book approved successfully!');
            fetchPendingResources();
        } else {
            const errorData = await response.json();
            setMessage(`Error: ${errorData.error}`);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard: Pending Book Approvals</h2>
            {message && <p>{message}</p>}
            <ul>
                {pendingResources.map(resource => (
                    <li key={resource.resource_id}>
                        {resource.title} ({resource.file_path})
                        <button onClick={() => handleApprove(resource.resource_id)}>Approve</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminDashboard;
