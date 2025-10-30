import { useEffect, useRef, useState } from 'react'
import { startTest, submitAnswer } from '../lib/api'

export default function Test() {
	const [sessionId, setSessionId] = useState(null)
	const [question, setQuestion] = useState(null)
	const [status, setStatus] = useState('idle')
	const [result, setResult] = useState(null)
	const [selected, setSelected] = useState('')
	const [typeFilter, setTypeFilter] = useState('')
	const containerRef = useRef(null)
	
	// --- Fullscreen logic ---
	function enterFullscreen() {
		const el = containerRef.current
		if (el && el.requestFullscreen) el.requestFullscreen()
		else if (el && el.webkitRequestFullscreen) el.webkitRequestFullscreen() // Safari
		else if (el && el.mozRequestFullScreen) el.mozRequestFullScreen()      // Firefox
		else if (el && el.msRequestFullscreen) el.msRequestFullscreen()
	}
	function exitFullscreen() {
		if (document.exitFullscreen) document.exitFullscreen()
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
		else if (document.mozCancelFullScreen) document.mozCancelFullScreen()
		else if (document.msExitFullscreen) document.msExitFullscreen()
	}
	// When test becomes active (a question is present and active), go fullscreen
	useEffect(() => {
		if (status === 'active' && question && containerRef.current) {
			if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
				setTimeout(enterFullscreen, 100) // delay for smooth entrance
			}
		}
		// On error or completion, ensure exit fullscreen
		if (status === 'complete' || status === 'error') {
			exitFullscreen()
		}
		return () => {
			if (status !== 'active') exitFullscreen()
		}
	}, [status, question])

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
						<option value="General Aptitude">General Aptitude</option>
						<option value="Technical Aptitude">Technical Aptitude</option>
					</select>
				</div>
				<button onClick={begin}>Start Test</button>
			</div>
		)
	}

	if (status === 'active' && question) {
		return (
			<div ref={containerRef} style={{ padding: 16, background: '#fff', minHeight: 350, maxWidth: 600, margin: '0 auto', borderRadius: 16, boxShadow: '0 2px 12px #0001', position: 'relative' }}>
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
				<div style={{ position: 'absolute', bottom: 8, left: 16, fontSize: 12, color: '#555', opacity: 0.7 }}>Press ESC to exit fullscreen</div>
			</div>
		)
	}

	if (status === 'complete') {
		return (
			<div style={{ padding: 16 }}>
				<h2>Test Complete</h2>
				<div>Score: {result?.score} ({result?.correctQuestions}/{result?.totalQuestions})</div>
				<button style={{ marginTop: 24 }} onClick={() => { setStatus('idle'); setResult(null); setSelected(''); setQuestion(null); setSessionId(null) }}>Take Another Test</button>
			</div>
		)
	}

	if (status === 'error') {
		return <div className="flex min-h-[40vh] flex-col items-center justify-center text-lg text-gray-700">No questions available for the selected section or type.<br/>Please try another section or contact your administrator.</div>
	}

	return <div style={{ padding: 16 }}>Loading...</div>
}










