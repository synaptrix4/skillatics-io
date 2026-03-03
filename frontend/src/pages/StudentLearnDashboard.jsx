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
                    <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col justify-center border-orange-100 hover:border-orange-300 group-hover:bg-orange-50/30">
                        <span className="block mb-3 text-orange-600 text-5xl transition-transform duration-300 group-hover:scale-110">Σ</span>
                        <div className="text-xl font-bold text-slate-900">General Aptitude</div>
                        <div className="mt-2 text-sm text-slate-500 font-medium">Quantitative, verbal, logical</div>
                    </Card>
                </Link>
                <Link to="/student/technical" className="group">
                    <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col justify-center border-amber-100 hover:border-amber-300 group-hover:bg-amber-50/30">
                        <span className="block mb-3 text-amber-600 text-5xl transition-transform duration-300 group-hover:scale-110">{`{}`}</span>
                        <div className="text-xl font-bold text-slate-900">Technical Aptitude</div>
                        <div className="mt-2 text-sm text-slate-500 font-medium">CS fundamentals & theory</div>
                    </Card>
                </Link>
                <Link to="/coding-practice" className="group sm:col-span-2">
                    <Card className="text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-orange-500 to-amber-600 text-white border-none shadow-xl shadow-orange-500/20 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-orange-400/20 rounded-full blur-xl"></div>
                        <div className="relative z-10 flex flex-col items-center justify-center gap-3 mb-2 p-6 pb-2">
                            <span className="text-4xl">⚡</span>
                            <div className="text-2xl font-bold">Coding Practice</div>
                        </div>
                        <div className="relative z-10 text-orange-100 pb-6 px-6">Practice LeetCode-style algorithms with our powerful online editor</div>
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


