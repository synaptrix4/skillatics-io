import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Code, PlayCircle, Lightbulb, CheckCircle2, XCircle, Trophy, Home, Unlock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DebugDungeon() {
    const navigate = useNavigate();
    const [currentRoom, setCurrentRoom] = useState(0);
    const [code, setCode] = useState('');
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [testOutput, setTestOutput] = useState(null);
    const [gameState, setGameState] = useState('playing'); // playing, victory
    const [completedRooms, setCompletedRooms] = useState([]);

    const rooms = [
        {
            room: 1,
            title: "Syntax Error Cell",
            language: "Python",
            description: "The door mechanism has a simple syntax error. Fix it to unlock!",
            buggyCode: "def unlock_door():\n  print('Door unlocked')\n  return True\n\nunlock_door(",
            fixedCode: "def unlock_door():\n  print('Door unlocked')\n  return True\n\nunlock_door()",
            bug: "Missing closing parenthesis",
            hint: "Look at the function call on the last line. Is it complete?",
            testCases: [
                { description: "Function executes without error", shouldPass: true }
            ],
            xp: 20
        },
        {
            room: 2,
            title: "Indentation Prison",
            language: "Python",
            description: "Python's indentation is broken. Align the code properly!",
            buggyCode: "def check_key(key):\nif key == 'gold':\nreturn True\nelse:\nreturn False",
            fixedCode: "def check_key(key):\n  if key == 'gold':\n    return True\n  else:\n    return False",
            bug: "Incorrect indentation",
            hint: "Python requires consistent indentation. Use 2 or 4 spaces for each level.",
            testCases: [
                { input: "gold", expected: true },
                { input: "silver", expected: false }
            ],
            xp: 25
        },
        {
            room: 3,
            title: "Off-by-One Chamber",
            language: "Python",
            description: "A classic off-by-one error prevents escape!",
            buggyCode: "def count_keys(keys):\n  total = 0\n  for i in range(len(keys) - 1):\n    total += 1\n  return total",
            fixedCode: "def count_keys(keys):\n  total = 0\n  for i in range(len(keys)):\n    total += 1\n  return total",
            bug: "Loop range is too short by 1",
            hint: "range(len(keys) - 1) will miss the last element. What should it be?",
            testCases: [
                { input: [[1, 2, 3, 4, 5]], expected: 5 },
                { input: [[1, 2]], expected: 2 }
            ],
            xp: 30
        },
        {
            room: 4,
            title: "Type Confusion Corridor",
            language: "JavaScript",
            description: "Type mismatch is blocking the door!",
            buggyCode: "function addNumbers(a, b) {\n  return a + b;\n}\n\nconst result = addNumbers('5', '10');\n// Should return 15, not '510'",
            fixedCode: "function addNumbers(a, b) {\n  return Number(a) + Number(b);\n}\n\nconst result = addNumbers('5', '10');",
            bug: "String concatenation instead of addition",
            hint: "Convert strings to numbers before adding. Use Number() or parseInt().",
            testCases: [
                { input: ["5", "10"], expected: 15 },
                { input: ["3", "7"], expected: 10 }
            ],
            xp: 35
        },
        {
            room: 5,
            title: "Null Pointer Vault",
            language: "JavaScript",
            description: "Null reference error! Handle the null case.",
            buggyCode: "function getKeyLength(key) {\n  return key.length;\n}\n\ngetKeyLength(null);",
            fixedCode: "function getKeyLength(key) {\n  if (key === null || key === undefined) {\n    return 0;\n  }\n  return key.length;\n}",
            bug: "No null check before accessing property",
            hint: "Check if key is null or undefined before accessing .length",
            testCases: [
                { input: [null], expected: 0 },
                { input: ["gold"], expected: 4 }
            ],
            xp: 40
        },
        {
            room: 6,
            title: "Infinite Loop Trap",
            language: "Python",
            description: "The loop never ends! Fix the condition.",
            buggyCode: "def open_locks():\n  count = 0\n  while count < 5:\n    print('Opening lock')\n  return count",
            fixedCode: "def open_locks():\n  count = 0\n  while count < 5:\n    print('Opening lock')\n    count += 1\n  return count",
            bug: "Counter never increments",
            hint: "The while loop needs to change the condition variable. Increment count!",
            testCases: [
                { expected: 5 }
            ],
            xp: 35
        },
        {
            room: 7,
            title: "Array Index Hell",
            language: "Java",
            description: "ArrayIndexOutOfBoundsException! Fix the index.",
            buggyCode: "public static int getLastKey(int[] keys) {\n  return keys[keys.length];\n}",
            fixedCode: "public static int getLastKey(int[] keys) {\n  return keys[keys.length - 1];\n}",
            bug: "Array index is 0-based, so last element is at length-1",
            hint: "Arrays are 0-indexed. Last element is at index length - 1, not length.",
            testCases: [
                { input: [[1, 2, 3]], expected: 3 },
                { input: [[10, 20]], expected: 20 }
            ],
            xp: 30
        },
        {
            room: 8,
            title: "Comparison Catastrophe",
            language: "JavaScript",
            description: "Using = instead of == or ===. Fix the comparison!",
            buggyCode: "function isDoorOpen(status) {\n  if (status = 'open') {\n    return true;\n  }\n  return false;\n}",
            fixedCode: "function isDoorOpen(status) {\n  if (status === 'open') {\n    return true;\n  }\n  return false;\n}",
            bug: "Assignment (=) instead of comparison (===)",
            hint: "Use === for comparison, not = (which is assignment).",
            testCases: [
                { input: ["open"], expected: true },
                { input: ["closed"], expected: false }
            ],
            xp: 25
        },
        {
            room: 9,
            title: "Variable Scope Shadow",
            language: "Python",
            description: "Variable shadowing causes wrong result!",
            buggyCode: "total = 100\n\ndef add_keys(value):\n  total = 0\n  total += value\n  return total\n\nresult = add_keys(50)\n# Should return 150, not 50",
            fixedCode: "total = 100\n\ndef add_keys(value):\n  global total\n  total += value\n  return total\n\nresult = add_keys(50)",
            bug: "Local variable shadows global, use 'global' keyword",
            hint: "To modify global variable inside function, use 'global' keyword.",
            testCases: [
                { input: [50], expected: 150 }
            ],
            xp: 45
        },
        {
            room: 10,
            title: "String vs Number Mix",
            language: "Python",
            description: "Type mismatch in comparison. Fix the types!",
            buggyCode: "def check_code(code):\n  return code == 42\n\ncheck_code('42')",
            fixedCode: "def check_code(code):\n  return int(code) == 42\n\ncheck_code('42')",
            bug: "Comparing string to int without conversion",
            hint: "Convert the string to int before comparing: int(code)",
            testCases: [
                { input: ["42"], expected: true },
                { input: ["99"], expected: false }
            ],
            xp: 30
        },
        {
            room: 11,
            title: "Missing Return Abyss",
            language: "JavaScript",
            description: "Function doesn't return anything!",
            buggyCode: "function calculateTotal(items) {\n  let total = 0;\n  for (let item of items) {\n    total += item;\n  }\n}",
            fixedCode: "function calculateTotal(items) {\n  let total = 0;\n  for (let item of items) {\n    total += item;\n  }\n  return total;\n}",
            bug: "Missing return statement",
            hint: "Add 'return total;' at the end of the function.",
            testCases: [
                { input: [[1, 2, 3]], expected: 6 },
                { input: [[5, 10]], expected: 15 }
            ],
            xp: 25
        },
        {
            room: 12,
            title: "Division by Zero Pit",
            language: "Python",
            description: "Attempting division by zero! Add a check.",
            buggyCode: "def divide_keys(total, count):\n  return total / count",
            fixedCode: "def divide_keys(total, count):\n  if count == 0:\n    return 0\n  return total / count",
            bug: "No check for division by zero",
            hint: "Check if count is 0 before dividing. Return 0 if count is 0.",
            testCases: [
                { input: [10, 2], expected: 5 },
                { input: [10, 0], expected: 0 }
            ],
            xp: 35
        },
        {
            room: 13,
            title: "Reversed Logic Gate",
            language: "JavaScript",
            description: "The condition is backwards!",
            buggyCode: "function canEscape(hasKey) {\n  if (!hasKey) {\n    return true;\n  }\n  return false;\n}",
            fixedCode: "function canEscape(hasKey) {\n  if (hasKey) {\n    return true;\n  }\n  return false;\n}",
            bug: "Negation operator (!) makes logic opposite",
            hint: "Remove the ! (not operator) from the condition.",
            testCases: [
                { input: [true], expected: true },
                { input: [false], expected: false }
            ],
            xp: 20
        },
        {
            room: 14,
            title: "Object Property Mistake",
            language: "JavaScript",
            description: "Accessing wrong property name!",
            buggyCode: "function getDoorCode(door) {\n  return door.code;\n}\n\nconst myDoor = { passcode: 1234 };\ngetDoorCode(myDoor);",
            fixedCode: "function getDoorCode(door) {\n  return door.passcode;\n}\n\nconst myDoor = { passcode: 1234 };",
            bug: "Property name mismatch: 'code' vs 'passcode'",
            hint: "The object has 'passcode', not 'code'. Update the property name.",
            testCases: [
                { input: [{ passcode: 1234 }], expected: 1234 }
            ],
            xp: 25
        },
        {
            room: 15,
            title: "Final Boss: The Ultimate Bug",
            language: "Python",
            description: "Multiple bugs! Fix them all to escape the dungeon!",
            buggyCode: "def escape_dungeon(keys):\n  total = 0\n  for i in range(len(keys) - 1):\n  total += keys[i]\n  if total = 100:\n    return True\n  return False",
            fixedCode: "def escape_dungeon(keys):\n  total = 0\n  for i in range(len(keys)):\n    total += keys[i]\n  if total == 100:\n    return True\n  return False",
            bug: "Three bugs: off-by-one, indentation, assignment instead of comparison",
            hint: "Look for: 1) Loop range 2) Indentation 3) = vs ==",
            testCases: [
                { input: [[25, 25, 25, 25]], expected: true },
                { input: [[10, 20, 30]], expected: false }
            ],
            xp: 60
        }
    ];

    useState(() => {
        setCode(rooms[0].buggyCode);
    }, []);

    const checkSolution = () => {
        const room = rooms[currentRoom];

        // Simple check: compare trimmed code (in production, use AST comparison or actual execution)
        const userCodeNormalized = code.trim().replace(/\s+/g, ' ');
        const fixedCodeNormalized = room.fixedCode.trim().replace(/\s+/g, ' ');

        const isFixed = userCodeNormalized === fixedCodeNormalized;

        if (isFixed) {
            toast.success('Bug Fixed! Door Unlocked! 🎉');
            setCompletedRooms([...completedRooms, currentRoom]);

            if (currentRoom === rooms.length - 1) {
                setGameState('victory');
            } else {
                setTimeout(() => {
                    const nextRoom = currentRoom + 1;
                    setCurrentRoom(nextRoom);
                    setCode(rooms[nextRoom].buggyCode);
                    setShowHint(false);
                    setTestOutput(null);
                }, 1500);
            }
        } else {
            toast.error('Not quite. The bug is still there!');
            setTestOutput({
                passed: false,
                message: `Expected the code to match the solution. Hint: ${room.bug}`
            });
        }
    };

    const useHint = () => {
        setShowHint(true);
        setHintsUsed(hintsUsed + 1);
        toast.info('Hint revealed!');
    };

    const resetCode = () => {
        setCode(rooms[currentRoom].buggyCode);
        toast.info('Code reset to original');
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
                    <p className="text-slate-600 font-medium mb-6">You've debugged your way out of the dungeon!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                            <div className="text-2xl font-bold text-emerald-700">{completedRooms.length}</div>
                            <div className="text-xs text-emerald-600/80 font-bold uppercase tracking-wider mt-1">Rooms Cleared</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <Lightbulb className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                            <div className="text-2xl font-bold text-amber-700">{hintsUsed}</div>
                            <div className="text-xs text-amber-600/80 font-bold uppercase tracking-wider mt-1">Hints Used</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total XP Earned</div>
                        <div className="text-3xl font-black text-orange-500">
                            {rooms.reduce((sum, room) => sum + room.xp, 0)}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setCurrentRoom(0);
                                setCode(rooms[0].buggyCode);
                                setHintsUsed(0);
                                setCompletedRooms([]);
                                setGameState('playing');
                            }}
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

    // Playing Screen
    const room = rooms[currentRoom];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-200/40 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-200/40 blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-slate-900">
                        <Bug className="h-8 w-8 text-rose-500" />
                        Debug Dungeon
                    </h1>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:text-rose-500 hover:border-rose-200 shadow-sm hover:shadow-md rounded-lg transition-all flex items-center gap-2 font-medium hover:-translate-y-1"
                    >
                        <Home className="h-4 w-4" />
                        Exit
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Room {currentRoom + 1} / {rooms.length}</span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{completedRooms.length} Cleared</span>
                    </div>
                    <div className="flex gap-1 h-3">
                        {rooms.map((_, idx) => (
                            <div
                                key={idx}
                                className={`flex-1 rounded-full transition-colors duration-300 ${completedRooms.includes(idx)
                                    ? 'bg-emerald-400'
                                    : idx === currentRoom
                                        ? 'bg-rose-500 scale-y-125 shadow-sm'
                                        : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-6">
                {/* Left Panel - Info */}
                <div className="md:col-span-2 space-y-6">
                    <motion.div
                        key={currentRoom}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-1">Room {room.room}</div>
                                <h2 className="text-2xl font-black text-slate-900">{room.title}</h2>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold">
                                {room.language}
                            </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-6 font-medium">{room.description}</p>

                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-2">
                                <Bug className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-rose-700 text-sm mb-1 uppercase tracking-wider">Bug Type:</div>
                                    <div className="text-rose-800 text-sm font-medium">{room.bug}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={useHint}
                                className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                            >
                                <Lightbulb className="h-5 w-5" />
                                {showHint ? "Hint Shown" : "Need Hint?"}
                            </button>
                            <button
                                onClick={resetCode}
                                className="px-6 py-3 bg-white border border-gray-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 shadow-sm hover:shadow-md rounded-xl font-semibold transition-all hover:-translate-y-1"
                            >
                                Reset
                            </button>
                        </div>

                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm"
                            >
                                <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Hint:
                                </h4>
                                <p className="text-amber-800 text-sm font-medium">{room.hint}</p>
                            </motion.div>
                        )}

                        {testOutput && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`mt-4 rounded-xl p-4 border shadow-sm ${testOutput.passed
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border-rose-200 text-rose-800'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {testOutput.passed ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-rose-500" />
                                    )}
                                    <span className="font-bold">{testOutput.passed ? 'Success!' : 'Not Fixed Yet'}</span>
                                </div>
                                <p className="text-sm font-medium">{testOutput.message}</p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* XP Reward */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
                        <div className="text-amber-500 font-black text-2xl">+{room.xp} XP</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Reward for fixing this bug</div>
                    </div>
                </div>

                {/* Right Panel - Code Editor */}
                <div className="md:col-span-3">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                                <Code className="h-5 w-5 text-blue-500" />
                                Code Editor
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                {completedRooms.includes(currentRoom) ? (
                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                        <Unlock className="h-4 w-4" />
                                        Fixed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                                        <Lock className="h-4 w-4" />
                                        Locked
                                    </span>
                                )}
                            </div>
                        </div>

                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full flex-1 min-h-[400px] bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4 resize-none shadow-inner"
                            spellCheck="false"
                        />

                        <button
                            onClick={checkSolution}
                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-lg hover:-translate-y-1"
                        >
                            <PlayCircle className="h-6 w-6" />
                            Test Solution
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
