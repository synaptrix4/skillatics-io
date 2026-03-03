import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { requestOtp, verifyOtp } from '../lib/api'
import { saveAuth } from '../lib/auth'
import Logo from '../components/Logo'
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

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center font-sans selection:bg-orange-500/30 selection:text-orange-900 overflow-hidden">
            <AmbientBackground />
            <AuthNavbar />

            <main className="relative z-10 w-full max-w-md px-4 sm:px-6 mt-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={cardVariants}
                        className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-8 sm:p-10"
                    >
                        <motion.div variants={containerVariants} className="flex flex-col items-center text-center space-y-8">

                            {/* Header Section */}
                            <motion.div variants={itemVariants} className="space-y-3">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
                                <p className="text-slate-500 font-medium">
                                    Sign in to continue your learning
                                </p>
                            </motion.div>

                            {/* Custom Progress Indicators */}
                            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 w-full max-w-[200px] mb-2">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${step >= 1 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-slate-200 text-slate-400'}`}>
                                    {step > 1 ? '✓' : '1'}
                                </div>
                                <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-orange-500' : 'bg-slate-200'}`} />
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${step >= 2 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                    2
                                </div>
                            </motion.div>

                            {/* Form Section */}
                            <form onSubmit={step === 1 ? handleFirst : handleVerify} className="w-full space-y-6">
                                {step === 1 && (
                                    <motion.div variants={itemVariants} className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="w-full px-4 py-4 bg-white/60 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-sm"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div variants={itemVariants} className="space-y-4">
                                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mb-6 flex items-center gap-3">
                                            <div className="text-left flex-1">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Code sent to</p>
                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{form.email}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="ml-auto text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                pattern="\d{6}"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="w-full py-4 text-center text-3xl tracking-[0.5em] font-medium bg-white/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-sm"
                                                value={otp}
                                                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error/Info Alerts */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="rounded-xl bg-red-50/80 border border-red-100 p-4 text-sm font-medium text-red-600 shadow-sm flex items-start gap-3 text-left"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                    {info && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="rounded-xl bg-green-50/80 border border-green-100 p-4 text-sm font-medium text-green-700 shadow-sm flex items-start gap-3 text-left"
                                        >
                                            {info}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <motion.div variants={itemVariants} className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading || (step === 2 && otp.length !== 6)}
                                        className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer overflow-hidden group"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    {step === 1 ? 'Continue with Email' : 'Verify & Login'}
                                                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </motion.div>
                            </form>

                            {/* Footer links */}
                            <motion.div variants={itemVariants} className="w-full pt-6 border-t border-slate-100 text-center">
                                <span className="text-slate-500 text-sm">Don't have an account? </span>
                                <Link to="/register" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                                    Sign Up Instead
                                </Link>
                            </motion.div>

                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}

// --- AMBIENT GLOW BACKGROUND ---
function AmbientBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
            {/* Top Right Orange Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-500/20 blur-[120px]" />
            {/* Bottom Left Amber Glow */}
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-400/20 blur-[130px]" />
            {/* Center soft glow */}
            <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-orange-300/10 blur-[100px]" />

            {/* Noise texture for premium feel */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>
    );
}

// --- FLOATING NAVBAR ---
function AuthNavbar() {
    return (
        <motion.header
            className="fixed top-0 left-0 w-full z-50 py-6"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="container px-4 mx-auto md:px-6 flex justify-center">
                <nav className="mx-auto flex items-center justify-between rounded-full bg-white/80 border border-slate-200/60 backdrop-blur-2xl px-6 py-3 shadow-lg shadow-slate-200/40 w-full max-w-4xl">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group relative z-10 cursor-pointer">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 shadow-md shadow-orange-500/20">
                            <Logo className="h-5 w-auto text-white" />
                        </div>
                        <span className="text-xl font-semibold text-slate-900 tracking-tight">Skillatics</span>
                    </Link>

                    {/* Back to Home CTA */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 cursor-pointer"
                        >
                            <span className="relative flex items-center gap-2">
                                Back to Home
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>
                </nav>
            </div>
        </motion.header>
    );
}
