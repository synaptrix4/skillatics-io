import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, Check, Menu, X, Rocket, Shield, Zap, Target, ArrowRight, BrainCircuit, Sparkles, Code2, ChevronLeft, ChevronRight, Lock, Globe, Trophy } from 'lucide-react';
import Logo from '../components/Logo';

// Main LandingPage Component
export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans selection:bg-orange-500/30 selection:text-orange-900 overflow-x-hidden">
      <AmbientBackground />
      <Header />
      <LandingPageContent />
      <Footer />
    </div>
  );
}

// --- AMBIENT GLOW BACKGROUND ---
function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white">
      {/* Main Top Center Sarvam Glow - Adjusted opacities for white bg */}
      <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-[100%] bg-orange-500/20 blur-[120px]" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[40vw] h-[40vh] rounded-[100%] bg-amber-400/20 blur-[100px]" />
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] rounded-[100%] bg-orange-300/10 blur-[100px]" />

      {/* Noise texture for premium feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
    </div>
  );
}

// --- HEADER ---
function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Platform', href: '#platform' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-6'
        }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container px-4 mx-auto md:px-6">
        <nav className={`mx-auto max-w-5xl flex items-center justify-between rounded-full transition-all duration-500 ${isScrolled
          ? 'bg-white/80 border border-slate-200/50 backdrop-blur-xl px-6 py-3 shadow-lg shadow-slate-200/50'
          : 'bg-transparent px-2 py-2'
          }`}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group relative z-10">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 shadow-md shadow-orange-500/20">
              <Logo className="h-5 w-auto text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">Skillatics</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-all duration-300 hover:text-slate-900"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 cursor-pointer"
            >
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-50 rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-8 p-6 w-full max-w-sm">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-2xl font-semibold text-slate-600 hover:text-slate-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="w-full h-px bg-slate-200 my-4" />
              <div className="flex flex-col w-full gap-4">
                <a
                  href="/login"
                  className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-4 text-lg font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-lg font-medium text-white hover:opacity-90 shadow-lg shadow-orange-500/20"
                >
                  Get Started
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <main className="relative z-10 pt-32 pb-20">

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32 pt-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto max-w-5xl text-center"
        >
          {/* Subtle Badge */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <div className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-orange-200/50 bg-orange-50/50 px-4 py-1.5 text-sm font-medium text-orange-700 backdrop-blur-md shadow-sm">
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Next-Gen Assessment Engine</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl mb-8 leading-[1.1]"
            variants={itemVariants}
          >
            Measure true potential with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-orange-600 to-amber-500 drop-shadow-[0_0_30px_rgba(251,146,60,0.2)]">
              Adaptive Intelligence
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed mb-12"
            variants={itemVariants}
          >
            Skillatics provides an enterprise-grade platform for interactive coding assessments, real-time analytics, and personalized learning paths. Built for modern institutes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800 hover:-translate-y-1 shadow-xl shadow-slate-900/20 cursor-pointer"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#platform"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-8 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 cursor-pointer"
            >
              Explore the Platform
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Carousel Section */}
      <FeatureCarousel />

      {/* Bottom CTA Element */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8" id="platform">
        <div className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-10 sm:p-16 text-center shadow-2xl shadow-orange-500/20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Experience the future of assessment.</h2>
            <p className="text-orange-100 mb-10 max-w-xl mx-auto text-lg">Join the ecosystem that bridges the gap between learning and institutional excellence.</p>
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all duration-300 hover:bg-slate-50 hover:-translate-y-1 hover:shadow-2xl shadow-xl cursor-pointer"
            >
              Join Skillatics Today
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// --- FEATURE CAROUSEL ---
const featureCards = [
  {
    icon: BrainCircuit,
    iconBg: 'bg-orange-100',
    iconBorder: 'border-orange-200/50',
    iconColor: 'text-orange-600',
    accentHover: 'hover:border-orange-200/60',
    accentGlow: 'from-orange-500/5',
    tag: 'AI-Powered',
    tagBg: 'bg-orange-50 text-orange-600 border-orange-200/50',
    title: 'Adaptive & Interactive',
    description:
      'Our AI dynamically modifies test difficulty in real-time. Students write code in structured function templates and receive millisecond assessments instantly.',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-amber-100',
    iconBorder: 'border-amber-200/50',
    iconColor: 'text-amber-600',
    accentHover: 'hover:border-amber-200/60',
    accentGlow: 'from-amber-500/5',
    tag: 'Analytics',
    tagBg: 'bg-amber-50 text-amber-600 border-amber-200/50',
    title: 'Deep Analytics',
    description:
      'Granular insights for admins and faculty. Track precision, speed, cheating probability, and cohort averages — all in one real-time dashboard.',
  },
  {
    icon: Shield,
    iconBg: 'bg-blue-100',
    iconBorder: 'border-blue-200/50',
    iconColor: 'text-blue-600',
    accentHover: 'hover:border-blue-200/60',
    accentGlow: 'from-blue-500/5',
    tag: 'Security',
    tagBg: 'bg-blue-50 text-blue-600 border-blue-200/50',
    title: 'Secure Ecosystem',
    description:
      'Protected by JWT tokens, isolated sandbox execution, and strict role-based access controls to keep assessments tamper-proof.',
  },
  {
    icon: Code2,
    iconBg: 'bg-emerald-100',
    iconBorder: 'border-emerald-200/50',
    iconColor: 'text-emerald-600',
    accentHover: 'hover:border-emerald-200/60',
    accentGlow: 'from-emerald-500/5',
    tag: 'Multi-Language',
    tagBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    title: 'Multi-Language Support',
    description:
      'Write solutions in Python, JavaScript, C++, and Java — all with universal test integration and consistent evaluation across languages.',
  },
  {
    icon: Target,
    iconBg: 'bg-rose-100',
    iconBorder: 'border-rose-200/50',
    iconColor: 'text-rose-600',
    accentHover: 'hover:border-rose-200/60',
    accentGlow: 'from-rose-500/5',
    tag: 'Gamification',
    tagBg: 'bg-rose-50 text-rose-600 border-rose-200/50',
    title: 'Engaging Tracks',
    description:
      'Gamified progress bars, dynamic leaderboards, and instant achievement feedback keep students motivated throughout their learning journey.',
  },
  {
    icon: Users,
    iconBg: 'bg-violet-100',
    iconBorder: 'border-violet-200/50',
    iconColor: 'text-violet-600',
    accentHover: 'hover:border-violet-200/60',
    accentGlow: 'from-violet-500/5',
    tag: 'Collaboration',
    tagBg: 'bg-violet-50 text-violet-600 border-violet-200/50',
    title: 'Role-Based Portals',
    description:
      'Dedicated dashboards for students, faculty, and admins. Each role gets a tailored experience to maximize productivity and oversight.',
  },
  {
    icon: Zap,
    iconBg: 'bg-yellow-100',
    iconBorder: 'border-yellow-200/50',
    iconColor: 'text-yellow-600',
    accentHover: 'hover:border-yellow-200/60',
    accentGlow: 'from-yellow-500/5',
    tag: 'Performance',
    tagBg: 'bg-yellow-50 text-yellow-600 border-yellow-200/50',
    title: 'Lightning Fast',
    description:
      '99% uptime with sub-10ms latency. Built on a robust backend infrastructure ensuring assessments run smoothly even at massive scale.',
  },
];

function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const total = featureCards.length;

  const goTo = useCallback(
    (index, dir) => {
      setDirection(dir);
      setCurrentIndex((index + total) % total);
    },
    [total]
  );

  const prev = () => goTo(currentIndex - 1, -1);
  const next = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  // Show 3 visible cards centered on currentIndex
  const getVisibleIndices = () => {
    return [-1, 0, 1].map((offset) => (currentIndex + offset + total) % total);
  };

  const visibleIndices = getVisibleIndices();

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32" id="features">
      {/* Section Header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200/50 bg-orange-50/50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Everything you need
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Built for modern assessment
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-base">
            A complete ecosystem for institutes — from AI-adaptive tests to granular analytics.
          </p>
        </motion.div>
      </div>

      {/* Carousel */}
      <div
        className="relative max-w-5xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
          {visibleIndices.map((cardIdx, position) => {
            const card = featureCards[cardIdx];
            const Icon = card.icon;
            const isCenter = position === 1;

            return (
              <motion.div
                key={cardIdx}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: position * 0.06 }}
                className={`group relative overflow-hidden rounded-3xl border bg-white/60 backdrop-blur-xl p-8 shadow-sm transition-all duration-300
                  ${isCenter
                    ? `${card.accentHover} shadow-md scale-[1.02] border-gray-200/80 bg-white/90`
                    : `border-gray-200/50 hover:shadow-md ${card.accentHover} opacity-75 hover:opacity-100`
                  }`}
              >
                {/* Glow overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accentGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Tag */}
                  <span className={`self-start mb-5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${card.tagBg}`}>
                    {card.tag}
                  </span>

                  {/* Icon */}
                  <div className={`h-12 w-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-5 border ${card.iconBorder}`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-grow">{card.description}</p>

                  {/* Bottom arrow hint */}
                  <div className={`mt-6 flex items-center gap-1.5 text-xs font-semibold ${card.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Prev / Next Arrows */}
        <button
          onClick={prev}
          className="absolute -left-5 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-slate-900 hover:shadow-lg transition-all duration-200 hover:scale-105 z-20"
          aria-label="Previous feature"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute -right-5 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-slate-900 hover:shadow-lg transition-all duration-200 hover:scale-105 z-20"
          aria-label="Next feature"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dot Navigation */}
      <div className="flex items-center justify-center gap-2 mt-10">
        {featureCards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > currentIndex ? 1 : -1)}
            className={`transition-all duration-300 rounded-full ${i === currentIndex
              ? 'w-6 h-2 bg-orange-500'
              : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            aria-label={`Go to feature ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// --- FOOTER ---
function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <div className="relative flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-orange-400 to-amber-600">
              <Logo className="h-4 w-auto text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-widest uppercase">Skillatics</span>
          </div>

          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>

          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Skillatics Engine.
          </p>
        </div>
      </div>
    </footer>
  );
}
