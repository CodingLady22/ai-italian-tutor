import axios from "axios";

const api = axios.create({
    baseURL: 'https://ai-italian-tutor-production.up.railway.app',
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

export default api;