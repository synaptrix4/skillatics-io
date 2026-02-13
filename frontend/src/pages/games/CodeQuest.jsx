import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Star, Zap, ArrowRight, Lightbulb, Code, PlayCircle, CheckCircle2, Lock, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CodeQuest() {
    const navigate = useNavigate();
    const [currentRealm, setCurrentRealm] = useState(0);
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [code, setCode] = useState('');
    const [xp, setXp] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [gameState, setGameState] = useState('map'); // map, challenge, victory

    const realms = [
        {
            id: 0,
            name: "Arrays Village",
            icon: "🏘️",
            description: "Master the basics of array manipulation",
            color: "from-blue-500 to-cyan-500",
            challenges: [
                {
                    title: "Find the Maximum",
                    story: "The village elder needs to find the tallest warrior. Help by finding the maximum value in the array.",
                    difficulty: "Easy",
                    xp: 30,
                    starter: "def find_max(warriors):\n    # Find and return the maximum value\n    pass",
                    solution: "def find_max(warriors):\n    return max(warriors)",
                    testCases: [
                        { input: [[1, 5, 3, 9, 2]], expected: 9 },
                        { input: [[10, 20, 30]], expected: 30 },
                        { input: [[-5, -1, -10]], expected: -1 }
                    ],
                    hint: "Use the max() function or loop through the array keeping track of the largest value seen."
                },
                {
                    title: "Reverse the Formation",
                    story: "The warriors need to reverse their battle formation. Reverse the array!",
                    difficulty: "Easy",
                    xp: 35,
                    starter: "def reverse_array(formation):\n    # Return reversed array\n    pass",
                    solution: "def reverse_array(formation):\n    return formation[::-1]",
                    testCases: [
                        { input: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
                        { input: [['a', 'b', 'c']], expected: ['c', 'b', 'a'] },
                        { input: [[5]], expected: [5] }
                    ],
                    hint: "Python has a slice notation [::-1] that reverses sequences."
                },
                {
                    title: "Remove Duplicates",
                    story: "Some warriors were counted twice! Remove duplicate values from the array.",
                    difficulty: "Medium",
                    xp: 40,
                    starter: "def remove_duplicates(warriors):\n    # Return array with unique values only\n    pass",
                    solution: "def remove_duplicates(warriors):\n    return list(set(warriors))",
                    testCases: [
                        { input: [[1, 2, 2, 3, 4, 4]], expected: [1, 2, 3, 4] },
                        { input: [['a', 'b', 'a', 'c']], expected: ['a', 'b', 'c'] },
                        { input: [[5, 5, 5]], expected: [5] }
                    ],
                    hint: "Convert to a set to get unique values, then back to list."
                }
            ]
        },
        {
            id: 1,
            name: "Linked List Forest",
            icon: "🌲",
            description: "Navigate through connected nodes",
            color: "from-green-500 to-emerald-600",
            challenges: [
                {
                    title: "Count the Chain",
                    story: "Trees in the forest are linked. Count how many trees are in the chain.",
                    difficulty: "Medium",
                    xp: 50,
                    starter: "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\ndef count_nodes(head):\n    # Count nodes in linked list\n    pass",
                    solution: "def count_nodes(head):\n    count = 0\n    current = head\n    while current:\n        count += 1\n        current = current.next\n    return count",
                    testCases: [
                        { input: "linked_list([1,2,3])", expected: 3 },
                        { input: "linked_list([1])", expected: 1 },
                        { input: "linked_list([])", expected: 0 }
                    ],
                    hint: "Traverse the list using a while loop, counting each node until you reach None."
                },
                {
                    title: "Find the Middle Tree",
                    story: "The sacred tree is in the middle of the chain. Find it!",
                    difficulty: "Medium",
                    xp: 55,
                    starter: "def find_middle(head):\n    # Find middle node value\n    pass",
                    solution: "def find_middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.val if slow else None",
                    testCases: [
                        { input: "linked_list([1,2,3,4,5])", expected: 3 },
                        { input: "linked_list([1,2,3,4])", expected: 3 },
                        { input: "linked_list([7])", expected: 7 }
                    ],
                    hint: "Use two pointers: slow (moves 1 step) and fast (moves 2 steps). When fast reaches the end, slow is at the middle."
                }
            ]
        },
        {
            id: 2,
            name: "Stack Mountain",
            icon: "⛰️",
            description: "Master Last-In-First-Out operations",
            color: "from-orange-500 to-red-600",
            challenges: [
                {
                    title: "Balanced Brackets",
                    story: "The mountain gate has magical brackets. Check if they're balanced!",
                    difficulty: "Medium",
                    xp: 60,
                    starter: "def is_balanced(brackets):\n    # Check if brackets are balanced\n    pass",
                    solution: "def is_balanced(brackets):\n    stack = []\n    pairs = {'(': ')', '[': ']', '{': '}'}\n    for char in brackets:\n        if char in pairs:\n            stack.append(char)\n        elif not stack or pairs[stack.pop()] != char:\n            return False\n    return len(stack) == 0",
                    testCases: [
                        { input: ["()"], expected: true },
                        { input: ["({[]})"], expected: true },
                        { input: ["(]"], expected: false },
                        { input: ["(("], expected: false }
                    ],
                    hint: "Use a stack. Push opening brackets, pop and compare when you see closing brackets."
                },
                {
                    title: "Reverse Polish Notation",
                    story: "Decode the ancient mountain inscriptions using RPN.",
                    difficulty: "Hard",
                    xp: 70,
                    starter: "def eval_rpn(tokens):\n    # Evaluate RPN expression\n    pass",
                    solution: "def eval_rpn(tokens):\n    stack = []\n    for token in tokens:\n        if token in '+-*/':\n            b, a = stack.pop(), stack.pop()\n            stack.append(int(eval(f'{a}{token}{b}')))\n        else:\n            stack.append(int(token))\n    return stack[0]",
                    testCases: [
                        { input: [["2", "1", "+", "3", "*"]], expected: 9 },
                        { input: [["4", "13", "5", "/", "+"]], expected: 6 }
                    ],
                    hint: "Push numbers onto stack. When you see an operator, pop two numbers, apply operation, push result."
                }
            ]
        },
        {
            id: 3,
            name: "Queue River",
            icon: "🌊",
            description: "Flow with First-In-First-Out",
            color: "from-cyan-500 to-blue-600",
            challenges: [
                {
                    title: "Ferry Queue",
                    story: "People wait in line for the ferry. Process them in order!",
                    difficulty: "Easy",
                    xp: 45,
                    starter: "from collections import deque\n\ndef process_queue(people, k):\n    # Process first k people from queue\n    pass",
                    solution: "from collections import deque\n\ndef process_queue(people, k):\n    q = deque(people)\n    result = []\n    for _ in range(min(k, len(q))):\n        result.append(q.popleft())\n    return result",
                    testCases: [
                        { input: [["A", "B", "C", "D"], 2], expected: ["A", "B"] },
                        { input: [["X", "Y", "Z"], 5], expected: ["X", "Y", "Z"] }
                    ],
                    hint: "Use deque and popleft() to remove from front of queue."
                }
            ]
        },
        {
            id: 4,
            name: "Tree Castle",
            icon: "🏰",
            description: "Traverse the royal tree structure",
            color: "from-purple-500 to-pink-600",
            challenges: [
                {
                    title: "Count the Rooms",
                    story: "Count all rooms in the castle's tree structure.",
                    difficulty: "Medium",
                    xp: 65,
                    starter: "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef count_nodes(root):\n    # Count all nodes in tree\n    pass",
                    solution: "def count_nodes(root):\n    if not root:\n        return 0\n    return 1 + count_nodes(root.left) + count_nodes(root.right)",
                    testCases: [
                        { input: "tree([1,2,3,4,5])", expected: 5 },
                        { input: "tree([1])", expected: 1 },
                        { input: "tree([])", expected: 0 }
                    ],
                    hint: "Use recursion: count current node (1) + count left subtree + count right subtree."
                },
                {
                    title: "Maximum Depth",
                    story: "Find the deepest level of the castle.",
                    difficulty: "Medium",
                    xp: 70,
                    starter: "def max_depth(root):\n    # Find maximum depth of tree\n    pass",
                    solution: "def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))",
                    testCases: [
                        { input: "tree([3,9,20,null,null,15,7])", expected: 3 },
                        { input: "tree([1,null,2])", expected: 2 }
                    ],
                    hint: "Recursively find max depth of left and right subtrees, add 1 for current level."
                }
            ]
        }
    ];

    const runTests = () => {
        const challenge = realms[currentRealm].challenges[currentChallenge];

        try {
            // Simple test runner - in production, use a secure sandbox
            const results = challenge.testCases.map((test, idx) => {
                try {
                    // This is a simplified version - real implementation would need proper sandboxing
                    const userFunction = new Function('return ' + code)();
                    const result = userFunction(...test.input);
                    const passed = JSON.stringify(result) === JSON.stringify(test.expected);

                    return {
                        testNum: idx + 1,
                        passed,
                        input: test.input,
                        expected: test.expected,
                        actual: result
                    };
                } catch (error) {
                    return {
                        testNum: idx + 1,
                        passed: false,
                        error: error.message
                    };
                }
            });

            setTestResults(results);

            const allPassed = results.every(r => r.passed);
            if (allPassed) {
                toast.success('All tests passed! 🎉');
                const challengeId = `${currentRealm}-${currentChallenge}`;
                if (!completedChallenges.includes(challengeId)) {
                    setCompletedChallenges([...completedChallenges, challengeId]);
                    setXp(xp + challenge.xp);

                    // Check if realm completed
                    const realmChallenges = realms[currentRealm].challenges.length;
                    const completedInRealm = completedChallenges.filter(c => c.startsWith(`${currentRealm}-`)).length;

                    if (completedInRealm + 1 === realmChallenges) {
                        setTimeout(() => {
                            toast.success('Realm Complete! Moving to map...');
                            setGameState('map');
                        }, 2000);
                    }
                }
            } else {
                toast.error('Some tests failed. Keep trying!');
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const startChallenge = (realmIdx, challengeIdx) => {
        setCurrentRealm(realmIdx);
        setCurrentChallenge(challengeIdx);
        setCode(realms[realmIdx].challenges[challengeIdx].starter);
        setTestResults(null);
        setShowHint(false);
        setGameState('challenge');
    };

    const isRealmUnlocked = (realmIdx) => {
        if (realmIdx === 0) return true;
        // Unlock next realm when previous is completed
        const prevRealmChallenges = realms[realmIdx - 1].challenges.length;
        const completedInPrevRealm = completedChallenges.filter(c => c.startsWith(`${realmIdx - 1}-`)).length;
        return completedInPrevRealm === prevRealmChallenges;
    };

    const isChallengeCompleted = (realmIdx, challengeIdx) => {
        return completedChallenges.includes(`${realmIdx}-${challengeIdx}`);
    };

    // Map View
    if (gameState === 'map') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-4 md:p-8">
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                            <Swords className="h-8 w-8 text-orange-400" />
                            Code Quest
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-400" />
                                    <span className="font-bold">{xp} XP</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/gamified-assessment')}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                            >
                                Exit Quest
                            </button>
                        </div>
                    </div>
                    <p className="text-indigo-200">Choose your realm and conquer coding challenges!</p>
                </div>

                {/* Realm Map */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {realms.map((realm, idx) => {
                        const unlocked = isRealmUnlocked(idx);
                        const completed = realm.challenges.every((_, cIdx) => isChallengeCompleted(idx, cIdx));

                        return (
                            <motion.div
                                key={realm.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 transition-all ${unlocked
                                        ? completed
                                            ? 'border-green-500 hover:border-green-400'
                                            : 'border-white/20 hover:border-white/40 cursor-pointer'
                                        : 'border-gray-700 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                {!unlocked && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                                        <Lock className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}

                                <div className="text-6xl mb-4">{realm.icon}</div>
                                <h3 className="text-2xl font-bold mb-2">{realm.name}</h3>
                                <p className="text-gray-300 text-sm mb-4">{realm.description}</p>

                                <div className="space-y-2 mb-4">
                                    {realm.challenges.map((challenge, cIdx) => {
                                        const challengeCompleted = isChallengeCompleted(idx, cIdx);
                                        return (
                                            <button
                                                key={cIdx}
                                                onClick={() => unlocked && startChallenge(idx, cIdx)}
                                                disabled={!unlocked}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${challengeCompleted
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : unlocked
                                                            ? 'bg-white/5 hover:bg-white/10'
                                                            : 'bg-gray-800/50'
                                                    }`}
                                            >
                                                <span>{challenge.title}</span>
                                                {challengeCompleted ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                ) : (
                                                    <span className="text-xs text-yellow-400">+{challenge.xp} XP</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {completed && (
                                    <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                        <Trophy className="h-4 w-4" />
                                        <span>Realm Completed!</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Challenge View
    const challenge = realms[currentRealm].challenges[currentChallenge];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => setGameState('map')}
                            className="text-indigo-300 hover:text-white mb-2 flex items-center gap-2"
                        >
                            <Map className="h-4 w-4" />
                            Back to Map
                        </button>
                        <h2 className="text-2xl font-bold">{challenge.title}</h2>
                        <p className="text-indigo-200 text-sm">{realms[currentRealm].name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-yellow-400 font-bold text-lg">+{challenge.xp} XP</div>
                        <div className="text-xs text-gray-400">{challenge.difficulty}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Story & Instructions */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Swords className="h-5 w-5 text-orange-400" />
                        Quest Story
                    </h3>
                    <p className="text-indigo-100 leading-relaxed mb-6">{challenge.story}</p>

                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mb-4"
                    >
                        <Lightbulb className="h-5 w-5" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                    </button>

                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                        >
                            <h4 className="font-bold text-green-300 mb-2">💡 Hint:</h4>
                            <p className="text-green-100 text-sm">{challenge.hint}</p>
                        </motion.div>
                    )}

                    {testResults && (
                        <div className="mt-6">
                            <h4 className="font-bold mb-3">Test Results:</h4>
                            <div className="space-y-2">
                                {testResults.map((result) => (
                                    <div
                                        key={result.testNum}
                                        className={`p-3 rounded-lg text-sm ${result.passed ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>Test {result.testNum}</span>
                                            {result.passed ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <span>❌</span>
                                            )}
                                        </div>
                                        {!result.passed && result.error && (
                                            <div className="text-xs mt-1">Error: {result.error}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Code Editor */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-400" />
                        Your Code
                    </h3>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-64 bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                        spellCheck="false"
                    />
                    <button
                        onClick={runTests}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <PlayCircle className="h-5 w-5" />
                        Run Tests
                    </button>
                </div>
            </div>
        </div>
    );
}
