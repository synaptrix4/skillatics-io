import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TowerControl, Brain, Clock, Heart, CheckCircle2, XCircle, Lightbulb, ArrowUp, Trophy, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LogicLabyrinth() {
    const navigate = useNavigate();
    const [currentFloor, setCurrentFloor] = useState(0);
    const [answer, setAnswer] = useState('');
    const [lives, setLives] = useState(3);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [gameState, setGameState] = useState('playing'); // playing, victory, gameover
    const [completedFloors, setCompletedFloors] = useState([]);

    // Timer
    useEffect(() => {
        if (gameState === 'playing') {
            const timer = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    const floors = [
        {
            floor: 1,
            title: "Number Sequence Cipher",
            description: "The door displays a mysterious number sequence. Find the pattern and complete it!",
            question: "Complete the sequence: 2, 4, 8, 16, __",
            options: ["24", "32", "20", "28"],
            correctAnswer: "32",
            explanation: "Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32",
            hint: "Look at how each number relates to the previous one. Is it being multiplied?",
            type: "multiple-choice"
        },
        {
            floor: 2,
            title: "The Missing Letter",
            description: "Ancient letters are carved into the stone. One is missing!",
            question: "Complete the pattern: A, C, F, J, O, __",
            options: ["P", "U", "T", "S"],
            correctAnswer: "U",
            explanation: "The gaps increase: +1, +2, +3, +4, +5 (A→C is +2, C→F is +3, F→J is +4, J→O is +5, O→U is +6)",
            hint: "Count how many letters between each step. The gap is growing!",
            type: "multiple-choice"
        },
        {
            floor: 3,
            title: "Truth or Lie",
            description: "Two guards stand before you. One always tells the truth, one always lies.",
            question: "Guard A says: 'Guard B would say the left door is safe.' Which door should you choose?",
            options: ["Left door", "Right door", "Both are safe", "Neither is safe"],
            correctAnswer: "Right door",
            explanation: "If B is the liar and left is safe, B would say right. A (truthful) correctly reports B would lie. If B is truthful and right is safe, B would say right. A (the liar) lies about what B would say. Either way, choose opposite of what A reports!",
            hint: "Think about what each guard type would say, then what they would say ABOUT the other guard.",
            type: "multiple-choice"
        },
        {
            floor: 4,
            title: "Grid Logic",
            description: "A 3×3 grid puzzle blocks your path. Each row and column must have unique symbols.",
            question: "In this Sudoku-like grid, if Row 1 is [🔥, 💧, ⚡] and Row 2 is [💧, ⚡, ?], what symbol goes in position (2,3)?",
            options: ["🔥", "💧", "⚡", "Cannot determine"],
            correctAnswer: "🔥",
            explanation: "Row 2 already has 💧 and ⚡, so it must be 🔥. Column 3 has ⚡ in row 1, so row 2 col 3 cannot be ⚡.",
            hint: "Each row must have all three symbols. Row 2 is missing which one?",
            type: "multiple-choice"
        },
        {
            floor: 5,
            title: "Conditional Chains",
            description: "The tower's magic follows strict rules. Deduce the outcome!",
            question: "If 'All wizards wear hats' and 'Some hat-wearers are old' is true, which MUST be true?",
            options: [
                "All wizards are old",
                "Some wizards are old",
                "No wizards are old",
                "None of the above must be true"
            ],
            correctAnswer: "None of the above must be true",
            explanation: "We know wizards wear hats, and some hat-wearers are old. But the old hat-wearers might not be wizards - they could be other people! We cannot conclude anything definite about wizards being old.",
            hint: "'Some hat-wearers are old' doesn't tell us if those old ones are wizards or non-wizards.",
            type: "multiple-choice"
        },
        {
            floor: 6,
            title: "The Clock Riddle",
            description: "An ancient clock shows the wrong time. Solve the logic!",
            question: "If a clock shows 3:15 when it's actually 3:45, how many minutes is it slow?",
            options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"],
            correctAnswer: "30 minutes",
            explanation: "The clock shows 3:15 but it's actually 3:45. The difference is 30 minutes, so the clock is 30 minutes slow.",
            hint: "Subtract what the clock shows from the actual time.",
            type: "multiple-choice"
        },
        {
            floor: 7,
            title: "Venn Diagram Mystery",
            description: "Overlapping circles reveal the path forward.",
            question: "In a class of 30: 18 study Math, 15 study Science, 10 study both. How many study neither?",
            options: ["5", "7", "12", "3"],
            correctAnswer: "7",
            explanation: "Only Math = 18-10 = 8. Only Science = 15-10 = 5. Both = 10. Total studying = 8+5+10 = 23. Neither = 30-23 = 7",
            hint: "Draw it out: Find those who study ONLY Math, ONLY Science, and Both. Subtract from total.",
            type: "multiple-choice"
        },
        {
            floor: 8,
            title: "Probability Portal",
            description: "Chance and logic intertwine. Choose wisely!",
            question: "You flip 3 fair coins. What's the probability of getting at least 2 heads?",
            options: ["1/2", "1/4", "3/8", "1/8"],
            correctAnswer: "1/2",
            explanation: "Outcomes with ≥2 heads: HHH, HHT, HTH, THH = 4 out of 8 possible outcomes. 4/8 = 1/2",
            hint: "List all 8 possible outcomes (HHH, HHT, HTH, etc.) and count how many have 2 or 3 heads.",
            type: "multiple-choice"
        },
        {
            floor: 9,
            title: "Code Breaking",
            description: "The final door requires cracking a numerical code.",
            question: "If A=1, B=2, C=3... what word equals 52 when you sum its letters?",
            options: ["LOVE", "HOPE", "LIFE", "ZONE"],
            correctAnswer: "ZONE",
            explanation: "ZONE: Z(26) + O(15) + N(14) + E(5) = 60. Wait, let me recalculate... Actually, let's check all: LOVE=54, HOPE=44, LIFE=32, ZONE=60. None equal 52! But MATH=42, HELP=36... This needs fixing!",
            hint: "Add up the position of each letter in the alphabet.",
            type: "multiple-choice"
        },
        {
            floor: 10,
            title: "The Final Escape",
            description: "You've reached the tower's peak. One last challenge remains!",
            question: "A farmer needs to cross a river with a fox, chicken, and grain. The boat fits only the farmer + 1 item. Fox eats chicken, chicken eats grain if left alone. How many trips minimum?",
            options: ["5", "7", "9", "11"],
            correctAnswer: "7",
            explanation: "1) Take chicken across. 2) Return alone. 3) Take fox across. 4) Return WITH chicken. 5) Take grain across. 6) Return alone. 7) Take chicken across. Total: 7 trips!",
            hint: "The trick is to bring the chicken BACK on one of your return trips to prevent it from being eaten or eating!",
            type: "multiple-choice"
        }
    ];

    // Fix floor 9's data
    floors[8] = {
        floor: 9,
        title: "Code Breaking",
        description: "The final door requires cracking a numerical code.",
        question: "If A=1, B=2, C=3... what word equals 42 when you sum its letters?",
        options: ["LOVE", "MATH", "HELP", "ZONE"],
        correctAnswer: "MATH",
        explanation: "MATH: M(13) + A(1) + T(20) + H(8) = 42",
        hint: "Add up the position of each letter in the alphabet. M=13, A=1, etc.",
        type: "multiple-choice"
    };

    const checkAnswer = () => {
        const floor = floors[currentFloor];

        if (answer.trim() === floor.correctAnswer) {
            toast.success('Correct! Door unlocked! 🎉');
            setCompletedFloors([...completedFloors, currentFloor]);

            if (currentFloor === floors.length - 1) {
                // Victory!
                setGameState('victory');
            } else {
                setTimeout(() => {
                    setCurrentFloor(currentFloor + 1);
                    setAnswer('');
                    setShowHint(false);
                }, 1500);
            }
        } else {
            const newLives = lives - 1;
            setLives(newLives);

            if (newLives === 0) {
                toast.error('Game Over! No lives remaining.');
                setGameState('gameover');
            } else {
                toast.error(`Wrong answer! ${newLives} lives remaining.`);
            }
        }
    };

    const restartGame = () => {
        setCurrentFloor(0);
        setAnswer('');
        setLives(3);
        setTimeElapsed(0);
        setShowHint(false);
        setGameState('playing');
        setCompletedFloors([]);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Victory Screen
    if (gameState === 'victory') {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 p-8 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/40 blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-200/40 blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-3xl p-8 text-center"
                >
                    <Trophy className="h-24 w-24 text-amber-500 mx-auto mb-6 drop-shadow-sm" />
                    <h1 className="text-4xl font-black mb-4 text-slate-900">Freedom!</h1>
                    <p className="text-slate-600 font-medium mb-6">You've escaped the Logic Labyrinth!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <div className="text-2xl font-bold text-blue-700">{formatTime(timeElapsed)}</div>
                            <div className="text-xs text-blue-600/80 font-bold uppercase tracking-wider mt-1">Time</div>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                            <Heart className="h-6 w-6 mx-auto mb-2 text-rose-500" />
                            <div className="text-2xl font-bold text-rose-700">{lives}</div>
                            <div className="text-xs text-rose-600/80 font-bold uppercase tracking-wider mt-1">Lives Left</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={restartGame}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg rounded-xl font-bold transition-all hover:-translate-y-1"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => navigate('/gamified-assessment')}
                            className="w-full py-3 bg-white border border-gray-200 text-slate-700 hover:text-orange-500 hover:border-orange-200 shadow-sm hover:shadow-md rounded-xl font-bold transition-all hover:-translate-y-1"
                        >
                            Back to Games
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Game Over Screen
    if (gameState === 'gameover') {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 p-8 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-200/50 blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-200/50 blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-3xl p-8 text-center"
                >
                    <XCircle className="h-24 w-24 text-rose-500 mx-auto mb-6 drop-shadow-sm" />
                    <h1 className="text-4xl font-black mb-4 text-slate-900">Trapped!</h1>
                    <p className="text-slate-600 font-medium mb-6">You ran out of lives on Floor {currentFloor + 1}</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">You made it to:</div>
                        <div className="text-3xl font-black text-rose-600">Floor {currentFloor + 1} / {floors.length}</div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={restartGame}
                            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg rounded-xl font-bold transition-all hover:-translate-y-1"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/gamified-assessment')}
                            className="w-full py-3 bg-white border border-gray-200 text-slate-700 hover:text-orange-500 hover:border-orange-200 shadow-sm hover:shadow-md rounded-xl font-bold transition-all hover:-translate-y-1"
                        >
                            Back to Games
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Playing Screen
    const floor = floors[currentFloor];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-slate-900">
                        <TowerControl className="h-8 w-8 text-indigo-500" />
                        Logic Labyrinth
                    </h1>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-sm hover:shadow-md rounded-lg transition-all flex items-center gap-2 font-medium hover:-translate-y-1"
                    >
                        <Home className="h-4 w-4" />
                        Exit
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ArrowUp className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold text-slate-700">Floor <span className="text-emerald-600">{currentFloor + 1}</span>/{floors.length}</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="font-mono font-bold text-slate-700">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Heart
                                    key={i}
                                    className={`h-5 w-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Challenge */}
            <div className="max-w-4xl mx-auto">
                <motion.div
                    key={currentFloor}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-sm"
                >
                    {/* Floor Header */}
                    <div className="mb-6">
                        <div className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-2">Floor {floor.floor}</div>
                        <h2 className="text-3xl font-black mb-3 text-slate-900">{floor.title}</h2>
                        <p className="text-slate-600 leading-relaxed font-medium">{floor.description}</p>
                    </div>

                    {/* Question */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Brain className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                            <p className="text-lg font-bold text-amber-900">{floor.question}</p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {floor.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => setAnswer(option)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${answer === option
                                    ? 'bg-indigo-50 border-indigo-400 shadow-md transform -translate-y-1'
                                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${answer === option ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                                        }`}>
                                        {answer === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className={`font-medium ${answer === option ? 'text-indigo-900' : 'text-slate-700'}`}>{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={checkAnswer}
                            disabled={!answer}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white shadow-md rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:-translate-y-1 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            Submit Answer
                        </button>
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="px-6 py-4 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold transition-all hover:-translate-y-1 shadow-sm"
                        >
                            <Lightbulb className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Hint */}
                    <AnimatePresence>
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm"
                            >
                                <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Hint:
                                </h4>
                                <p className="text-emerald-800 text-sm font-medium">{floor.hint}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Floor Progress */}
                <div className="mt-6 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Progress</div>
                    <div className="flex gap-1 h-3">
                        {floors.map((_, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 rounded-full transition-colors duration-300 ${idx < currentFloor
                                    ? 'bg-emerald-400'
                                    : idx === currentFloor
                                        ? 'bg-indigo-500 scale-y-125 shadow-sm'
                                        : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
