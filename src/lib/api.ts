import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:8000",
  //baseURL: "http://localhost:8001",
  withCredentials: true,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Also include CSRF token for stateful requests
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 👈 REMOVE the response interceptor completely
// Let your components handle 401 errors individually

export default api;