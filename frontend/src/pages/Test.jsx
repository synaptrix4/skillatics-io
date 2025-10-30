import { useEffect, useState } from 'react'
import { startTest, submitAnswer } from '../lib/api'

export default function Test() {
	const [sessionId, setSessionId] = useState(null)
	const [question, setQuestion] = useState(null)
	const [status, setStatus] = useState('idle')
	const [result, setResult] = useState(null)
	const [selected, setSelected] = useState('')
const [typeFilter, setTypeFilter] = useState('')

	async function begin() {
		setStatus('loading')
		try {
			const resp = await startTest(typeFilter ? { type: typeFilter } : {})
			setSessionId(resp.data.sessionId)
			setQuestion(resp.data.question)
			setStatus('active')
		} catch (err) {
			setStatus('error')
		}
	}

	async function submit() {
		if (!selected) return
		const resp = await submitAnswer({ sessionId, questionId: question._id, selectedOption: selected })
		if (resp.data.status === 'complete') {
			setResult(resp.data)
			setQuestion(null)
			setStatus('complete')
		} else {
			setQuestion(resp.data.question)
			setSelected('')
		}
	}

    if (status === 'idle') {
        return (
            <div className="container-page py-8">
                <h2 className="text-2xl font-semibold">Adaptive Test</h2>
                <p className="mt-1 text-sm text-gray-600">Choose a section to begin. You can also take a mixed test.</p>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <h3 className="text-lg font-medium">General Aptitude</h3>
                        <p className="mt-1 text-sm text-gray-600">Quant, logic, reasoning, verbal.</p>
                        <button className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500" onClick={() => { setTypeFilter('General Aptitude'); begin() }}>Start</button>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <h3 className="text-lg font-medium">Technical Aptitude</h3>
                        <p className="mt-1 text-sm text-gray-600">CS fundamentals, coding MCQs, tech concepts.</p>
                        <button className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500" onClick={() => { setTypeFilter('Technical Aptitude'); begin() }}>Start</button>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <h3 className="text-lg font-medium">Mixed</h3>
                        <p className="mt-1 text-sm text-gray-600">Adaptive across all available questions.</p>
                        <button className="mt-3 rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800" onClick={() => { setTypeFilter(''); begin() }}>Start Mixed</button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'active' && question) {
        return (
            <div className="container-page py-8">
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Topic: {question.topic} • Difficulty: {question.difficulty}</div>
                        {typeFilter && <div className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{typeFilter}</div>}
                    </div>
                    <h3 className="mt-2 text-lg font-medium">{question.text}</h3>
                    <div className="mt-3 grid gap-2">
                        {question.options.map(opt => (
                            <label key={opt} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${selected === opt ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                                <input type="radio" name="opt" value={opt} checked={selected === opt} onChange={() => setSelected(opt)} />
                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <button className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50" disabled={!selected} onClick={submit}>Submit Answer</button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'complete') {
        return (
            <div className="container-page py-8">
                <div className="rounded-xl border bg-white p-6 text-center shadow-sm md:max-w-md">
                    <h2 className="text-2xl font-semibold">Test Complete</h2>
                    <div className="mt-3 text-lg">Score: {result?.score} ({result?.correctQuestions}/{result?.totalQuestions})</div>
                    <button className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500" onClick={() => { setStatus('idle'); setResult(null); setSelected(''); setQuestion(null); setSessionId(null) }}>Take Another Test</button>
                </div>
            </div>
        )
    }

return <div className="container-page py-8">Loading...</div>
}










