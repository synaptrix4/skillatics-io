import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { requestOtp, verifyOtp } from '../lib/api'
import { saveAuth } from '../lib/auth'
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, GraduationCap, Loader2 } from 'lucide-react'

export default function Login() {
    const location = useLocation()
    const navigate = useNavigate()
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [form, setForm] = useState({ email: '', name: '' })
    const [step, setStep] = useState(1)
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const m = params.get('mode')
        if (m === 'register') setMode('register')
    }, [location.search])

    function nextStep() {
        setError('')
        setLoading(true)
        requestOtp({
            email: form.email,
            purpose: mode,
            ...(mode === 'register' ? { name: form.name } : {})
        }).then(() => {
            setInfo('OTP sent to your email address. Please check your spam folder if you don\'t see it in your inbox.')
            setStep(2)
        }).catch(err => {
            setError(err.response?.data?.error || 'Failed to send OTP')
        }).finally(() => setLoading(false))
    }

    function handleVerify(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        verifyOtp({
            email: form.email,
            otp,
            ...(mode === 'register' ? { name: form.name } : {})
        }).then(resp => {
            saveAuth(resp.data.token, resp.data.user)
            const role = resp.data.user?.role || 'Student'
            const redirect = role === 'Admin' ? '/admin' : (role === 'TPO' || role === 'Faculty') ? '/faculty' : '/student'
            window.location.href = redirect
        }).catch(err => {
            setError(err.response?.data?.error || 'Failed to verify OTP')
        }).finally(() => setLoading(false))
    }

    function handleFirst(e) {
        e.preventDefault()
        setError('') // Clear any previous errors
        nextStep()
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Skillatics</h1>
                    <p className="mt-2 text-gray-600">Master your aptitude skills</p>
                </div>

                {/* Main Card */}
                <div className="rounded-2xl border bg-white p-8 shadow-xl">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {mode === 'login' ? 'Sign in to continue your learning' : 'Join us to start your journey'}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="mb-6 flex items-center justify-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
                        }`}>
                            {step === 1 ? '1' : <CheckCircle2 className="h-5 w-5" />}
                        </div>
                        <div className={`h-1 w-12 rounded ${step === 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            2
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={step === 1 ? handleFirst : handleVerify} className="space-y-5">
                        {step === 1 && (
                            <>
                                {mode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-gray-600"
                                            value={form.email}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            pattern="\d{6}"
                                            maxLength={6}
                                            className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-center text-2xl font-semibold tracking-widest outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 text-center">
                                        Check your email for the 6-digit code
                                    </p>
                                </div>
                            </>
                        )}
                        
                        {/* Alerts */}
                        {error && (
                            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {info && (
                            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                                <span>{info}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || (step === 2 && (!otp || otp.length !== 6))}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {step === 1 ? 'Sending OTP...' : 'Verifying...'}
                                </>
                            ) : (
                                <>
                                    {step === 1 ? 'Send OTP' : 'Verify & Continue'}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <button
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            onClick={() => { 
                                setMode(mode === 'login' ? 'register' : 'login'); 
                                setStep(1); 
                                setForm({ email: '', name: '' }); 
                                setOtp(''); 
                                setError(''); 
                                setInfo(''); 
                            }}
                        >
                            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    )
}


