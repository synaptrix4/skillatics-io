import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestOtp, verifyOtp } from '../lib/api'
import { saveAuth } from '../lib/auth'
import SectionHeader from '../components/SectionHeader'
import Card from '../components/ui/Card'
import { PrimaryButton } from '../components/ui/Button'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '' })
    const [step, setStep] = useState(1)
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [loading, setLoading] = useState(false)

    function nextStep() {
        setError('')
        setLoading(true)
        requestOtp({ email: form.email, name: form.name, purpose: 'register' })
          .then(() => { setInfo('OTP sent to your email address. Please check your spam folder if you don\'t see it in your inbox.'); setStep(2); })
          .catch(err => { setError(err.response?.data?.error || 'Failed to send OTP'); })
          .finally(() => setLoading(false))
    }

    async function handleVerify(e) {
        e.preventDefault()
        setError(''); setLoading(true)
        try {
            const resp = await verifyOtp({ email: form.email, otp, name: form.name })
            saveAuth(resp.data.token, resp.data.user)
            const role = resp.data.user?.role || 'Student'
            const redirect = role === 'Admin' ? '/admin' : (role === 'TPO' || role === 'Faculty') ? '/faculty' : '/student'
            window.location.href = redirect
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to verify OTP')
        } finally {
            setLoading(false)
        }
    }

    function handleFirst(e) {
        e.preventDefault()
        nextStep()
    }

    return (
        <div className="mx-auto mt-12 w-full max-w-md">
            <SectionHeader eyebrow="Get started" title="Create your account" />
            <Card className="mt-6">
                <p className="text-center text-sm text-gray-600">Register with your email, name, and OTP</p>
                <form onSubmit={step === 1 ? handleFirst : handleVerify} className="mt-6 space-y-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    className="w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
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
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    className="w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring bg-gray-100"
                                    value={form.email}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">OTP</label>
                                <input
                                    type="text"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    className="w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring tracking-widest text-xl text-center"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                                    required
                                />
                            </div>
                        </>
                    )}
                    {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                    {info && <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{info}</div>}
                    <PrimaryButton
                        type="submit"
                        disabled={loading || (step === 2 && (!otp || otp.length !== 6))}
                        className="w-full"
                    >
                        {step === 1 ? (loading ? 'Sending OTP...' : 'Request OTP') : (loading ? 'Verifying...' : 'Verify OTP')}
                    </PrimaryButton>
                </form>
                <div className="mt-4 text-center text-sm">
                    <a href="/login" className="text-indigo-600 hover:underline">Already have an account? Login</a>
                </div>
            </Card>
        </div>
    )
}



