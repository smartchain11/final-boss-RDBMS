import React from 'react';
import { Link } from 'react-router-dom';

function Unauthorized() {
    return (
        <div className="container py-5 text-center">
            <div className="card border-0 shadow-sm rounded-4 p-5">
                <div className="text-danger mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-exclamation-octagon" viewBox="0 0 16 16">
                        <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353L4.54.146zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1H5.1z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                </div>
                <h1 className="fw-bold mb-3">Unauthorized Access</h1>
                <p className="text-muted mb-4 fs-5">You do not have permission to view this page. Please contact your administrator if you believe this is an error.</p>
                <Link to="/" className="btn btn-primary btn-lg fw-bold rounded-3 px-5 shadow">Return to Home</Link>
            </div>
        </div>
    );
}

export default Unauthorized;