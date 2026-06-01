import axios from 'axios';

// Instance for Sanctum CSRF and auth
const sanctumApi = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Add CSRF token to requests
sanctumApi.interceptors.request.use((config) => {
    config.headers = config.headers || {};

    // Get CSRF token from cookie
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    
    if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }
    
    return config;
});

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',   // ← Important : seulement le domaine + port
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Interceptor pour le token
api.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Instead of redirect, we'll let the app handle logout
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const exportPdf = async (id: number): Promise<void> => {
    try {
        const response = await api.get(
            `/paies/${id}/pdf`,
            {
                responseType: "blob",
            }
        );

        const url = window.URL.createObjectURL(
            new Blob([response.data], { type: "application/pdf" })
        );

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `bulletin_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Erreur lors du téléchargement du PDF :", error);
    }
};

export { sanctumApi, api, exportPdf };
export default api;