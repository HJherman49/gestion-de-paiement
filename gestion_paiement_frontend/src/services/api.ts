import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

// Attach CSRF token if present in cookies (for cookie-based auth)
api.interceptors.request.use((config) => {
  config.headers = config.headers || {}

  // XSRF token from cookie (Laravel Sanctum)
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = decodeURIComponent(csrfToken)
  }

  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api