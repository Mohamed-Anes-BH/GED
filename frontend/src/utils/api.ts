import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token d'accès
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepter les erreurs 401 pour rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et la requête n'a pas encore été retentée
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            // Pas de refresh token, déconnecter l'utilisateur
            throw new Error("No refresh token");
        }
        
        // Demander un nouveau access_token a l'aide du refresh
        const { data } = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
          refresh: refreshToken
        });
        
        // Sauvegarder le nouveau token
        localStorage.setItem('access_token', data.access);
        
        // Retenter la requête originale
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
        
      } catch (err) {
        // En cas d'échec du refresh, déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Redirection agressive (sinon via routing react)
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
