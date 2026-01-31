import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/token/', { email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/profile/');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/profile/', userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  isAuthenticated() {
    return !!this.getAccessToken();
  },
};
