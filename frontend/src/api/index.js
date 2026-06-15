import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
}

// Users
export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  getById: (id) => api.get(`/api/users/${id}`),
  getAll: (query) => api.get('/api/users', { params: { query } }),
  updateProfile: (data) => api.put('/api/users/me', data),
  uploadAvatar: (formData) => api.post('/api/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getLeaderboard: () => api.get('/api/users/leaderboard'),
}

// Skills
export const skillAPI = {
  getMySkills: () => api.get('/api/skills/me'),
  getUserSkills: (id) => api.get(`/api/skills/user/${id}`),
  addSkill: (data) => api.post('/api/skills', data),
  updateSkill: (id, data) => api.put(`/api/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/api/skills/${id}`),
}

// Matches
export const matchAPI = {
  getMatches: () => api.get('/api/matches'),
}

// Swap Requests
export const requestAPI = {
  getMyRequests: () => api.get('/api/requests'),
  sendRequest: (data) => api.post('/api/requests', data),
  updateStatus: (id, status) => api.put(`/api/requests/${id}/status`, { status }),
}

// Sessions
export const sessionAPI = {
  getMySessions: () => api.get('/api/sessions'),
  getUpcoming: () => api.get('/api/sessions/upcoming'),
  bookSession: (data) => api.post('/api/sessions', data),
  completeSession: (id) => api.put(`/api/sessions/${id}/complete`),
  cancelSession: (id) => api.put(`/api/sessions/${id}/cancel`),
}

// Messages
export const messageAPI = {
  sendMessage: (data) => api.post('/api/messages', data),
  getConversation: (userId) => api.get(`/api/messages/conversation/${userId}`),
  getContacts: () => api.get('/api/messages/contacts'),
}

// Reviews
export const reviewAPI = {
  createReview: (data) => api.post('/api/reviews', data),
  getUserReviews: (userId) => api.get(`/api/reviews/user/${userId}`),
}

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAllRead: () => api.put('/api/notifications/read-all'),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
}

// Credits
export const creditAPI = {
  getSummary: () => api.get('/api/credits'),
  getTransactions: () => api.get('/api/credits/transactions'),
}

// Roadmap
export const roadmapAPI = {
  generate: (data) => api.post('/api/roadmap/generate', data),
}

// Admin
export const adminAPI = {
  getAnalytics: () => api.get('/api/admin/analytics'),
  getUsers: () => api.get('/api/admin/users'),
  blockUser: (id) => api.put(`/api/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/api/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getTopSkills: () => api.get('/api/admin/top-skills'),
}

export default api
