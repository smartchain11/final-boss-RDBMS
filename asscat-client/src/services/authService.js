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
            localStorage.setItem('user_name', data.name || '');
            localStorage.setItem('role', data.role);
            localStorage.setItem('account_type', data.account_type || 'student');
            localStorage.setItem('education_level', data.education_level || 'none');
            localStorage.setItem('promo_discount', String(data.promo_discount ?? 0));
            localStorage.setItem('verification_status', String(data.verification_status ?? 1));
            localStorage.setItem('subscription_tier', data.subscription_tier || 'free');
            localStorage.setItem('subscription_expires_at', data.subscription_expires_at || '');
            localStorage.setItem('profile_image_path', data.profile_image_path || '');
        }
        return data;
    },

    sendRegistrationOtp: async (email) => {
        const formData = new URLSearchParams();
        formData.append('email', email);
        const response = await fetch(`${API_URL}/auth/register/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
        return data;
    },

    register: async (formData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.errors || 'Registration failed');
        return data;
    },

    forgotPassword: async (email) => {
        const formData = new URLSearchParams();
        formData.append('email', email);
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send reset code');
        return data;
    },

    resetPassword: async (email, code, newPassword) => {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('code', code);
        formData.append('new_password', newPassword);
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Password reset failed');
        return data;
    },

    resendCode: async (email, type = 'email_verify') => {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('type', type);
        const response = await fetch(`${API_URL}/auth/resend-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to resend code');
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('role');
        localStorage.removeItem('account_type');
        localStorage.removeItem('promo_discount');
        localStorage.removeItem('education_level');
        localStorage.removeItem('verification_status');
        localStorage.removeItem('subscription_tier');
        localStorage.removeItem('subscription_expires_at');
        localStorage.removeItem('profile_image_path');
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getUserRole: () => {
        return localStorage.getItem('role');
    },

    getUserName: () => {
        return localStorage.getItem('user_name') || '';
    },

    getAccountType: () => {
        return localStorage.getItem('account_type') || 'student';
    },

    getPromoDiscount: () => {
        const value = Number(localStorage.getItem('promo_discount') || '0');
        return Number.isFinite(value) ? value : 0;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};
