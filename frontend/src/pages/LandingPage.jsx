import { Link } from 'react-router-dom'

export default function LandingPage() {
    return (
        <div>
            <section className="container-page py-16 sm:py-24">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Skillatics</h1>
                        <p className="mt-4 text-lg text-gray-600">Adaptive learning and analytics to accelerate student outcomes.</p>
                        <div className="mt-8 flex items-center gap-3">
                            <Link className="rounded-md bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-500" to="/login">Login</Link>
                            <Link className="rounded-md border px-4 py-2.5 hover:bg-gray-50" to="/login?mode=register">Register</Link>
                        </div>
                        <LogoStrip />
                    </div>
                    <div className="relative">
                        <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex h-full items-center justify-center text-gray-400">Product preview</div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 hidden h-24 w-24 rotate-6 rounded-xl bg-indigo-100 sm:block" />
                        <div className="absolute -top-6 -right-6 hidden h-20 w-20 -rotate-6 rounded-xl bg-violet-100 sm:block" />
                    </div>
                </div>
            </section>
            <section className="container-page pb-20">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-semibold">Why Skillatics</h2>
                    <p className="mt-2 text-gray-600">A modern platform designed for students, faculty, and administrators.</p>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Feature title="Adaptive Learning" desc="Difficulty adapts in real-time to your performance." />
                    <Feature title="Detailed Analytics" desc="Track progress with clear visuals and insights." />
                    <Feature title="Role-Based Tools" desc="Admins and faculty manage content and cohorts." />
                </div>
            </section>
        </div>
    )
}

function Feature({ title, desc }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="h-8 w-8 rounded bg-indigo-600"></div>
            <h3 className="mt-3 text-lg font-medium">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
    )
}

function LogoStrip() {
    return (
        <div className="mt-10">
            <div className="text-xs uppercase tracking-wider text-gray-500">Trusted by teams</div>
            <div className="mt-3 flex flex-wrap items-center gap-6 opacity-80">
                <Logo name="Acme" />
                <Logo name="Globex" />
                <Logo name="Umbrella" />
                <Logo name="Initech" />
                <Logo name="Hooli" />
            </div>
        </div>
    )
}

function Logo({ name }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-1 text-sm text-gray-600">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-800"></span>
            {name}
        </div>
    )
}


