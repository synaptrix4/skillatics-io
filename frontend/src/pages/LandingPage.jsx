import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LandingPage() {
    return (
        <div className="relative">
            <AnimatedBg />

            <section className="container-page relative py-16 sm:py-24">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                            Level up with adaptive testing and powerful analytics
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Skillatics personalizes every test in real time and turns your results into clear, actionable
                            insights—so students learn faster, faculty teach smarter, and admins stay in control.
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                            <Link className="rounded-md bg-indigo-600 px-4 py-2.5 text-white shadow-sm ring-indigo-500 transition hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring" to="/login?mode=register">Register</Link>
                            <Link className="rounded-md border px-4 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md" to="/login">Login</Link>
                        </div>
                        <LogoStrip />
                    </motion.div>
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <div className="flex h-full items-center justify-center text-gray-400">Product preview</div>
                        </div>
                        <FloatingDecor />
                    </motion.div>
                </div>
            </section>

            <section className="container-page relative pb-16">
                <motion.div className="mx-auto max-w-3xl text-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h2 className="text-2xl font-semibold">Why Skillatics</h2>
                    <p className="mt-2 text-gray-600">A modern platform designed for students, faculty, and administrators.</p>
                </motion.div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Feature title="Adaptive Learning" desc="Every question adapts to you. Find your true level faster and focus on the right practice." />
                    <Feature title="Detailed Analytics" desc="Turn results into insight—see score trends, topic averages, and what to study next." />
                    <Feature title="Role-Based Tools" desc="Purpose-built experiences for Students, TPO/Faculty, and Admins to help everyone succeed." />
                </div>
            </section>

            <section className="container-page relative pb-16">
                <motion.div className="mx-auto max-w-3xl text-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h2 className="text-2xl font-semibold">Who is Skillatics for?</h2>
                    <p className="mt-2 text-gray-600">Tailored value for every role.</p>
                </motion.div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <AudienceCard title="Students" points={[
                        'Take personalized tests in General or Technical Aptitude that adapt as you go.',
                        'Stop wasting time on too-easy or too-hard questions; improve faster.',
                        'Track progress visually with score trends and topic-wise averages.',
                    ]} />
                    <AudienceCard title="TPO/Faculty" points={[
                        'Monitor batch performance with average score, total tests, and average correct answers.',
                        'Spot trends to tailor curriculum and measure impact over time.',
                        'Drill down with student-wise insights to target interventions precisely.',
                    ]} />
                    <AudienceCard title="Administrators" points={[
                        'Manage the question bank and bulk import via CSV (difficulty, topics, answers).',
                        'Assign roles (Student, TPO/Faculty, Admin) and control access with ease.',
                        'Customize the platform to your institution’s needs with simple, powerful tools.',
                    ]} />
                </div>
            </section>

            <section className="container-page relative pb-20">
                <motion.div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-br from-indigo-50 to-violet-50 p-8 text-center shadow-sm" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h3 className="text-2xl font-semibold">Start transforming performance with adaptive learning</h3>
                    <p className="mt-2 text-gray-600">Join Skillatics today and unlock data-driven growth for your cohort.</p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <Link className="rounded-md bg-indigo-600 px-4 py-2.5 text-white shadow-sm ring-indigo-500 transition hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring" to="/login?mode=register">Register</Link>
                        <Link className="rounded-md border px-4 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md" to="/login">Login</Link>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}

function Feature({ title, desc }) {
    return (
        <motion.div className="rounded-xl border bg-white p-5 shadow-sm" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <div className="h-8 w-8 rounded bg-indigo-600"></div>
            <h3 className="mt-3 text-lg font-medium">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </motion.div>
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

function AudienceCard({ title, points }) {
    return (
        <motion.div className="rounded-xl border bg-white p-5 shadow-sm" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <h3 className="text-lg font-medium">{title}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
                {points.map((p) => <li key={p}>{p}</li>)}
            </ul>
        </motion.div>
    )
}

function FloatingDecor() {
    return (
        <>
            <motion.div className="absolute -bottom-6 -left-6 hidden h-24 w-24 rotate-6 rounded-xl bg-indigo-100 sm:block" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} />
            <motion.div className="absolute -top-6 -right-6 hidden h-20 w-20 -rotate-6 rounded-xl bg-violet-100 sm:block" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 0.3 }} />
        </>
    )
}

function AnimatedBg() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-24 -translate-x-1/2">
                <motion.div
                    className="h-64 w-[40rem] rounded-full bg-gradient-to-r from-indigo-200/50 to-violet-200/50 blur-3xl"
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 0.9, scale: 1 }}
                    transition={{ duration: 1.2 }}
                />
            </div>
        </div>
    )
}


