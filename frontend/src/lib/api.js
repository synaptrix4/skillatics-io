import axios from 'axios'
import { getToken } from './auth'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
	const token = getToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Auth
export const register = (payload) => api.post('/auth/register', payload)
export const login = (payload) => api.post('/auth/login', payload)

// Admin
export const listUsers = () => api.get('/admin/users')
export const addQuestion = (payload) => api.post('/admin/questions', payload)
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role })

// Test engine
export const startTest = (payload) => api.post('/test/start', payload)
export const submitAnswer = (payload) => api.post('/test/submit', payload)

// Data
export const myResults = () => api.get('/data/my-results')
export const batchAnalytics = () => api.get('/data/batch-analytics')
export const myTopicAverages = () => api.get('/data/my-topic-averages')


