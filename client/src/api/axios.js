import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.startsWith('/auth/');
        const hadSession = !!localStorage.getItem('token');

        // A 401 from /auth/* is a failed login attempt, not an expired session:
        // let the form show its error instead of reloading the page.
        if (error.response?.status === 401 && hadSession && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;