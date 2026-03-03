import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Code2, Clock, AlertCircle, CheckCircle2, Trophy } from 'lucide-react'
import CodeEditor from '../components/CodeEditor'
import ProctorMonitor from '../components/ProctorMonitor'
import { api } from '../lib/api'
import toast, { Toaster } from 'react-hot-toast'

export default function CodingTestPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [question, setQuestion] = useState(null)
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)
    const [elapsedSec, setElapsedSec] = useState(0)
    const [violations, setViolations] = useState([])
    const [testActive, setTestActive] = useState(false)

    // Timer
    useEffect(() => {
        if (!testActive) return
        const interval = setInterval(() => setElapsedSec(s => s + 1), 1000)
        return () => clearInterval(interval)
    }, [testActive])

    // Format time
    const fmtTime = (sec) => {
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        const s = sec % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Load coding question
    useEffect(() => {
        const loadQuestion = async () => {
            try {
                // Fetch specific question if ID provided, else random
                const endpoint = id ? `/code/question/${id}` : '/code/question/random'
                const response = await api.get(endpoint)
                setQuestion(response.data)
                setTestActive(true)
                setLoading(false)
            } catch (err) {
                console.error(err)
                toast.error('Failed to load question')
                setLoading(false)
                // navigate('/coding-practice') // Optional: redirect on error
            }
        }

        loadQuestion()
    }, [id])

    const handleSubmit = (submissionResult) => {
        setResult(submissionResult)
        setTestActive(false)

        if (submissionResult.success) {
            toast.success('All test cases passed! 🎉')
        } else {
            toast.error(`${submissionResult.passed_tests}/${submissionResult.total_tests} test cases passed`)
        }
    }

    const handleViolation = (violation) => {
        setViolations(prev => [...prev, violation])

        if (violation.type === 'tab_switch') {
            toast.error('⚠️ Tab switching detected!', {
                duration: 3000,
                position: 'top-center'
            })
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading question...</p>
                </div>
            </div>
        )
    }

    if (result) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <Toaster />
                <div className="mx-auto max-w-4xl">
                    {/* Result Card */}
                    <div className="rounded-xl border bg-white shadow-sm p-8 text-center">
                        <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full mb-4 ${result.success ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                            {result.success ? (
                                <Trophy className="h-10 w-10 text-green-600" />
                            ) : (
                                <AlertCircle className="h-10 w-10 text-yellow-600" />
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {result.success ? 'Perfect! 🎉' : 'Good Attempt!'}
                        </h1>

                        <p className="text-gray-600 mb-6">
                            {result.success
                                ? 'You passed all test cases!'
                                : `You passed ${result.passed_tests} out of ${result.total_tests} test cases`}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{result.passed_tests}/{result.total_tests}</div>
                                <div className="text-sm text-gray-600">Tests Passed</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{fmtTime(elapsedSec)}</div>
                                <div className="text-sm text-gray-600">Time Taken</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{violations.length}</div>
                                <div className="text-sm text-gray-600">Violations</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                            >
                                Try Another Problem
                            </button>
                            <button
                                onClick={() => navigate('/student')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
            <Toaster />

            {/* Proctoring Monitor (Fixed bottom right) */}
            <ProctorMonitor
                testActive={testActive}
                onViolation={handleViolation}
            />

            {/* Top Header Bar */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    <span className="cursor-pointer hover:text-slate-600" onClick={() => navigate('/coding-practice')}>Practice Problems</span>
                    <span>›</span>
                    <span className="text-orange-500">{question.title || 'Coding Challenge'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{question.title || 'Coding Challenge'}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${question.difficulty === 1 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : question.difficulty <= 3 ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            {question.difficulty === 1 ? 'Easy' : question.difficulty <= 3 ? 'Medium' : 'Hard'}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-mono font-semibold">{fmtTime(elapsedSec)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/coding-practice')}
                            className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors"
                        >
                            ← Back to List
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-semibold transition-colors shadow-sm shadow-orange-500/20"
                            onClick={() => toast('AI Hint coming soon!', { icon: '💡' })}
                        >
                            💡 AI Hint
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Split Pane */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
                {/* Question Panel - Left */}
                <div className="flex flex-col overflow-hidden border-r border-slate-200 bg-white">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 px-2 sticky top-0 bg-white/80 backdrop-blur z-10">
                        {['Description', 'Submissions', 'Solutions'].map((tab) => (
                            <button
                                key={tab}
                                className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${tab === 'Description' ? 'border-orange-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                                onClick={() => tab !== 'Description' && toast(`${tab} tab coming soon!`)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Scrollable Description Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="prose prose-sm max-w-none">
                            <p className="text-slate-700 whitespace-pre-wrap text-[14px] leading-relaxed">
                                {question.description}
                            </p>
                        </div>

                        {/* Sample Test Cases */}
                        {question.test_cases?.filter(tc => !tc.hidden).length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Examples</h3>
                                <div className="space-y-4">
                                    {question.test_cases.filter(tc => !tc.hidden).map((tc, idx) => (
                                        <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                                            <div className="px-4 py-2 border-b border-slate-100 bg-white">
                                                <span className="text-xs font-bold text-orange-500">Example {idx + 1}</span>
                                            </div>
                                            <div className="p-4 font-mono text-[13px] space-y-2">
                                                <div>
                                                    <span className="font-bold text-slate-500 mr-2">Input:</span>
                                                    <code className="text-slate-800">{tc.input}</code>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-500 mr-2">Output:</span>
                                                    <code className="text-slate-800">{tc.expected_output}</code>
                                                </div>
                                                {tc.explanation && (
                                                    <div className="pt-2 mt-2 border-t border-slate-200 text-slate-600 font-sans text-xs">
                                                        <span className="font-bold">Explanation:</span> {tc.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Constraints */}
                        <div className="mt-8 mb-6">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Constraints</h3>
                            <ul className="list-disc pl-5 space-y-1.5 text-[13px] font-mono text-slate-600">
                                {question.constraints?.map((c, i) => (
                                    <li key={i}><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{c}</code></li>
                                )) || (
                                        <>
                                            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">2 &lt;= nums.length &lt;= 10^4</code></li>
                                            <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">-10^9 &lt;= nums[i] &lt;= 10^9</code></li>
                                            <li className="font-sans italic text-slate-500">Only one valid answer exists.</li>
                                        </>
                                    )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Code Editor Panel - Right */}
                <div className="h-full">
                    <CodeEditor
                        question={question}
                        onSubmit={handleSubmit}
                        readonly={!testActive}
                    />
                </div>
            </div>
        </div>
    )
}
