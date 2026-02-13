import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Clock, X, Check, Flame, Award, ArrowRight, Shield, Swords, Brain as BrainIcon, Star } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

// Simple Confetti Component using Framer Motion
const ConfettiParticle = ({ delay }) => {
    const randomX = Math.random() * 100 - 50; // Random X direction
    const randomY = Math.random() * -100 - 50; // Random Upward force
    const randomRotate = Math.random() * 360;
    const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF00FF'];

    return (
        <motion.div
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{
                opacity: 0,
                x: randomX * 5,
                y: randomY * 5,
                rotate: randomRotate * 2
            }}
            transition={{ duration: 1.5, ease: "easeOut", delay }}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
    );
};

const ConfettiExplosion = () => {
    const particles = Array.from({ length: 30 });
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
            {particles.map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.01} />
            ))}
        </div>
    );
};

export default function GameSession() {
    const { modeId } = useParams();
    const navigate = useNavigate();

    // Game State
    const [gameState, setGameState] = useState('lobby'); // lobby, countdown, playing, result
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Mock Questions Generator (Replace with API call)
    useEffect(() => {
        // Simulate fetching questions
        setTimeout(() => {
            // Mock data
            const mockQuestions = Array.from({ length: 20 }).map((_, i) => ({
                id: i,
                question: `What is the output of 2 + ${i} * 2 ? `,
                options: [`${2 + i * 2} `, `${(2 + i) * 2} `, `${2 + i + 2} `, `${i * 2} `],
                correctAnswer: 0, // Index
                explanation: `Order of operations: Multiplication first.${i} * 2 = ${i * 2}, then + 2 = ${2 + i * 2}.`
            }));
            setQuestions(mockQuestions);
            setLoading(false);
            setGameConfig(modeId);
        }, 1000);
    }, [modeId]);

    const setGameConfig = (mode) => {
        // Config based on mode (time, multipliers etc) - simplistic mock
        if (mode === 'quick-fire') setTimeLeft(60);
        else if (mode === 'streak-master') setTimeLeft(120);
        else setTimeLeft(90);
    };

    // Timer Logic
    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === 'playing') {
            endGame();
        }
    }, [gameState, timeLeft]);

    const startGame = () => {
        setGameState('countdown');
        let count = 3;
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(interval);
                setGameState('playing');
                setCountdown(3); // Reset for next time if needed
            }
        }, 1000);
    };

    const handleAnswer = (index) => {
        if (selectedAnswer !== null) return; // Prevent multiple answers
        setSelectedAnswer(index);

        const isCorrect = index === questions[currentQuestionIndex].correctAnswer;
        setIsAnswerCorrect(isCorrect);

        if (isCorrect) {
            // Score Calculation
            const basePoints = 100;
            const timeBonus = Math.floor(timeLeft / 10); // Simple time bonus
            const points = (basePoints + timeBonus) * multiplier;

            setScore((prev) => prev + points);
            setStreak((prev) => prev + 1);

            // Update Multiplier
            if (streak + 1 >= 5) setMultiplier(3);
            else if (streak + 1 >= 3) setMultiplier(2);

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        } else {
            setStreak(0);
            setMultiplier(1);
        }

        // Auto Advance
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    };

    const nextQuestion = () => {
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            endGame();
        }
    };

    const endGame = () => {
        setGameState('result');
        // Save score to backend here
        // api.post('/gamification/save-score', { score, modeId });
    };

    const quitGame = () => {
        if (window.confirm("Are you sure you want to quit? all progress will be lost.")) {
            navigate('/gamified-assessment');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-indigo-900 text-white">
                <div className="text-center animate-pulse">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                    <h2 className="text-2xl font-bold">Loading Game Assets...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden selection:bg-purple-500">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 via-gray-900 to-black"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>
            </div>

            {/* --- LOBBY SCREEN --- */}
            {gameState === 'lobby' && (
                <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-2xl w-full text-center"
                    >
                        <div className="mb-8 inline-block p-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 shadow-2xl shadow-orange-500/50">
                            <Trophy className="h-16 w-16 text-white" />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-200">
                            Ready to Play?
                        </h1>

                        <p className="text-xl text-indigo-200 mb-10 max-w-lg mx-auto leading-relaxed">
                            You're about to start the <strong>{modeId.replace('-', ' ').toUpperCase()}</strong>.
                            Be quick, be accurate, and build your streak multiplier!
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <div className="font-bold text-lg">{timeLeft}s</div>
                                <div className="text-xs text-gray-400 uppercase">Time Limit</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <div className="font-bold text-lg">{questions.length}</div>
                                <div className="text-xs text-gray-400 uppercase">Questions</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                                <div className="font-bold text-lg">3x</div>
                                <div className="text-xs text-gray-400 uppercase">Max Multiplier</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/gamified-assessment')}
                                className="px-8 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startGame}
                                className="px-10 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="h-5 w-5 fill-current" />
                                Start Game
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* --- COUNTDOWN SCREEN --- */}
            {gameState === 'countdown' && (
                <div className="relative z-10 flex h-screen items-center justify-center">
                    <motion.div
                        key={countdown}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-500 drop-shadow-2xl"
                    >
                        {countdown}
                    </motion.div>
                </div>
            )}

            {/* --- PLAYING SCREEN --- */}
            {gameState === 'playing' && (
                <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col h-screen max-h-screen">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-8 bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Score</span>
                                <span className="text-2xl font-black text-white">{score.toLocaleString()}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className={`absolute inset - 0 bg - orange - 500 blur - md opacity - 50 ${streak > 2 ? 'animate-pulse' : 'hidden'} `}></div>
                                    <Flame className={`relative h - 6 w - 6 ${streak > 2 ? 'text-orange-500' : 'text-gray-400'} `} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Streak</span>
                                    <span className={`text - lg font - bold ${streak > 2 ? 'text-orange-400' : 'text-white'} `}>{streak}x</span>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <span className={`text - xs font - bold px - 2 py - 1 rounded bg - indigo - 600 uppercase ${multiplier > 1 ? 'opacity-100' : 'opacity-0'} `}>
                                    {multiplier}x Multiplier
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`text - 2xl font - mono font - bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'} `}>
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </div>
                            <button onClick={quitGame} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-800 rounded-full mb-8 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}% ` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>

                    {/* Question Area */}
                    <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full relative">
                        {showConfetti && <ConfettiExplosion />}
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white">
                                        {questions[currentQuestionIndex].question}
                                    </h2>
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300 whitespace-nowrap ml-4">
                                        Q{currentQuestionIndex + 1}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                    {questions[currentQuestionIndex].options.map((option, idx) => {
                                        let btnClass = "bg-white/5 hover:bg-white/10 border-white/10"; // Default

                                        if (selectedAnswer !== null) {
                                            if (idx === questions[currentQuestionIndex].correctAnswer) {
                                                btnClass = "bg-green-500/20 border-green-500 text-green-100 ring-2 ring-green-500"; // Correct
                                            } else if (idx === selectedAnswer && idx !== questions[currentQuestionIndex].correctAnswer) {
                                                btnClass = "bg-red-500/20 border-red-500 text-red-100 ring-2 ring-red-500"; // Wrong
                                            } else {
                                                btnClass = "bg-white/5 opacity-50"; // Others
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                disabled={selectedAnswer !== null}
                                                onClick={() => handleAnswer(idx)}
                                                className={`w - full p - 6 text - left rounded - xl border transition - all duration - 200 text - lg font - medium relative overflow - hidden group ${btnClass} `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{option}</span>
                                                    {selectedAnswer !== null && idx === questions[currentQuestionIndex].correctAnswer && (
                                                        <Check className="h-5 w-5 text-green-400" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* --- RESULT SCREEN --- */}
            {gameState === 'result' && (
                <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl"
                    >
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse"></div>
                            <Trophy className="relative h-24 w-24 text-yellow-400 mx-auto drop-shadow-lg" />
                        </div>

                        <h2 className="text-4xl font-black text-white mb-2">Game Over!</h2>
                        <p className="text-indigo-200 mb-8">You showed great skill!</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-black/20 rounded-2xl p-4">
                                <div className="text-xs text-gray-400 uppercase font-bold">Total Score</div>
                                <div className="text-3xl font-black text-white">{score.toLocaleString()}</div>
                            </div>
                            <div className="bg-black/20 rounded-2xl p-4">
                                <div className="text-xs text-gray-400 uppercase font-bold">Best Streak</div>
                                <div className="text-3xl font-black text-orange-400">{streak}x</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setGameState('lobby');
                                    setScore(0);
                                    setStreak(0);
                                    setMultiplier(1);
                                    setCurrentQuestionIndex(0);
                                    setCountdown(3);
                                    // Reset Time logic would be needed here deeply
                                }}
                                className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={() => navigate('/gamified-assessment')}
                                className="w-full py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}
