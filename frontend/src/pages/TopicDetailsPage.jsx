import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchTopic, fetchTopicQuestions } from '../lib/api'
import Questionnaire from '../components/Questionnaire'
import SectionHeader from '../components/SectionHeader'
import Card from '../components/ui/Card'

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

    if (loading) return <div>Loading...</div>
    if (!topic) return <div>Not found</div>

    return (
        <>
            <SectionHeader eyebrow={topic.category || 'Topic'} title={topic.name} align="left" />
            <div className="mt-4 flex gap-2">
                <TabButton active={tab==='theory'} onClick={() => setTab('theory')}>Theory</TabButton>
                <TabButton active={tab==='shortcuts'} onClick={() => setTab('shortcuts')}>Shortcuts</TabButton>
                <TabButton active={tab==='questions'} onClick={() => setTab('questions')}>Questionnaire</TabButton>
            </div>
            <Card className="mt-4">
                {tab === 'theory' && <RichText text={topic.theory} />}
                {tab === 'shortcuts' && <RichText text={topic.shortcuts} />}
                {tab === 'questions' && <Questionnaire questions={questions} />}
            </Card>
        </>
    )
}

function TabButton({ active, children, onClick }) {
    return (
        <button onClick={onClick} className={`rounded-md px-3 py-1.5 text-sm ${active ? 'bg-indigo-600 text-white' : 'border'}`}>{children}</button>
    )
}

function RichText({ text }) {
    if (!text) return <div className="text-sm text-gray-600">No content</div>
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: text }} />
}


