import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BarChart3, Users, Check, Menu, X, Rocket, Shield, Zap, Target } from 'lucide-react';

// Main App Component (Renamed from LandingPage for convention)
export default function App() {
  return (
    <div className="bg-white text-gray-900 font-sans">
      <Header />
      <LandingPageContent />
      <Footer />
    </div>
  );
}

// --- ADDED HEADER COMPONENT ---
function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Audience', href: '#audience' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <motion.header
      className="fixed left-0 top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Skillatics</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
          >
            Login
          </a>
          <a
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Register
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="absolute left-0 w-full origin-top border-b border-gray-200 bg-white shadow-lg lg:hidden"
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex flex-col space-y-2 p-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <hr className="my-2" />
              <a
                href="/login"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </a>
              <a
                href="/register"
                className="block rounded-md bg-indigo-600 px-3 py-2 text-base font-medium text-white hover:bg-indigo-500"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// All your original content, now as a child component
function LandingPageContent() {
  // Animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <main className="relative overflow-hidden">
      <AnimatedBg />

      {/* Hero Section */}
      <section className="container relative mx-auto px-4 py-24 pt-40 sm:py-32">
        <div className="grid items-center gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
              variants={itemVariants}
            >
              Level up with adaptive testing & powerful analytics
            </motion.h1>
            <motion.p
              className="mt-6 text-lg leading-8 text-gray-600"
              variants={itemVariants}
            >
              Skillatics personalizes every test in real time and turns your
              results into clear, actionable insights—so students learn
              faster, faculty teach smarter, and admins stay in control.
            </motion.p>
            <motion.div
              className="mt-10 flex items-center justify-center gap-4"
              variants={itemVariants}
            >
              <a
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-indigo-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                href="/register"
              >
                Register for Free
              </a>
              <a
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                href="/login"
              >
                Login
              </a>
            </motion.div>
          </motion.div>
          
          {/* This motion.div has been removed */}
        </div>
      </section>

      {/* Features Section */}
      <section className="container relative mx-auto px-4 pb-24 sm:pb-32" id="features">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Why Skillatics
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            A modern platform for modern learning.
          </p>
        </motion.div>
        <motion.div
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <Feature
            icon={Target}
            title="Adaptive Learning"
            desc="Every question adapts to you. Find your true level faster and focus on the right practice."
          />
          <Feature
            icon={BarChart3}
            title="Detailed Analytics"
            desc="Turn results into insight—see score trends, topic averages, and what to study next."
          />
          <Feature
            icon={Users}
            title="Role-Based Tools"
            desc="Purpose-built experiences for Students, TPO/Faculty, and Admins to help everyone succeed."
          />
        </motion.div>
      </section>

      {/* Audience Section */}
      <section className="bg-gray-50/70 py-24 sm:py-32" id="audience">
        <div className="container relative mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Who is Skillatics for?
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Tailored value for every role.
            </p>
          </motion.div>
          <motion.div
            className="mt-16 grid gap-8 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <AudienceCard
              title="Students"
              icon={Zap}
              points={[
                'Take personalized tests that adapt as you go.',
                'Stop wasting time on too-easy or too-hard questions.',
                'Track progress visually with score trends and topic-wise averages.',
              ]}
            />
            <AudienceCard
              title="TPO/Faculty"
              icon={Rocket}
              points={[
                'Monitor batch performance with powerful dashboards.',
                'Spot trends to tailor curriculum and measure impact.',
                'Drill down with student-wise insights to target interventions.',
              ]}
            />
            <AudienceCard
              title="Administrators"
              icon={Shield}
              points={[
                'Manage the question bank and bulk import via CSV.',
                'Assign roles (Student, TPO/Faculty, Admin) with ease.',
                'Customize the platform to your institution’s needs.',
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container relative mx-auto px-4 py-24 sm:py-32">
        <motion.div
          className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-10 text-center shadow-lg sm:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl font-bold tracking-tight">
            Start transforming performance
          </h3>
          <p className="mt-4 text-lg text-gray-600">
            Join Skillatics today and unlock data-driven growth for your
            cohort.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-indigo-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              href="/register"
            >
              Register for Free
            </a>
            <a
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              href="/login"
            >
              Login
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

// --- ADDED FEATURE COMPONENT ---
function Feature({ icon: Icon, title, desc }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  return (
    <motion.div
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl"
      variants={itemVariants}
      whileHover={{ y: -6 }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </motion.div>
  );
}

// --- The following components have been removed ---
// function LogoStrip() { ... }
// function Logo() { ... }
// const LogoA = (props) => ( ... );
// const LogoB = (props) => ( ... );
// const LogoC = (props) => ( ... );
// const LogoD = (props) => ( ... );
// const LogoE = (props) => ( ... );


function AudienceCard({ title, icon: Icon, points }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  return (
    <motion.div
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl"
      variants={itemVariants}
      whileHover={{ y: -6 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <Check className="h-5 w-5 flex-shrink-0 text-indigo-500" />
            <span className="text-sm text-gray-600">{p}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// The 'FloatingDecor' function component has been removed

function AnimatedBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="h-[40rem] w-[60rem] rounded-full bg-gradient-to-r from-indigo-100/50 to-violet-100/50 blur-3xl" />
      </motion.div>
      <motion.div
        className="absolute -bottom-40 left-1/4 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <div className="h-[30rem] w-[50rem] rounded-full bg-gradient-to-r from-blue-100/40 to-indigo-100/40 blur-3xl" />
      </motion.div>
    </div>
  );
}

// The 'MockupDashboard' function component has been removed

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Skillatics</span>
          </div>
          <p className="mt-4 text-sm text-gray-500 sm:mt-0">
            © {new Date().getFullYear()} Skillatics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

