import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { requestOtp, verifyOtp } from '../lib/api'
import { saveAuth } from '../lib/auth'
import Brand from '../components/Brand'
import { Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '' })
    const [step, setStep] = useState(1)
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [loading, setLoading] = useState(false)

    function nextStep() {
        setError('')
        setLoading(true)
        requestOtp({ email: form.email, purpose: 'login' })
            .then(() => { setInfo('Was sent to ' + form.email); setStep(2); })
            .catch(err => { setError(err.response?.data?.error || 'Failed to send OTP'); })
            .finally(() => setLoading(false))
    }

    async function handleVerify(e) {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const resp = await verifyOtp({ email: form.email, otp })
            saveAuth(resp.data.token, resp.data.user)
            const role = resp.data.user?.role || 'Student'
            // Redirect based on role
            const redirect = role === 'Admin' ? '/admin' : (role === 'TPO' || role === 'Faculty') ? '/faculty' : '/student'
            window.location.href = redirect
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleFirst(e) {
        e.preventDefault()
        nextStep()
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white lg:grid lg:grid-cols-2 lg:bg-transparent">
            {/* Left Side - Hero / Visuals */}
            <div className="relative hidden h-full flex-col justify-between bg-zinc-900 p-12 text-white lg:flex">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 to-zinc-900/50"></div>

                <div className="relative z-10 flex items-center gap-2">
                    <Brand className="text-white" size="lg" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed">
                            &ldquo;Skillatics has transformed how our students prepare for their careers. The adaptive tests pinpoint exactly where they need to focus.&rdquo;
                        </p>
                        <footer className="text-sm font-medium text-gray-300">
                            Dr. Emily Chen, Dean of Engineering
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex h-full w-full flex-col items-center justify-center p-8 lg:p-24">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm space-y-8"
                >
                    <div className="space-y-2 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                        <p className="text-gray-500">
                            {step === 1 ? 'Enter your email to sign in to your account' : `Enter the code sent to ${form.email}`}
                        </p>
                    </div>

                    <form onSubmit={step === 1 ? handleFirst : handleVerify} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Service</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">One-Time Password</label>
                                    <input
                                        type="text"
                                        pattern="\d{6}"
                                        maxLength={6}
                                        placeholder="000000"
                                        className="flex h-14 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-3xl tracking-widest ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        required
                                        autoFocus
                                    />
                                    <p className="text-center text-xs text-gray-500">It may take a minute to arrive.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600"
                            >
                                {error}
                            </motion.div>
                        )}

                        {info && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-600"
                            >
                                {info}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (step === 2 && otp.length !== 6)}
                            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary-600 px-8 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {step === 1 ? 'Sign In with Email' : 'Verify & Login'}
                                    {!loading && step === 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm">
                        <Link to="/register" className="font-medium text-primary-600 underline-offset-4 hover:underline">
                            Don't have an account? Sign Up
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}


