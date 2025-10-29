import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../lib/api'
import { getCurrentUser } from '../lib/auth'
import { saveAuth } from '../lib/auth'

export default function Login() {
    const location = useLocation()
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ email: '', password: '', name: '' })
    const [error, setError] = useState('')

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const m = params.get('mode')
        if (m === 'register') setMode('register')
    }, [location.search])

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		try {
            const resp = mode === 'login'
                ? await apiLogin({ email: form.email, password: form.password })
                : await apiRegister({ name: form.name, email: form.email, password: form.password })
            saveAuth(resp.data.token, resp.data.user)
            const role = resp.data.user?.role || 'Student'
            const redirect = role === 'Admin' ? '/admin' : role === 'TPO/Faculty' ? '/faculty' : '/student'
            window.location.href = redirect
		} catch (err) {
			setError(err.response?.data?.error || 'Request failed')
		}
	}

    return (
        <div className="mx-auto mt-12 w-full max-w-md">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-center text-2xl font-semibold">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-1 text-center text-sm text-gray-600">
                    {mode === 'login' ? 'Sign in to continue' : 'It only takes a minute'}
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {mode === 'register' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Name</label>
                            <input
                                className="w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                    <button
                        type="submit"
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
                    >
                        {mode === 'login' ? 'Login' : 'Create Account'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <button
                        className="text-indigo-600 hover:underline"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    >
                        Switch to {mode === 'login' ? 'Register' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    )
}


