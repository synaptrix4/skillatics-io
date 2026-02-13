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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white p-8 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center"
                >
                    <Trophy className="h-24 w-24 text-yellow-400 mx-auto mb-6" />
                    <h1 className="text-4xl font-black mb-4">Freedom!</h1>
                    <p className="text-green-200 mb-6">You've escaped the Logic Labyrinth!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-black/20 rounded-xl p-4">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                            <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                            <div className="text-xs text-gray-400">Time</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-4">
                            <Heart className="h-6 w-6 mx-auto mb-2 text-red-400" />
                            <div className="text-2xl font-bold">{lives}</div>
                            <div className="text-xs text-gray-400">Lives Left</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={restartGame}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => navigate('/gamified-assessment')}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white p-8 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center"
                >
                    <XCircle className="h-24 w-24 text-red-400 mx-auto mb-6" />
                    <h1 className="text-4xl font-black mb-4">Trapped!</h1>
                    <p className="text-red-200 mb-6">You ran out of lives on Floor {currentFloor + 1}</p>

                    <div className="bg-white/5 rounded-xl p-4 mb-8">
                        <div className="text-sm text-gray-400 mb-2">You made it to:</div>
                        <div className="text-3xl font-bold">Floor {currentFloor + 1} / {floors.length}</div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={restartGame}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/gamified-assessment')}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                        <TowerControl className="h-8 w-8 text-purple-400" />
                        Logic Labyrinth
                    </h1>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all flex items-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Exit
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-4 bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <ArrowUp className="h-5 w-5 text-green-400" />
                        <span className="font-bold">Floor {currentFloor + 1}/{floors.length}</span>
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <span className="font-mono">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <Heart
                                    key={i}
                                    className={`h-5 w-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
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
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
                >
                    {/* Floor Header */}
                    <div className="mb-6">
                        <div className="text-sm text-purple-300 mb-2">Floor {floor.floor}</div>
                        <h2 className="text-3xl font-black mb-3">{floor.title}</h2>
                        <p className="text-indigo-200 leading-relaxed">{floor.description}</p>
                    </div>

                    {/* Question */}
                    <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <Brain className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
                            <p className="text-lg font-semibold text-yellow-50">{floor.question}</p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {floor.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => setAnswer(option)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answer === option
                                        ? 'bg-indigo-500/30 border-indigo-400'
                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answer === option ? 'border-indigo-400 bg-indigo-500' : 'border-gray-400'
                                        }`}>
                                        {answer === option && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="font-medium">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={checkAnswer}
                            disabled={!answer}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            Submit Answer
                        </button>
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all"
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
                                className="mt-4 bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                            >
                                <h4 className="font-bold text-green-300 mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Hint:
                                </h4>
                                <p className="text-green-100 text-sm">{floor.hint}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Floor Progress */}
                <div className="mt-6 bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">Progress</div>
                    <div className="flex gap-2">
                        {floors.map((_, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 h-2 rounded-full ${idx < currentFloor
                                        ? 'bg-green-500'
                                        : idx === currentFloor
                                            ? 'bg-indigo-500'
                                            : 'bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
