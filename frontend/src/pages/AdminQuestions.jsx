import { useState } from 'react'
import { addQuestion, uploadQuestionsCsv, generateQuestions } from '../lib/api'
import { Plus, Upload, FileText, AlertCircle, CheckCircle2, HelpCircle, Bot, Sparkles } from 'lucide-react'

export default function AdminQuestions() {
  const [q, setQ] = useState({ text: '', topic: '', difficulty: 2, type: 'General Aptitude', options: '', answer: '' })
  const [msg, setMsg] = useState('')
  const [csvMsg, setCsvMsg] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCsvSuccess, setIsCsvSuccess] = useState(false)

  // AI State
  const [aiParams, setAiParams] = useState({ topic: '', difficulty: 3, count: 5 })
  const [aiMsg, setAiMsg] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [isAiSuccess, setIsAiSuccess] = useState(false)

  async function addQ() {
    setMsg('')
    setIsSuccess(false)
    try {
      let payload = { ...q };

      if (q.type === 'coding') {
        if (typeof q.test_cases === 'string' && q.test_cases.trim() !== '') {
          try {
            payload.test_cases = JSON.parse(q.test_cases);
          } catch (err) {
            setMsg('Invalid JSON format in Test Cases');
            setIsSuccess(false);
            return;
          }
        }
      } else {
        payload.options = q.options.split('|').map(s => s.trim());
      }

      await addQuestion(payload)
      setMsg('Question added successfully!')
      setIsSuccess(true)
      setQ({ text: '', topic: '', difficulty: 2, type: q.type, options: '', answer: '', test_cases: '', function_name: '', input_format: '', starter_code: {} })
      setTimeout(() => { setMsg(''); setIsSuccess(false) }, 3000)
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to add question')
      setIsSuccess(false)
    }
  }

  async function uploadCsv() {
    setCsvMsg('')
    setIsCsvSuccess(false)
    if (!csvFile) {
      setCsvMsg('Please choose a CSV file')
      setIsCsvSuccess(false)
      return
    }
    try {
      const fd = new FormData()
      fd.append('file', csvFile)
      const r = await uploadQuestionsCsv(fd)
      const ins = r.data?.inserted || 0
      const errs = (r.data?.errors || []).length
      setCsvMsg(`Successfully uploaded: ${ins} questions inserted${errs ? `, ${errs} errors` : ''}`)
      setIsCsvSuccess(true)
      setCsvFile(null)
      setTimeout(() => { setCsvMsg(''); setIsCsvSuccess(false) }, 5000)
    } catch (e) {
      setCsvMsg(e.response?.data?.error || 'Upload failed')
      setIsCsvSuccess(false)
    }
  }

  async function generateAI() {
    setAiMsg('')
    setIsAiSuccess(false)
    if (!aiParams.topic) {
      setAiMsg("Topic is required")
      return
    }
    setAiLoading(true)
    try {
      const res = await generateQuestions(aiParams)
      const count = res.data?.generated || 0
      setAiMsg(`Successfully generated ${count} questions via Gemini AI!`)
      setIsAiSuccess(true)
      setTimeout(() => { setAiMsg(''); setIsAiSuccess(false) }, 5000)
    } catch (e) {
      setAiMsg(e.response?.data?.error || "AI Generation Failed")
      setIsAiSuccess(false)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
        <p className="mt-2 text-gray-600">Add questions individually or upload in bulk via CSV</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Single Question */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Plus className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Single Question</h3>
              <p className="text-sm text-gray-600">Create a new question manually</p>
            </div>
          </div>

          {msg && (
            <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${isSuccess ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {isSuccess ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <span>{msg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                value={q.text}
                onChange={e => setQ({ ...q, text: e.target.value })}
                placeholder="Enter your question here..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                  value={q.topic}
                  onChange={e => setQ({ ...q, topic: e.target.value })}
                  placeholder="e.g., Arrays"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                  value={q.difficulty}
                  onChange={e => setQ({ ...q, difficulty: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                  value={q.type}
                  onChange={e => setQ({ ...q, type: e.target.value })}
                >
                  <option>General Aptitude</option>
                  <option>Technical Aptitude</option>
                  <option value="coding">Coding Practice</option>
                </select>
              </div>
              {q.type !== 'coding' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                    value={q.answer}
                    onChange={e => setQ({ ...q, answer: e.target.value })}
                    placeholder="Must match one option"
                  />
                </div>
              )}
            </div>
            {q.type !== 'coding' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="mb-2 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                  <HelpCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Separate options with the pipe symbol (|). Example: Option A | Option B | Option C | Option D</span>
                </div>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                  value={q.options}
                  onChange={e => setQ({ ...q, options: e.target.value })}
                  placeholder="Option 1 | Option 2 | Option 3 | Option 4"
                />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Function Name</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 font-mono text-sm"
                      value={q.function_name || ''}
                      onChange={e => setQ({ ...q, function_name: e.target.value })}
                      placeholder="e.g., twoSum"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Input Format</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 font-mono text-sm"
                      value={q.input_format || ''}
                      onChange={e => setQ({ ...q, input_format: e.target.value })}
                      placeholder="e.g., array_int, int"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Starter Code (Python)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 font-mono text-sm"
                    value={q.starter_code?.python || ''}
                    onChange={e => setQ({ ...q, starter_code: { ...q.starter_code, python: e.target.value } })}
                    placeholder="def twoSum(nums, target):&#10;    pass"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Cases (JSON Array)</label>
                  <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Provide valid JSON: [{`{"input": "2 7 11 15\\n9", "expected_output": "0 1"}`}]</span>
                  </div>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2 font-mono text-sm"
                    value={typeof q.test_cases === 'string' ? q.test_cases : ''}
                    onChange={e => setQ({ ...q, test_cases: e.target.value })}
                    placeholder='[{"input": "2 7 11 15\\n9", "expected_output": "0 1"}]'
                  />
                </div>
              </>
            )}
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              onClick={addQ}
            >
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>
        </div>

        {/* Bulk Upload CSV */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Upload className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Upload (CSV)</h3>
              <p className="text-sm text-gray-600">Upload multiple questions at once</p>
            </div>
          </div>

          {csvMsg && (
            <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${isCsvSuccess ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {isCsvSuccess ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <span>{csvMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">CSV Format Requirements</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Required columns:</strong> text, topic, difficulty, type, options, answer</p>
                <p><strong>Type values:</strong> "General Aptitude" or "Technical Aptitude"</p>
                <p><strong>Difficulty:</strong> Number between 1-5</p>
                <p><strong>Options:</strong> Pipe-separated (e.g., A | B | C | D)</p>
                <p><strong>Answer:</strong> Must exactly match one of the options</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose CSV File</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              {csvFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{csvFile.name}</span>
                </div>
              )}
            </div>

            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
              onClick={uploadCsv}
            >
              <Upload className="h-4 w-4" /> Upload CSV File
            </button>
          </div>
        </div>

        {/* AI Generation Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Bot className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Question Generator</h3>
              <p className="text-sm text-gray-600">Automatically generate questions using Gemini AI</p>
            </div>
          </div>

          {aiMsg && (
            <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${isAiSuccess ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {isAiSuccess ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <span>{aiMsg}</span>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                value={aiParams.topic}
                onChange={e => setAiParams({ ...aiParams, topic: e.target.value })}
                placeholder="e.g., Data Structures, ReactJS..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty (1-5)</label>
              <input
                type="number" min={1} max={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                value={aiParams.difficulty}
                onChange={e => setAiParams({ ...aiParams, difficulty: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Count (1-10)</label>
              <input
                type="number" min={1} max={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                value={aiParams.count}
                onChange={e => setAiParams({ ...aiParams, count: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateAI}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {aiLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}




