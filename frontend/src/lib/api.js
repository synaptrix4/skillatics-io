import axios from 'axios'
import { getToken } from './auth'

// Use environment variable for API URL, fallback to relative path for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
	const token = getToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// OTP Auth flows
export const requestOtp = (payload) => api.post('/auth/request-otp', payload)
export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload)
export const updateProfile = (payload) => api.post('/auth/update-profile', payload)
export const refreshToken = () => api.post('/auth/refresh-token')

// Auth
export const register = (payload) => api.post('/auth/register', payload)
export const login = (payload) => api.post('/auth/login', payload)

// Admin
export const listUsers = () => api.get('/admin/users')
export const addQuestion = (payload) => api.post('/admin/questions', payload)
export const uploadQuestionsCsv = (formData) => api.post('/admin/questions/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role })
export const updateUserDepartment = (userId, department) => api.put(`/admin/users/${userId}/department`, { department })
export const generateQuestions = (payload) => api.post('/admin/generate-questions', payload)

// Test engine
export const startTest = (payload) => api.post('/test/start', payload)
export const submitAnswer = (payload) => api.post('/test/submit', payload)
export const finishTest = (payload) => api.post('/test/finish', payload)

// Data
export const myResults = () => api.get('/data/my-results')
export const batchAnalytics = (query = '') => api.get(`/data/batch-analytics${query ? `?${query}` : ''}`)
export const myTopicAverages = () => api.get('/data/my-topic-averages')
export const studentStats = (query = '') => api.get(`/data/student-stats${query ? `?${query}` : ''}`)

// Learning topics (student)
export const fetchTopics = () => api.get('/learn/topics')
export const fetchTopic = (id) => api.get(`/learn/topics/${id}`)
export const fetchTopicQuestions = (id) => api.get(`/learn/topics/${id}/questions`)

// Admin topics CRUD
export const adminListTopics = () => api.get('/admin/topics')
export const adminCreateTopic = (payload) => api.post('/admin/topics', payload)
export const adminUpdateTopic = (id, payload) => api.put(`/admin/topics/${id}`, payload)
export const adminDeleteTopic = (id) => api.delete(`/admin/topics/${id}`)


