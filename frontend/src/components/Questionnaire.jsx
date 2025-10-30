import { useMemo, useState } from 'react'

export default function Questionnaire({ questions }) {
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)

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
    }

    const canGrade = useMemo(() => total > 0, [total])

    return (
        <div>
            <ul className="space-y-4">
                {questions.map((q, idx) => (
                    <li key={q._id} className="rounded-lg border p-4">
                        <div className="text-sm text-gray-600">Q{idx + 1}</div>
                        <div className="mt-1 font-medium">{q.text}</div>
                        <div className="mt-3 grid gap-2">
                            {q.options?.map(opt => (
                                <label key={opt} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${answers[q._id] === opt ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                                    <input type="radio" name={`q-${q._id}`} value={opt} checked={answers[q._id] === opt} onChange={() => setChoice(q._id, opt)} />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-4 flex items-center gap-3">
                <button className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50" onClick={grade} disabled={!canGrade}>Check Answers</button>
                {result && <div className="text-sm text-gray-700">You got {result.correct} out of {result.total} correct</div>}
            </div>
        </div>
    )
}


