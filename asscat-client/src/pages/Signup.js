import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [user, setUser] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/api/register', user)
            .then(() => { alert("Success! Log in now."); navigate('/login'); })
            .catch(() => alert("Signup failed."));
    };

    return (
        <div>
            <h2>NECRY OER - Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input placeholder="Username" onChange={e => setUser({...user, username: e.target.value})} /><br/>
                <input type="password" placeholder="Password" onChange={e => setUser({...user, password: e.target.value})} /><br/>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
export default Signup;