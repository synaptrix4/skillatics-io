import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { CheckCircle2, XCircle, Terminal, RotateCcw, ChevronDown, ChevronUp, Play, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

const LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: 'JS' },
    { id: 'java', name: 'Java', icon: 'JV' },
    { id: 'cpp', name: 'C++', icon: 'C+' },
]

/**
 * Get starter code for a language.
 * Priority:
 *   1. question.starter_code[lang]  — always provided by backend (auto-generated from function_name + input_format)
 *   2. Generic stub with function_name as fallback
 */
function getStarterCode(question, lang) {
    if (question?.starter_code?.[lang]) return question.starter_code[lang]
    const fn = question?.function_name || 'solution'
    const stubs = {
        python: `def ${fn}(*args):\n    # Write your solution here\n    pass\n`,
        javascript: `var ${fn} = function(...args) {\n    // Write your solution here\n};\n`,
        java: `class Solution {\n    public Object ${fn}() {\n        // Write your solution here\n    }\n}`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n};`,
    }
    return stubs[lang] || '// Write your solution here\n'
}

export default function CodeEditor({ question, onSubmit, readonly = false }) {
    const [language, setLanguage] = useState('python')
    const [output, setOutput] = useState('')
    const [executing, setExecuting] = useState(false)
    const [testResults, setTestResults] = useState(null)
    const [activeTab, setActiveTab] = useState('console')
    const [consoleOpen, setConsoleOpen] = useState(true)
    const editorRef = useRef(null)

    // Initialize immediately with the correct starter code
    const [code, setCode] = useState(() => getStarterCode(question, 'python'))

    // When question or language changes — update state AND push directly into Monaco
    useEffect(() => {
        const newCode = getStarterCode(question, language)
        setCode(newCode)
        if (editorRef.current) {
            editorRef.current.setValue(newCode)
        }
        setOutput('')
        setTestResults(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question?._id, language])


    const handleEditorDidMount = (editor) => {
        editorRef.current = editor
        editor.focus()
    }

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang)
        const starterCode = question?.starter_code?.[newLang] || getTemplate(newLang, functionName)
        setCode(starterCode)
        setOutput('')
        setTestResults(null)
    }

    const runCode = async () => {
        if (!code.trim()) {
            setOutput('Error: No code to execute')
            setConsoleOpen(true)
            setActiveTab('console')
            return
        }
        setExecuting(true)
        setOutput('⏳ Running against test cases...')
        setTestResults(null)
        setActiveTab('console')
        setConsoleOpen(true)

        try {
            let resp

            if (question?._id) {
                // Try the /code/run endpoint which fetches all test cases from DB
                try {
                    resp = await api.post('/code/run', {
                        source_code: code,
                        language,
                        questionId: question._id,
                        function_name: question?.function_name,
                        input_format: question?.input_format,
                    })
                } catch (runErr) {
                    // 404 means backend hasn't restarted yet — fall back gracefully
                    if (runErr.response?.status === 404) {
                        resp = await api.post('/code/execute', {
                            source_code: code,
                            language,
                            test_cases: question?.test_cases || [],
                            function_name: question?.function_name,
                            input_format: question?.input_format,
                        })
                    } else {
                        throw runErr
                    }
                }
            } else {
                resp = await api.post('/code/execute', {
                    source_code: code,
                    language,
                    test_cases: question?.test_cases || [],
                    function_name: question?.function_name,
                    input_format: question?.input_format,
                })
            }

            if (resp.data.test_results) {
                setTestResults(resp.data)
                setActiveTab('testcases')
                const firstRes = resp.data.test_results.find(r => !r.hidden)
                setOutput(
                    firstRes?.error
                    || firstRes?.actual_output
                    || (resp.data.success ? '✓ All test cases passed!' : '✗ Some test cases failed.')
                )
            } else {
                setOutput(resp.data.output || resp.data.stdout || resp.data.error || 'No output')
            }
        } catch (err) {
            setOutput(`❌ Error: ${err.response?.data?.error || err.message}`)
        } finally {
            setExecuting(false)
        }
    }

    const submitSolution = async () => {
        if (!question || !code.trim()) return
        setExecuting(true)
        setConsoleOpen(true)
        setOutput('⏳ Submitting...')
        setActiveTab('testcases')

        try {
            const resp = await api.post('/code/submit-coding-test', {
                questionId: question._id,
                source_code: code,
                language,
                function_name: question?.function_name,
                input_format: question?.input_format
            })
            setTestResults(resp.data)
            const firstRes = resp.data.test_results?.[0]
            setOutput(firstRes?.error || firstRes?.actual_output || '✓ Submitted.')
            if (onSubmit) onSubmit(resp.data)
        } catch (err) {
            setOutput(`❌ Error: ${err.response?.data?.error || err.message}`)
            setActiveTab('console')
        } finally {
            setExecuting(false)
        }
    }

    const resetCode = () => {
        setCode(question?.starter_code?.[language] || getTemplate(language, functionName))
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
            {/* ── Toolbar ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            disabled={readonly}
                            className="appearance-none pl-8 pr-6 py-1.5 bg-slate-700 border border-slate-600/80 rounded-lg text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer hover:bg-slate-600 transition-colors"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[11px] font-bold text-slate-400">
                            {LANGUAGES.find(l => l.id === language)?.icon}
                        </span>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none h-3.5 w-3.5 text-slate-400" />
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={resetCode}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                        title="Reset to starter code"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Monaco Editor ── */}
            <div className="flex-1 min-h-0">
                <Editor
                    key={`${language}-${question?._id || 'default'}`}
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        readOnly: readonly,
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontLigatures: true,
                        padding: { top: 12, bottom: 12 },
                        renderLineHighlight: 'all',
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                    }}
                />
            </div>

            {/* ── Console / Test Results Panel ── */}
            <div className={`flex-shrink-0 flex flex-col bg-slate-950 border-t border-slate-700/80 transition-all duration-300 ${consoleOpen ? 'h-56' : 'h-10'}`}>
                {/* Console Tab Bar */}
                <div className="flex items-center justify-between px-3 bg-slate-800/80 border-b border-slate-700/60 h-10 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { setActiveTab('console'); setConsoleOpen(true) }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${activeTab === 'console' && consoleOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Terminal className="h-3.5 w-3.5" /> Console
                        </button>
                        <button
                            onClick={() => { setActiveTab('testcases'); setConsoleOpen(true) }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${activeTab === 'testcases' && consoleOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Test Cases
                            {testResults && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${testResults.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {testResults.passed_tests}/{testResults.total_tests}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Run & Submit buttons + toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={runCode}
                            disabled={executing || readonly}
                            className="flex items-center gap-1.5 px-4 py-1 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white rounded-md text-xs font-bold transition-colors"
                        >
                            {executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                            Run
                        </button>
                        {question && onSubmit && (
                            <button
                                onClick={submitSolution}
                                disabled={executing || readonly}
                                className="flex items-center gap-1.5 px-4 py-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-md text-xs font-bold transition-colors shadow-md shadow-orange-500/20"
                            >
                                Submit
                            </button>
                        )}
                        <button
                            onClick={() => setConsoleOpen(v => !v)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            {consoleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Console Content */}
                {consoleOpen && (
                    <div className="flex-1 overflow-auto p-3 font-mono text-sm">
                        {activeTab === 'console' && (
                            <pre className={`whitespace-pre-wrap text-[13px] leading-relaxed ${output.startsWith('❌') ? 'text-red-400' : 'text-emerald-400'}`}>
                                {output || <span className="text-slate-600 italic">Run your code to see console output here...</span>}
                            </pre>
                        )}

                        {activeTab === 'testcases' && (
                            <div>
                                {!testResults ? (
                                    <p className="text-slate-600 italic text-[13px]">Run or Submit to see test case results here...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Summary badge */}
                                        <div className="flex items-center gap-2 mb-3">
                                            {testResults.success
                                                ? <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs border border-emerald-400/20"><CheckCircle2 className="h-3.5 w-3.5" /> All Passed</span>
                                                : <span className="inline-flex items-center gap-1.5 text-red-400 font-bold bg-red-400/10 px-2.5 py-1 rounded-full text-xs border border-red-400/20"><XCircle className="h-3.5 w-3.5" /> {testResults.passed_tests}/{testResults.total_tests} Passed</span>
                                            }
                                        </div>

                                        {/* Individual test cases */}
                                        {testResults.test_results?.map((res, i) => (
                                            <div key={i} className={`rounded-lg border text-xs overflow-hidden ${res.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                                <div className={`flex items-center justify-between px-3 py-1.5 ${res.passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                    <span className="font-bold text-slate-300">Case {i + 1}</span>
                                                    <span className={`font-bold ${res.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {res.passed ? '✓ Passed' : '✗ Failed'}
                                                    </span>
                                                </div>
                                                {!res.hidden && (
                                                    <div className="px-3 py-2 grid grid-cols-3 gap-3 font-mono">
                                                        <div>
                                                            <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Input</div>
                                                            <code className="text-slate-300 text-[11px]">{res.input || '—'}</code>
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Output</div>
                                                            <code className={`text-[11px] ${res.passed ? 'text-emerald-400' : 'text-red-400'}`}>{res.actual_output || '—'}</code>
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Expected</div>
                                                            <code className="text-slate-300 text-[11px]">{res.expected_output || '—'}</code>
                                                        </div>
                                                    </div>
                                                )}
                                                {res.error && (
                                                    <div className="px-3 pb-2">
                                                        <div className="text-red-500 text-[10px] uppercase tracking-wider mb-1">Error</div>
                                                        <pre className="text-red-400 text-[11px] whitespace-pre-wrap">{res.error}</pre>
                                                    </div>
                                                )}
                                                {res.hidden && <div className="px-3 py-2 text-slate-600 italic">Hidden test case</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
