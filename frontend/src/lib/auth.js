const TOKEN_KEY = 'skillatics_token'
const USER_KEY = 'skillatics_user'

export function saveAuth(token, user) {
	localStorage.setItem(TOKEN_KEY, token)
	localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
	const raw = localStorage.getItem(USER_KEY)
	try {
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}

export function logout() {
	localStorage.removeItem(TOKEN_KEY)
	localStorage.removeItem(USER_KEY)
}

















