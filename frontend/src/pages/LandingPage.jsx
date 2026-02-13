import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, Check, Menu, X, Rocket, Shield, Zap, Target, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

// Main LandingPage Component
export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      <Header />
      <LandingPageContent />
      <Footer />
    </div>
  );
}

// --- HEADER ---
function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simplified Nav for clarity - removing clutter
  const navItems = [
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'For Students', href: '#audience' },
  ];

  return (
    <motion.header
      className="fixed left-0 top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="container-page flex items-center justify-between py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <Logo className="h-9 w-auto" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">Skillatics</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="/login"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Log in
          </a>
          <a
            href="/register"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="absolute left-0 w-full border-b border-gray-200 bg-white shadow-xl md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-4 p-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-gray-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <hr className="border-gray-100" />
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/login"
                  className="flex items-center justify-center rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  className="flex items-center justify-center rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  sign Up
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function LandingPageContent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <main className="relative overflow-hidden pt-20">
      <AnimatedBg />

      {/* Hero Section */}
      <section className="container-page relative py-16 lg:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/10">
              <Zap className="h-3.5 w-3.5 text-indigo-600" />
              AI-Powered Adaptive Learning
            </span>
          </motion.div>

          {/* Main Heading with Gradient */}
          <motion.h1
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6 leading-tight"
            variants={itemVariants}
          >
            Master Your Skills with{' '}
            <span className="text-gradient">Adaptive Intelligence</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 mb-10"
            variants={itemVariants}
          >
            Real-time adaptive tests that adjust to your skill level. Get personalized insights,
            track progress with gamification, and compete on leaderboards.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>100% Free for Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>AI-Generated Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Real-Time Analytics</span>
            </div>
            <div className="mb-4 inline-flex items-center gap-2 font-bold text-lg">
              <Logo className="h-6 w-auto" />
              <span>Skillatics</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-20" id="how-it-works">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              How <span className="text-gradient">Skillatics</span> Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to transform your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 rounded-full"></div>

            <StepCard
              number="1"
              title="Take Adaptive Tests"
              desc="Smart AI adjusts question difficulty in real-time based on your performance."
              icon={Target}
              color="indigo"
            />
            <StepCard
              number="2"
              title="Get Instant Analysis"
              desc="See exactly which topics are your strengths and where you need practice."
              icon={BarChart3}
              color="purple"
            />
            <StepCard
              number="3"
              title="Track & Excel"
              desc="Earn XP, unlock achievements, and climb leaderboards while improving."
              icon={Rocket}
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-20" id="audience">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              Built for <span className="text-gradient">Everyone</span>
            </h2>
            <p className="text-lg text-gray-600">
              Tailored experiences for every role in the learning ecosystem
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <AudienceCardEnhanced
              title="Students"
              icon={Zap}
              desc="Adaptive tests that match your skill level. Earn XP, unlock achievements, and compete on leaderboards."
              gradient="from-yellow-400 to-orange-500"
              features={["Personalized Tests", "XP & Badges", "Skill Analysis"]}
            />
            <AudienceCardEnhanced
              title="Faculty"
              icon={Rocket}
              desc="Real-time batch analytics at your fingertips. Identify at-risk students and track cohort progress."
              gradient="from-indigo-500 to-purple-600"
              features={["Batch Analytics", "At-Risk Alerts", "Performance Tracking"]}
            />
            <AudienceCardEnhanced
              title="Admins"
              icon={Shield}
              desc="Complete platform control with user management, AI question generation, and comprehensive dashboards."
              gradient="from-green-500 to-emerald-600"
              features={["User Management", "AI Gen Questions", "Full Control"]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-24">
        <div className="relative isolate overflow-hidden bg-primary-900 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start learning smarter?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
            Join the platform that is transforming how technical institutes assess and improve student skills.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// --- SUBCOMPONENTS ---

function StepCard({ number, title, desc, icon: Icon, color }) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600 group-hover:from-indigo-600 group-hover:to-indigo-700',
    purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
    pink: 'from-pink-500 to-pink-600 group-hover:from-pink-600 group-hover:to-pink-700'
  };

  return (
    <div className="group relative flex flex-col items-center text-center animate-fade-in hover-lift">
      {/* Number Badge */}
      <div className={`relative flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg z-10 mb-6 transition-all duration-300`}>
        <span className="text-3xl font-bold text-white">
          {number}
        </span>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Icon */}
      <div className="mb-3">
        <Icon className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 transition-colors" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function AudienceCard({ title, icon: Icon, desc }) {
  return (
    <div className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-4 text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function AudienceCardEnhanced({ title, icon: Icon, desc, gradient, features }) {
  return (
    <div className="group relative rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Icon with Gradient */}
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-105 transition-transform duration-300 mb-5`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="relative text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="relative text-gray-600 leading-relaxed text-sm mb-5">{desc}</p>

      {/* Features List */}
      <div className="relative space-y-2.5">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary-50/50 to-transparent rounded-[100%] blur-3xl opacity-60" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container-page py-12">
        <div className="flex flex-col items-center justify-between sm:flex-row gap-6">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <span className="text-lg font-bold text-gray-900">Skillatics</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Skillatics Adaptive Learning. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

