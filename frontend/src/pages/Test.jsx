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
			<div style={{ padding: 16 }}>
				<h2>Adaptive Test</h2>
				<div style={{ marginBottom: 8 }}>
					<label>Type (optional): </label>
					<select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
						<option value="">Any</option>
						<option value="Aptitude">Aptitude</option>
						<option value="Technical">Technical</option>
					</select>
				</div>
				<button onClick={begin}>Start Test</button>
			</div>
		)
	}

	if (status === 'active' && question) {
		return (
			<div style={{ padding: 16 }}>
				<h3>Q: {question.text}</h3>
				<div>Topic: {question.topic} | Difficulty: {question.difficulty}</div>
				<ul style={{ listStyle: 'none', padding: 0 }}>
					{question.options.map(opt => (
						<li key={opt}>
							<label>
								<input type="radio" name="opt" value={opt} checked={selected === opt} onChange={() => setSelected(opt)} /> {opt}
							</label>
						</li>
					))}
				</ul>
				<button disabled={!selected} onClick={submit}>Submit Answer</button>
			</div>
		)
	}

	if (status === 'complete') {
		return (
			<div style={{ padding: 16 }}>
				<h2>Test Complete</h2>
				<div>Score: {result?.score} ({result?.correctQuestions}/{result?.totalQuestions})</div>
			</div>
		)
	}

	return <div style={{ padding: 16 }}>Loading...</div>
}


