import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/api/login', { username, password })
            .then(res => {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                window.location.href = '/dashboard';
            }).catch(() => alert("Login Failed"));
    };

    return (
        <div>
            <h2>Faculty Login</h2>
            <form onSubmit={handleLogin}>
                <input placeholder="Username" onChange={e => setUsername(e.target.value)} /><br/><br/>
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br/><br/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;