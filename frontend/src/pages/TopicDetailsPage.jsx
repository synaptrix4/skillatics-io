import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchTopic, fetchTopicQuestions } from '../lib/api'
import Questionnaire from '../components/Questionnaire'
import { BookOpen, Zap, HelpCircle, ArrowLeft, Loader2, FileText } from 'lucide-react'

export default function TopicDetailsPage() {
    const { topicId } = useParams()
    const [topic, setTopic] = useState(null)
    const [questions, setQuestions] = useState([])
    const [tab, setTab] = useState('theory')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        Promise.all([
            fetchTopic(topicId),
            fetchTopicQuestions(topicId),
        ]).then(([t, q]) => {
            if (!mounted) return
            setTopic(t.data)
            setQuestions(q.data || [])
        }).finally(() => setLoading(false))
        return () => { mounted = false }
    }, [topicId])

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-gray-600">Loading topic...</p>
            </div>
        </div>
    )

    if (!topic) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <FileText className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Topic Not Found</h3>
                <p className="mt-2 text-sm text-gray-600">The topic you're looking for doesn't exist.</p>
                <Link 
                    to="/student" 
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
            </div>
        </div>
    )

    const categoryColor = topic.category === 'General Aptitude' 
        ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
        : 'bg-violet-100 text-violet-700 border-violet-200'

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-6">
                <Link 
                    to={topic.category === 'General Aptitude' ? '/student/general' : '/student/technical'}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to {topic.category}
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                            {topic.category}
                        </span>
                        <h1 className="mt-3 text-3xl font-bold text-gray-900">{topic.name}</h1>
                        <p className="mt-2 text-gray-600">Learn the concepts, shortcuts, and practice questions</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b">
                <TabButton 
                    active={tab==='theory'} 
                    onClick={() => setTab('theory')}
                    icon={BookOpen}
                >
                    Theory
                </TabButton>
                <TabButton 
                    active={tab==='shortcuts'} 
                    onClick={() => setTab('shortcuts')}
                    icon={Zap}
                >
                    Shortcuts & Tips
                </TabButton>
                <TabButton 
                    active={tab==='questions'} 
                    onClick={() => setTab('questions')}
                    icon={HelpCircle}
                >
                    Practice ({questions.length})
                </TabButton>
            </div>

            {/* Content */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                {tab === 'theory' && <RichText text={topic.theory} title="Theory" />}
                {tab === 'shortcuts' && <RichText text={topic.shortcuts} title="Shortcuts & Tips" />}
                {tab === 'questions' && <Questionnaire questions={questions} />}
            </div>
        </div>
    )
}

function TabButton({ active, children, onClick, icon: Icon }) {
    return (
        <button 
            onClick={onClick} 
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
        >
            <Icon className="h-4 w-4" />
            {children}
        </button>
    )
}

function RichText({ text, title }) {
    if (!text || text === '<p><br></p>' || text.trim() === '') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">No {title.toLowerCase()} content available yet.</p>
            </div>
        )
    }
    return (
        <div className="prose prose-indigo max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600 prose-strong:text-gray-900 prose-code:text-indigo-600 prose-pre:bg-gray-900" 
             dangerouslySetInnerHTML={{ __html: text }} 
        />
    )
}


