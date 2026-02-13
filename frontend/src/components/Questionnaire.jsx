import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw } from 'lucide-react'

export default function Questionnaire({ questions }) {
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)
    const [showAnswers, setShowAnswers] = useState(false)

    const total = questions?.length || 0

    function setChoice(qid, opt) {
        setAnswers(prev => ({ ...prev, [qid]: opt }))
    }

    function grade() {
        let correct = 0
        for (const q of questions) {
            if (answers[q._id] === q.answer) correct++
        }
        setResult({ correct, total })
        setShowAnswers(true)
    }

    function reset() {
        setAnswers({})
        setResult(null)
        setShowAnswers(false)
    }

    const canGrade = useMemo(() => total > 0 && Object.keys(answers).length === total, [total, answers])
    const answeredCount = Object.keys(answers).length

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <HelpCircle className="h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No Practice Questions</h3>
                <p className="mt-2 text-sm text-gray-600">Practice questions for this topic haven't been added yet.</p>
            </div>
        )
    }

    return (
        <div>
            {/* Progress Bar */}
            {!result && (
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-600">{answeredCount}/{total} answered</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div 
                            className="h-2 rounded-full bg-indigo-600 transition-all duration-300" 
                            style={{ width: `${(answeredCount / total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Result Card */}
            {result && (
                <div className="mb-6 rounded-xl border bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                            <Award className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Test Complete!</h3>
                            <p className="mt-1 text-2xl font-bold text-indigo-600">
                                {result.correct}/{result.total} Correct
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                Score: {Math.round((result.correct / result.total) * 100)}%
                            </p>
                        </div>
                        <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
                {questions.map((q, idx) => {
                    const isCorrect = showAnswers && answers[q._id] === q.answer
                    const isWrong = showAnswers && answers[q._id] && answers[q._id] !== q.answer
                    
                    return (
                        <div key={q._id} className={`rounded-xl border p-6 transition-all ${
                            showAnswers 
                                ? isCorrect 
                                    ? 'border-green-200 bg-green-50' 
                                    : isWrong 
                                        ? 'border-red-200 bg-red-50' 
                                        : 'bg-white'
                                : 'bg-white hover:border-gray-300'
                        }`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm font-medium text-gray-600">Question {idx + 1}</span>
                                    </div>
                                    <p className="mt-3 text-base font-medium text-gray-900">{q.text}</p>
                                </div>
                                {showAnswers && (
                                    <div>
                                        {isCorrect && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                                        {isWrong && <XCircle className="h-6 w-6 text-red-600" />}
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 space-y-2">
                                {q.options?.map(opt => {
                                    const isSelected = answers[q._id] === opt
                                    const isCorrectAnswer = showAnswers && opt === q.answer
                                    
                                    return (
                                        <label 
                                            key={opt} 
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all ${
                                                showAnswers
                                                    ? isCorrectAnswer
                                                        ? 'border-green-500 bg-green-50'
                                                        : isSelected && !isCorrectAnswer
                                                            ? 'border-red-500 bg-red-50'
                                                            : 'border-gray-200 bg-white'
                                                    : isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50' 
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                name={`q-${q._id}`} 
                                                value={opt} 
                                                checked={isSelected} 
                                                onChange={() => !showAnswers && setChoice(q._id, opt)}
                                                disabled={showAnswers}
                                                className="h-4 w-4 accent-indigo-600"
                                            />
                                            <span className={`flex-1 text-sm ${
                                                showAnswers && isCorrectAnswer ? 'font-semibold text-green-900' : 'text-gray-700'
                                            }`}>
                                                {opt}
                                            </span>
                                            {showAnswers && isCorrectAnswer && (
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            )}
                                            {showAnswers && isSelected && !isCorrectAnswer && (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Submit Button */}
            {!result && (
                <div className="mt-6 flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                    <div className="text-sm text-gray-600">
                        {canGrade 
                            ? 'All questions answered! Ready to check your answers.' 
                            : `Answer all ${total} questions to check your score.`
                        }
                    </div>
                    <button 
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                        onClick={grade} 
                        disabled={!canGrade}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Check Answers
                    </button>
                </div>
            )}
        </div>
    )
}


