import axios from 'axios';

const useAxios = () => {
    const instance = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    });

    // Request interceptor to attach JWT token dynamically
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle unauthorized sessions globally
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export default useAxios;