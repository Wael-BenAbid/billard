import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/accounts/login/', { email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/accounts/register/', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/accounts/profile/');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/accounts/profile/', userData);
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
