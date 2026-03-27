const API_URL = 'http://localhost:8080';

export const authService = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getUserRole: () => {
        return localStorage.getItem('role');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};