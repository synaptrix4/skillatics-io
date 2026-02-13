import { useEffect, useRef, useState } from 'react'
import { startTest, submitAnswer, finishTest } from '../lib/api'
import { Play, Clock, Target, CheckCircle2, XCircle, Award, RotateCcw, Maximize, AlertCircle, TrendingUp, Sparkles } from 'lucide-react'

export default function Test() {
	const [sessionId, setSessionId] = useState(null)
	const [question, setQuestion] = useState(null)
	const [status, setStatus] = useState('idle')
	const [result, setResult] = useState(null)
	const [selected, setSelected] = useState('')
	const [typeFilter, setTypeFilter] = useState('')
	const [questionNumber, setQuestionNumber] = useState(1)
	const [navigatorState, setNavigatorState] = useState([]) // 'answered' | 'current' | 'unseen'
	const [elapsedSec, setElapsedSec] = useState(0)
	const totalDurationSec = 5 * 60 * 60 // 5 hours display like the reference
	const TOTAL_QUESTIONS = 10 // target UI like the reference; adjust if needed
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
			setQuestionNumber(1)
			setNavigatorState(Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (i === 0 ? 'current' : 'unseen')))
			setElapsedSec(0)
		} catch (err) {
			setStatus('error')
		}
	}

	async function submit() {
		if (!selected) return
		const resp = await submitAnswer({ sessionId, questionId: question._id, selectedOption: selected })
		if (resp.data.status === 'complete' || questionNumber >= TOTAL_QUESTIONS) {
			setResult(resp.data)
			setQuestion(null)
			setStatus('complete')
		} else {
			setQuestion(resp.data.question)
			setSelected('')
			setQuestionNumber(n => {
				const next = n + 1
				setNavigatorState(prev => {
					const base = prev.length ? prev : Array.from({ length: TOTAL_QUESTIONS }, () => 'unseen')
					const updated = [...base]
					updated[n - 1] = 'answered'
					if (updated[next - 1] !== 'answered') updated[next - 1] = 'current'
					return updated
				})
				return next
			})
		}
	}

	async function finishEarly() {
		try {
			if (!sessionId) {
				setStatus('idle')
				return
			}
			const resp = await finishTest({ sessionId })
			setResult(resp.data)
			setQuestion(null)
			setStatus('complete')
		} catch (err) {
			console.error("Failed to finish test", err)
			const msg = err.response?.data?.error || err.message || "Unknown error"
			alert(`Failed to submit test results: ${msg}`)
			// Do not reset status to idle, let user retry
		}
	}

	useEffect(() => {
		if (status !== 'active') return
		const t = setInterval(() => setElapsedSec(s => s + 1), 1000)
		return () => clearInterval(t)
	}, [status])

	function fmtTime(sec) {
		const h = Math.floor(sec / 3600).toString().padStart(1, '0')
		const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
		const s = Math.floor(sec % 60).toString().padStart(2, '0')
		return `${h}:${m}:${s}`
	}

	if (status === 'idle') {
		return (
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8">
				<div className="w-full max-w-2xl">
					<div className="text-center mb-8">
						<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
							<Target className="h-8 w-8 text-indigo-600" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">Adaptive Test</h1>
						<p className="mt-2 text-gray-600">Test your knowledge with our intelligent adaptive testing system</p>
					</div>

					<div className="rounded-xl border bg-white p-8 shadow-sm">
						<h2 className="text-lg font-semibold text-gray-900 mb-6">Test Configuration</h2>

						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Select Section
								</label>
								<select
									value={typeFilter}
									onChange={e => setTypeFilter(e.target.value)}
									className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
								>
									<option value="">All Sections (Mixed)</option>
									<option value="General Aptitude">General Aptitude Only</option>
									<option value="Technical Aptitude">Technical Aptitude Only</option>
								</select>
								<p className="mt-2 text-sm text-gray-500">Choose a specific section or test across all topics</p>
							</div>

							<div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
								<div className="flex gap-3">
									<AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
									<div className="text-sm text-blue-900">
										<p className="font-medium mb-1">How it works:</p>
										<ul className="list-disc list-inside space-y-1 text-blue-800">
											<li>Questions adapt to your performance</li>
											<li>Difficulty increases with correct answers</li>
											<li>Total of {TOTAL_QUESTIONS} questions</li>
											<li>Test will enter fullscreen mode</li>
										</ul>
									</div>
								</div>
							</div>

							<button
								className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700"
								onClick={begin}
							>
								<Play className="h-5 w-5" />
								Start Adaptive Test
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (status === 'active' && question) {
		const diffNum = Number(question.difficulty || 3)
		const diffLabel = diffNum <= 2 ? 'Easy' : diffNum === 3 ? 'Medium' : 'Hard'
		const diffColor = diffNum <= 2 ? 'bg-green-100 text-green-700 border-green-200' : diffNum === 3 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'
		const diffIcon = diffNum <= 2 ? '🟢' : diffNum === 3 ? '🟡' : '🔴'

		return (
			<div ref={containerRef} className="min-h-screen w-full bg-gray-50 px-4 py-6 lg:px-8">
				{/* Header Bar */}
				<div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white px-6 py-4 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
							<Target className="h-5 w-5 text-indigo-600" />
						</div>
						<div>
							<div className="text-sm font-semibold text-gray-900">Adaptive Test</div>
							<div className="text-xs text-gray-600">Question {questionNumber} of {TOTAL_QUESTIONS}</div>
						</div>
					</div>
					<div className="flex items-center gap-6 text-sm">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-gray-600" />
							<span className="font-semibold text-gray-900">{fmtTime(elapsedSec)}</span>
							<span className="text-gray-500">/ 5:00:00</span>
						</div>
					</div>
					<button
						onClick={finishEarly}
						className="rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
					>
						Finish Test
					</button>
				</div>

				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					{/* Question Card */}
					<div className="rounded-xl border bg-white shadow-sm overflow-hidden">
						<div className="border-b bg-gray-50 px-6 py-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
									{questionNumber}
								</span>
								<span className="text-lg font-semibold text-gray-900">Question {questionNumber}</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-gray-600">Difficulty:</span>
								<span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${diffColor}`}>
									<span>{diffIcon}</span>
									{diffLabel}
								</span>
							</div>
						</div>
						<div className="p-6 max-h-[calc(100vh-280px)] overflow-auto">
							<p className="text-lg leading-relaxed text-gray-900">{question.text}</p>
							<div className="mt-8 space-y-3">
								{question.options.map((opt, idx) => (
									<label
										key={opt}
										className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 px-5 py-4 transition-all ${selected === opt
											? 'border-indigo-600 bg-indigo-50'
											: 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
											}`}
									>
										<input
											type="radio"
											name="opt"
											value={opt}
											checked={selected === opt}
											onChange={() => setSelected(opt)}
											className="h-5 w-5 accent-indigo-600"
										/>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
													{String.fromCharCode(65 + idx)}
												</span>
												<span className="text-base text-gray-900">{opt}</span>
											</div>
										</div>
										{selected === opt && (
											<CheckCircle2 className="h-5 w-5 text-indigo-600" />
										)}
									</label>
								))}
							</div>
							<div className="mt-8 flex items-center justify-between border-t pt-6">
								<span className="text-sm text-gray-500">
									<Maximize className="inline h-4 w-4 mr-1" />
									Press ESC to exit fullscreen
								</span>
								<button
									disabled={!selected}
									onClick={submit}
									className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next Question
									<CheckCircle2 className="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>

					{/* Navigator */}
					<div className="rounded-xl border bg-white p-6 shadow-sm h-fit">
						<div className="flex items-center gap-2 mb-4">
							<TrendingUp className="h-5 w-5 text-gray-600" />
							<h3 className="text-base font-semibold text-gray-900">Progress</h3>
						</div>
						<div className="mb-4">
							<div className="flex items-center justify-between text-sm mb-2">
								<span className="text-gray-600">Answered</span>
								<span className="font-semibold text-gray-900">{navigatorState.filter(s => s === 'answered').length}/{TOTAL_QUESTIONS}</span>
							</div>
							<div className="h-2 w-full rounded-full bg-gray-200">
								<div
									className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
									style={{ width: `${(navigatorState.filter(s => s === 'answered').length / TOTAL_QUESTIONS) * 100}%` }}
								/>
							</div>
						</div>
						<div className="border-t pt-4">
							<div className="text-sm font-medium text-gray-700 mb-3">Question Navigator</div>
							<div className="grid grid-cols-4 gap-2">
								{Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
									const idx = i + 1
									const state = idx === questionNumber ? 'current' : navigatorState[idx - 1] || 'unseen'
									const cls = state === 'current'
										? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
										: state === 'answered'
											? 'bg-green-600 text-white'
											: 'bg-gray-100 text-gray-600'
									return (
										<div key={idx} className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all ${cls}`}>
											{idx}
										</div>
									)
								})}
							</div>
						</div>
						<div className="mt-4 space-y-2 text-xs">
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded bg-indigo-600"></div>
								<span className="text-gray-600">Current</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded bg-green-600"></div>
								<span className="text-gray-600">Answered</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded bg-gray-100"></div>
								<span className="text-gray-600">Unseen</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (status === 'complete') {
		const scorePercentage = result?.score ?? 0
		const isExcellent = scorePercentage >= 80
		const isGood = scorePercentage >= 60
		const scoreColor = isExcellent ? 'text-green-600' : isGood ? 'text-yellow-600' : 'text-red-600'
		const scoreBg = isExcellent ? 'bg-green-50 border-green-200' : isGood ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

		return (
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8">
				<div className="w-full max-w-2xl">
					<div className="text-center mb-8">
						<div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
							<Award className="h-10 w-10 text-indigo-600" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">Test Complete!</h1>
						<p className="mt-2 text-gray-600">Great job! Here are your results</p>
					</div>

					<div className={`rounded-xl border p-8 shadow-sm mb-6 ${scoreBg}`}>
						<div className="text-center">
							<div className="text-sm font-medium text-gray-600 mb-2">Your Score</div>
							<div className={`text-6xl font-bold ${scoreColor} mb-4`}>
								{scorePercentage}%
							</div>
							<div className="flex items-center justify-center gap-8 text-sm">
								<div>
									<div className="text-gray-600">Correct Answers</div>
									<div className="text-2xl font-bold text-gray-900 mt-1">
										{result?.correctQuestions ?? 0}
									</div>
								</div>
								<div className="h-12 w-px bg-gray-300"></div>
								<div>
									<div className="text-gray-600">Total Questions</div>
									<div className="text-2xl font-bold text-gray-900 mt-1">
										{result?.totalQuestions ?? 0}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="rounded-xl border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-600">Score</p>
							<p className="text-3xl font-bold text-indigo-600">{result.score}%</p>
						</div>
						<div className="rounded-xl border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-600">Correct</p>
							<p className="text-3xl font-bold text-green-600">{result.correctQuestions}/{result.totalQuestions}</p>
						</div>
						<div className="rounded-xl border bg-white p-4 shadow-sm">
							<p className="text-sm text-gray-600">Time</p>
							<p className="text-3xl font-bold text-gray-900">{fmtTime(elapsedSec)}</p>
						</div>
					</div>

					{/* Gamification Rewards */}
					{result.gamification && (
						<div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm border-indigo-200 mb-6">
							<h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-indigo-600" />
								Rewards Earned!
							</h3>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="bg-white rounded-lg p-4 border border-indigo-200">
									<div className="text-sm text-gray-600 mb-1">XP Gained</div>
									<div className="text-2xl font-bold text-indigo-600">+{result.gamification.xp_earned}</div>
								</div>
								<div className="bg-white rounded-lg p-4 border border-indigo-200">
									<div className="text-sm text-gray-600 mb-1">Total XP</div>
									<div className="text-2xl font-bold text-gray-900">{result.gamification.new_xp.toLocaleString()}</div>
								</div>
								<div className="bg-white rounded-lg p-4 border border-indigo-200">
									<div className="text-sm text-gray-600 mb-1">Level</div>
									<div className="text-2xl font-bold text-purple-600">
										{result.gamification.new_level}
										{result.gamification.leveled_up && <span className="text-green-600 text-base ml-2">▲ Level Up!</span>}
									</div>
								</div>
								<div className="bg-white rounded-lg p-4 border border-indigo-200">
									<div className="text-sm text-gray-600 mb-1">Next Level</div>
									<div className="text-xl font-bold text-gray-900">{result.gamification.xp_for_next_level} XP</div>
								</div>
							</div>

							{/* Achievements */}
							{result.gamification.new_achievements && result.gamification.new_achievements.length > 0 && (
								<div className="mt-4 pt-4 border-t border-indigo-200">
									<div className="text-sm font-semibold text-indigo-900 mb-3">🏆 New Achievements Unlocked!</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{result.gamification.new_achievements.map((achievement) => (
											<div key={achievement.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border-2 border-amber-300 shadow-sm">
												<div className="flex items-center gap-3">
													<div className="text-3xl">{achievement.icon}</div>
													<div className="flex-1">
														<div className="font-semibold text-gray-900">{achievement.name}</div>
														<div className="text-xs text-gray-600">{achievement.description}</div>
														<div className="text-xs text-amber-700 font-semibold mt-1">+{achievement.xp_bonus} XP Bonus</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					<div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600">Accuracy</span>
								<span className="text-sm font-semibold text-gray-900">
									{result?.totalQuestions ? Math.round((result.correctQuestions / result.totalQuestions) * 100) : 0}%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600">Time Taken</span>
								<span className="text-sm font-semibold text-gray-900">{fmtTime(elapsedSec)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600">Performance</span>
								<span className={`text-sm font-semibold ${scoreColor}`}>
									{isExcellent ? 'Excellent! 🎉' : isGood ? 'Good Job! 👍' : 'Keep Practicing 💪'}
								</span>
							</div>
						</div>
					</div>

					{result?.questionsReview && (
						<div className="rounded-xl border bg-white p-6 shadow-sm mb-6 text-left">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Questions Review</h3>
							<div className="space-y-6">
								{result.questionsReview.map((q, idx) => (
									<div key={idx} className="border-b last:border-0 pb-6 last:pb-0">
										<p className="font-medium text-gray-900 mb-3">
											{idx + 1}. {q.text}
										</p>
										<div className="space-y-2">
											{q.options.map((opt, optIdx) => {
												const isSelected = opt === q.selectedAnswer
												const isCorrect = opt === q.correctAnswer
												let style = "border-gray-200 bg-white"

												if (isCorrect) style = "border-green-200 bg-green-50 text-green-800"
												else if (isSelected && !isCorrect) style = "border-red-200 bg-red-50 text-red-800"

												return (
													<div
														key={optIdx}
														className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${style}`}
													>
														<div className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${isCorrect ? 'border-green-600 bg-green-600 text-white' :
															(isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300 text-gray-500')
															}`}>
															{String.fromCharCode(65 + optIdx)}
														</div>
														<span>{opt}</span>
														{isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
														{isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600 ml-auto" />}
													</div>
												)
											})}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
					<div className="flex gap-4">
						<button
							onClick={() => { setStatus('idle'); setResult(null); setSelected(''); setQuestion(null); setSessionId(null); setNavigatorState([]); setQuestionNumber(1); setElapsedSec(0); }}
							className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700"
						>
							<RotateCcw className="h-5 w-5" />
							Take Another Test
						</button>
						<a
							href="/analytics"
							className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							<TrendingUp className="h-5 w-5" />
							View Analytics
						</a>
					</div>
				</div>
			</div>
		)
	}

	if (status === 'error') {
		return (
			<div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8">
				<div className="w-full max-w-md text-center">
					<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
						<XCircle className="h-8 w-8 text-red-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
					<p className="text-gray-600 mb-6">
						No questions are available for the selected section. Please try another section or contact your administrator.
					</p>
					<button
						onClick={() => setStatus('idle')}
						className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
					>
						<RotateCcw className="h-4 w-4" />
						Try Again
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="text-center">
				<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
				<p className="mt-4 text-gray-600">Loading...</p>
			</div>
		</div>
	)
}










