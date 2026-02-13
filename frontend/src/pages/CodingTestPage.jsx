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
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
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
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
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
        <div className="min-h-screen bg-gray-50">
            <Toaster />

            {/* Proctoring Monitor */}
            <ProctorMonitor
                testActive={testActive}
                onViolation={handleViolation}
            />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                            <Code2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Coding Challenge</h1>
                            <p className="text-sm text-gray-600">
                                Difficulty: {question.difficulty === 1 ? 'Easy' : question.difficulty <= 3 ? 'Medium' : 'Hard'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{fmtTime(elapsedSec)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
                    {/* Question Panel - Left Split */}
                    <div className="rounded-xl border bg-white shadow-sm flex flex-col overflow-hidden h-full">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-indigo-600" />
                                Problem Description
                            </h2>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${question.difficulty === 1 ? 'bg-green-100 text-green-700' :
                                question.difficulty <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {question.difficulty === 1 ? 'Easy' : question.difficulty <= 3 ? 'Medium' : 'Hard'}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap font-medium text-base">{question.description}</p>
                            </div>

                            {/* Sample Test Cases */}
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Example Test Cases</h3>
                                <div className="space-y-4">
                                    {question.test_cases.filter(tc => !tc.hidden).map((tc, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-sm space-y-2">
                                                <div>
                                                    <span className="font-semibold text-gray-700 block mb-1">Input:</span>
                                                    <code className="px-2 py-1.5 bg-white rounded border border-gray-300 text-gray-800 block font-mono">
                                                        {tc.input}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-700 block mb-1">Output:</span>
                                                    <code className="px-2 py-1.5 bg-white rounded border border-gray-300 text-gray-800 block font-mono">
                                                        {tc.expected_output}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor Panel - Right Split */}
                    <div className="h-full">
                        <CodeEditor
                            question={question}
                            onSubmit={handleSubmit}
                            readonly={!testActive}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
