import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import Card from '../components/ui/Card'
import { PrimaryButton, SecondaryButton } from '../components/ui/Button'

export default function StudentLearnDashboard() {
    return (
        <div className="min-h-[70vh] py-6">
            <SectionHeader eyebrow="Start learning" title="What would you like to learn today?" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
                <Link to="/student/general" className="group">
                    <Card className="text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-center">
                        <span className="block mb-2 text-indigo-700 text-4xl">Σ</span>
                        <div className="text-lg font-semibold">General Aptitude</div>
                        <div className="mt-1 text-sm text-gray-600">Quantitative, verbal, logical</div>
                    </Card>
                </Link>
                <Link to="/student/technical" className="group">
                    <Card className="text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-center">
                        <span className="block mb-2 text-violet-700 text-4xl">{`{}`}</span>
                        <div className="text-lg font-semibold">Technical Aptitude</div>
                        <div className="mt-1 text-sm text-gray-600">CS fundamentals & theory</div>
                    </Card>
                </Link>
                <Link to="/coding-practice" className="group sm:col-span-2">
                    <Card className="text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <div className="text-xl font-bold">Coding Practice</div>
                        </div>
                        <div className="text-gray-300">Practice LeetCode-style algorithms with our powerful online editor</div>
                    </Card>
                </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <PrimaryButton as="a" href="/test">Start Adaptive Test</PrimaryButton>
                <SecondaryButton as="a" href="/analytics">View My Analytics</SecondaryButton>
            </div>
        </div>
    )
}


