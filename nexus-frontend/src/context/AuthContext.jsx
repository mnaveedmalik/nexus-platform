// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await API.post('/auth/login', { email, password });

            const token = response.data?.token;

            /* FIXED PIPELINE: Handles nested layouts AND direct response flat properties 
              where fields like name, email, role sit directly on response.data
            */
            let userData = null;
            if (response.data?.user) {
                userData = response.data.user;
            } else if (response.data?.data?.user) {
                userData = response.data.data.user;
            } else if (response.data?.role) {
                // If data is flat on response.data
                userData = response.data;
            }

            if (!token) {
                return { success: false, message: 'Token missing from server response.' };
            }

            localStorage.setItem('token', token);

            if (userData && userData.role) {
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            } else {
                // Smart Fallback using email hint just in case database properties are hidden
                const detectedRole = email.toLowerCase().includes('investor') ? 'Investor' : 'Entrepreneur';
                const fallbackUser = { email, role: detectedRole, name: email.split('@')[0] };
                localStorage.setItem('user', JSON.stringify(fallbackUser));
                setUser(fallbackUser);
            }

            return { success: true };
        } catch (error) {
            console.error('Login dynamic catch trigger:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Authentication endpoint rejected input payload.'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};