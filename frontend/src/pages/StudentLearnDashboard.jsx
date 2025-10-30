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
                    <Card className="text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                        <span className="block mb-2 text-indigo-700 text-4xl">Σ</span>
                        <div className="text-lg font-semibold">Learn General Aptitude</div>
                        <div className="mt-1 text-sm text-gray-600">Quantitative, verbal, logical and more</div>
                    </Card>
                </Link>
                <Link to="/student/technical" className="group">
                    <Card className="text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                        <span className="block mb-2 text-violet-700 text-4xl">{`{}`}</span>
                        <div className="text-lg font-semibold">Learn Technical Aptitude</div>
                        <div className="mt-1 text-sm text-gray-600">DSA, OOP, DBMS and CS fundamentals</div>
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


