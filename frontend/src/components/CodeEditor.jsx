import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Play, CheckCircle2, XCircle, Terminal, AlertCircle, RotateCcw } from 'lucide-react'
import { api } from '../lib/api'

const LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍', template: '# Write your code here\ndef solution(nums, target):\n    # Example: Two Sum\n    pass\n' },
    { id: 'java', name: 'Java', icon: '☕', template: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}' },
    { id: 'cpp', name: 'C++', icon: '⚡', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}' },
    { id: 'javascript', name: 'JavaScript', icon: '📜', template: '// Write your code here\nconst solution = () => {\n    \n}\n' },
]

export default function CodeEditor({ question, onSubmit, readonly = false }) {
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('python')
    const [output, setOutput] = useState('')
    const [executing, setExecuting] = useState(false)
    const [testResults, setTestResults] = useState(null)
    const [activeTab, setActiveTab] = useState('output') // output | testcases
    const editorRef = useRef(null)

    // Initialize code with starter code from question or language template
    useEffect(() => {
        const lang = LANGUAGES.find(l => l.id === language)
        if (lang && !code) {
            // Use question's starter code if available, otherwise use default template
            const starterCode = question?.starter_code?.[language] || lang.template
            setCode(starterCode)
        }
    }, [language, question])

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor
        editor.focus()
    }

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang)
        const lang = LANGUAGES.find(l => l.id === newLang)
        if (lang) {
            // Use question's starter code if available
            const starterCode = question?.starter_code?.[newLang] || lang.template
            setCode(starterCode)
        }
        setOutput('')
        setTestResults(null)
    }

    const runCode = async () => {
        if (!code.trim()) {
            setOutput('Error: No code to execute')
            setActiveTab('output')
            return
        }

        setExecuting(true)
        setOutput('Running...')
        setTestResults(null)
        setActiveTab('output')

        try {
            const resp = await api.post('/code/execute', {
                source_code: code,
                language: language,
                test_cases: question?.test_cases || []
            })

            if (resp.data.test_results) {
                // Test case results
                setTestResults(resp.data)
                setActiveTab('testcases')
            } else {
                // Single execution
                setOutput(resp.data.output || resp.data.stdout || resp.data.error || 'No output')
            }
        } catch (err) {
            setOutput(`Error: ${err.response?.data?.error || err.message}`)
        } finally {
            setExecuting(false)
        }
    }

    const submitSolution = async () => {
        if (!question || !code.trim()) return

        setExecuting(true)
        try {
            const resp = await api.post('/code/submit-coding-test', {
                questionId: question._id,
                source_code: code,
                language: language
            })

            setTestResults(resp.data)
            setActiveTab('testcases')

            if (onSubmit) {
                onSubmit(resp.data)
            }
        } catch (err) {
            setOutput(`Error: ${err.response?.data?.error || err.message}`)
            setActiveTab('output')
        } finally {
            setExecuting(false)
        }
    }

    const resetCode = () => {
        const lang = LANGUAGES.find(l => l.id === language)
        if (lang) setCode(lang.template)
    }

    return (
        <div className="flex flex-col h-full bg-white border rounded-xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={readonly}
                        className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>
                                {lang.icon} {lang.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={resetCode}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                        title="Reset Code"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        disabled={executing || readonly}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                        <Play className="h-3.5 w-3.5" />
                        Run
                    </button>

                    {question && onSubmit && (
                        <button
                            onClick={submitSolution}
                            disabled={executing || readonly}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors shadow-sm"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Submit
                        </button>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className={`flex-1 min-h-[400px] relative`}>
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={handleEditorDidMount}
                    theme="vs-light" // Use light theme to match UI
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        readOnly: readonly,
                        fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
                    }}
                />
            </div>

            {/* Output / Console Panel */}
            <div className="border-t bg-gray-50 h-[250px] flex flex-col">
                {/* Tabs */}
                <div className="flex border-b bg-white">
                    <button
                        onClick={() => setActiveTab('testcases')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'testcases' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Test Cases
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'output' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Console Output
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                    {activeTab === 'output' && (
                        <div className="text-gray-800 whitespace-pre-wrap">
                            {output || <span className="text-gray-400 italic">Run your code to see output...</span>}
                        </div>
                    )}

                    {activeTab === 'testcases' && (
                        <div>
                            {!testResults ? (
                                <div className="text-gray-400 italic">Run or Submit to see test results...</div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.success ? (
                                            <span className="inline-flex items-center gap-1 text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded text-xs">
                                                <CheckCircle2 className="h-3 w-3" /> Accepted
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded text-xs">
                                                <XCircle className="h-3 w-3" /> Wrong Answer
                                            </span>
                                        )}
                                        <span className="text-gray-500 text-xs">
                                            {testResults.passed_tests}/{testResults.total_tests} passed
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {testResults.test_results?.map((res, i) => (
                                            <div key={i} className={`p-3 rounded border text-xs ${res.passed ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                                                <div className="flex justify-between font-semibold mb-1">
                                                    <span>Case {i + 1}</span>
                                                    <span>{res.passed ? 'Pass' : 'Fail'}</span>
                                                </div>
                                                {!res.hidden && (
                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                        <div>
                                                            <span className="text-gray-500 block">Input:</span>
                                                            <code className="bg-white px-1 rounded border border-gray-200 block overflow-hidden text-ellipsis">{res.input}</code>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block">Output:</span>
                                                            <code className="bg-white px-1 rounded border border-gray-200 block overflow-hidden text-ellipsis">{res.actual_output || '-'}</code>
                                                        </div>
                                                        {res.expected_output && (
                                                            <div className="col-span-2">
                                                                <span className="text-gray-500 block">Expected:</span>
                                                                <code className="bg-white px-1 rounded border border-gray-200 block overflow-hidden text-ellipsis">{res.expected_output}</code>
                                                            </div>
                                                        )}
                                                        {res.error && (
                                                            <div className="col-span-2 text-red-600">
                                                                Error: {res.error}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {res.hidden && <div className="text-gray-400 italic">Hidden Test Case</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
