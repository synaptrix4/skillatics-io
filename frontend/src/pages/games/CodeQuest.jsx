import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Star, Zap, ArrowRight, Lightbulb, Code, PlayCircle, CheckCircle2, Lock, Map, Building2, TreePine, Mountain, Waves, Castle, Terminal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

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
    const [isRunning, setIsRunning] = useState(false);

    const realms = [
        {
            id: 0,
            name: "Arrays Village",
            icon: Building2,
            description: "Master the basics of array manipulation",
            color: "from-blue-500 to-cyan-500",
            challenges: [
                {
                    title: "Find the Maximum",
                    story: "The village elder needs to find the tallest warrior. Help by finding the maximum value in the array.",
                    difficulty: "Easy",
                    xp: 30,
                    functionName: "find_max",
                    starter: "def find_max(warriors):\n    # Find and return the maximum value\n    pass",
                    solution: "def find_max(warriors):\n    return max(warriors)",
                    testCases: [
                        { setup: "args = ([1, 5, 3, 9, 2],)", expected: 9, inputRep: "[1, 5, 3, 9, 2]" },
                        { setup: "args = ([10, 20, 30],)", expected: 30, inputRep: "[10, 20, 30]" },
                        { setup: "args = ([-5, -1, -10],)", expected: -1, inputRep: "[-5, -1, -10]" }
                    ],
                    hint: "Use the max() function or loop through the array keeping track of the largest value seen."
                },
                {
                    title: "Reverse the Formation",
                    story: "The warriors need to reverse their battle formation. Reverse the array!",
                    difficulty: "Easy",
                    xp: 35,
                    functionName: "reverse_array",
                    starter: "def reverse_array(formation):\n    # Return reversed array\n    pass",
                    solution: "def reverse_array(formation):\n    return formation[::-1]",
                    testCases: [
                        { setup: "args = ([1, 2, 3, 4],)", expected: [4, 3, 2, 1], inputRep: "[1, 2, 3, 4]" },
                        { setup: "args = (['a', 'b', 'c'],)", expected: ['c', 'b', 'a'], inputRep: "['a', 'b', 'c']" },
                        { setup: "args = ([5],)", expected: [5], inputRep: "[5]" }
                    ],
                    hint: "Python has a slice notation [::-1] that reverses sequences."
                },
                {
                    title: "Remove Duplicates",
                    story: "Some warriors were counted twice! Remove duplicate values from the array.",
                    difficulty: "Medium",
                    xp: 40,
                    functionName: "remove_duplicates",
                    starter: "def remove_duplicates(warriors):\n    # Return array with unique values only\n    pass",
                    solution: "def remove_duplicates(warriors):\n    return list(set(warriors))",
                    testCases: [
                        { setup: "args = ([1, 2, 2, 3, 4, 4],)", expected: [1, 2, 3, 4], inputRep: "[1, 2, 2, 3, 4, 4]" },
                        { setup: "args = (['a', 'b', 'a', 'c'],)", expected: ['a', 'b', 'c'], inputRep: "['a', 'b', 'a', 'c']" },
                        { setup: "args = ([5, 5, 5],)", expected: [5], inputRep: "[5, 5, 5]" }
                    ],
                    hint: "Convert array to a set to get unique values, then convert back to list. Note: Sets change order, but tests compare sorted for this problem (simulation treats equality generally)."
                }
            ]
        },
        {
            id: 1,
            name: "Linked List Forest",
            icon: TreePine,
            description: "Navigate through connected nodes",
            color: "from-green-500 to-emerald-600",
            challenges: [
                {
                    title: "Count the Chain",
                    story: "Trees in the forest are linked. Count how many trees are in the chain.",
                    difficulty: "Medium",
                    xp: 50,
                    functionName: "count_nodes",
                    starter: "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\ndef count_nodes(head):\n    # Count nodes in linked list\n    pass",
                    solution: "def count_nodes(head):\n    count = 0\n    curr = head\n    while curr:\n        count += 1\n        curr = curr.next\n    return count",
                    testCases: [
                        { setup: "args = (build_ll([1,2,3]),)", expected: 3, inputRep: "[1, 2, 3]" },
                        { setup: "args = (build_ll([1]),)", expected: 1, inputRep: "[1]" },
                        { setup: "args = (build_ll([]),)", expected: 0, inputRep: "[]" }
                    ],
                    hint: "Traverse the list using a while loop, counting each node until you reach None."
                },
                {
                    title: "Find the Middle Tree",
                    story: "The sacred tree is in the middle of the chain. Find it!",
                    difficulty: "Medium",
                    xp: 55,
                    functionName: "find_middle",
                    starter: "def find_middle(head):\n    # Find middle node value\n    pass",
                    solution: "def find_middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.val if slow else None",
                    testCases: [
                        { setup: "args = (build_ll([1,2,3,4,5]),)", expected: 3, inputRep: "[1, 2, 3, 4, 5]" },
                        { setup: "args = (build_ll([1,2,3,4]),)", expected: 3, inputRep: "[1, 2, 3, 4]" },
                        { setup: "args = (build_ll([7]),)", expected: 7, inputRep: "[7]" }
                    ],
                    hint: "Use two pointers: slow (moves 1 step) and fast (moves 2 steps). When fast reaches the end, slow is at the middle."
                }
            ]
        },
        {
            id: 2,
            name: "Stack Mountain",
            icon: Mountain,
            description: "Master Last-In-First-Out operations",
            color: "from-orange-500 to-red-600",
            challenges: [
                {
                    title: "Balanced Brackets",
                    story: "The mountain gate has magical brackets. Check if they're balanced!",
                    difficulty: "Medium",
                    xp: 60,
                    functionName: "is_balanced",
                    starter: "def is_balanced(brackets):\n    # Check if brackets are balanced\n    pass",
                    solution: "def is_balanced(brackets):\n    stack = []\n    pairs = {'(': ')', '[': ']', '{': '}'}\n    for char in brackets:\n        if char in pairs:\n            stack.append(char)\n        elif not stack or pairs[stack.pop()] != char:\n            return False\n    return len(stack) == 0",
                    testCases: [
                        { setup: "args = ('()',)", expected: true, inputRep: "'()'" },
                        { setup: "args = ('({[]})',)", expected: true, inputRep: "'({[]})'" },
                        { setup: "args = ('(]',)", expected: false, inputRep: "'(]'" },
                        { setup: "args = ('((',)", expected: false, inputRep: "'(('" }
                    ],
                    hint: "Use a stack. Push opening brackets, pop and compare when you see closing brackets."
                },
                {
                    title: "Reverse Polish Notation",
                    story: "Decode the ancient mountain inscriptions using RPN.",
                    difficulty: "Hard",
                    xp: 70,
                    functionName: "eval_rpn",
                    starter: "def eval_rpn(tokens):\n    # Evaluate RPN expression\n    pass",
                    solution: "def eval_rpn(tokens):\n    stack = []\n    for token in tokens:\n        if token in '+-*/':\n            b, a = stack.pop(), stack.pop()\n            stack.append(int(eval(f'{a}{token}{b}')))\n        else:\n            stack.append(int(token))\n    return stack[0]",
                    testCases: [
                        { setup: "args = (['2', '1', '+', '3', '*'],)", expected: 9, inputRep: "['2', '1', '+', '3', '*']" },
                        { setup: "args = (['4', '13', '5', '/', '+'],)", expected: 6, inputRep: "['4', '13', '5', '/', '+']" }
                    ],
                    hint: "Push numbers onto stack. When you see an operator, pop two numbers, apply operation, push result."
                }
            ]
        },
        {
            id: 3,
            name: "Queue River",
            icon: Waves,
            description: "Flow with First-In-First-Out",
            color: "from-cyan-500 to-blue-600",
            challenges: [
                {
                    title: "Ferry Queue",
                    story: "People wait in line for the ferry. Process them in order!",
                    difficulty: "Easy",
                    xp: 45,
                    functionName: "process_queue",
                    starter: "from collections import deque\n\ndef process_queue(people, k):\n    # Process first k people from queue\n    pass",
                    solution: "from collections import deque\n\ndef process_queue(people, k):\n    q = deque(people)\n    result = []\n    for _ in range(min(k, len(q))):\n        result.append(q.popleft())\n    return result",
                    testCases: [
                        { setup: "args = (['A', 'B', 'C', 'D'], 2)", expected: ["A", "B"], inputRep: "['A', 'B', 'C', 'D'], 2" },
                        { setup: "args = (['X', 'Y', 'Z'], 5)", expected: ["X", "Y", "Z"], inputRep: "['X', 'Y', 'Z'], 5" }
                    ],
                    hint: "Use deque and popleft() to remove from front of queue."
                }
            ]
        },
        {
            id: 4,
            name: "Tree Castle",
            icon: Castle,
            description: "Traverse the royal tree structure",
            color: "from-purple-500 to-pink-600",
            challenges: [
                {
                    title: "Count the Rooms",
                    story: "Count all rooms in the castle's tree structure.",
                    difficulty: "Medium",
                    xp: 65,
                    functionName: "count_nodes",
                    starter: "class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef count_nodes(root):\n    # Count all nodes in tree\n    pass",
                    solution: "def count_nodes(root):\n    if not root:\n        return 0\n    return 1 + count_nodes(root.left) + count_nodes(root.right)",
                    testCases: [
                        { setup: "args = (build_tree([1,2,3,4,5]),)", expected: 5, inputRep: "tree([1,2,3,4,5])" },
                        { setup: "args = (build_tree([1]),)", expected: 1, inputRep: "tree([1])" },
                        { setup: "args = (build_tree([]),)", expected: 0, inputRep: "tree([])" }
                    ],
                    hint: "Use recursion: count current node (1) + count left subtree + count right subtree."
                },
                {
                    title: "Maximum Depth",
                    story: "Find the deepest level of the castle.",
                    difficulty: "Medium",
                    xp: 70,
                    functionName: "max_depth",
                    starter: "def max_depth(root):\n    # Find maximum depth of tree\n    pass",
                    solution: "def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))",
                    testCases: [
                        { setup: "args = (build_tree([3,9,20,None,None,15,7]),)", expected: 3, inputRep: "tree([3,9,20,None,None,15,7])" },
                        { setup: "args = (build_tree([1,None,2]),)", expected: 2, inputRep: "tree([1,None,2])" }
                    ],
                    hint: "Recursively find max depth of left and right subtrees, add 1 for current level."
                }
            ]
        }
    ];

    const runTests = async () => {
        setIsRunning(true);
        const challenge = realms[currentRealm].challenges[currentChallenge];

        // Construct the comprehensive python script
        const pythonScript = `
import json
import traceback

# --- Start Utilities ---
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_ll(arr):
    if not arr: return None
    head = Node(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = Node(val)
        curr = curr.next
    return head

def build_tree(arr):
    if not arr: return None
    root = TreeNode(arr[0])
    q = [root]
    i = 1
    while q and i < len(arr):
        node = q.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            q.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            q.append(node.right)
        i += 1
    return root
# --- End Utilities ---

# --- User Code ---
${code}
# --- End User Code ---

def run_all_tests():
    test_cases_defs = ${JSON.stringify(challenge.testCases)}
    func_name = "${challenge.functionName}"
    results = []

    context = globals().copy()
    if func_name not in context:
        print(json.dumps([{"passed": False, "error": f"Function '{func_name}' not defined. Make sure you defined it."}]))
        return

    for idx, tc in enumerate(test_cases_defs):
        try:
            loc = {}
            exec(tc["setup"], context, loc)
            args = loc.get("args", tuple())
            
            actual_res = context[func_name](*args)
            expected = tc["expected"]
            
            if type(expected) is list and type(actual_res) is list:
                if "remove_duplicates" in func_name:
                    passed = sorted(actual_res) == sorted(expected)
                else:
                    passed = actual_res == expected
            else:
                passed = actual_res == expected
                
            results.append({
                "testNum": idx + 1,
                "passed": passed,
                "actual": str(actual_res),
                "expected": str(expected),
                "inputRep": tc.get("inputRep", "")
            })
            
        except Exception as e:
            results.append({
                "testNum": idx + 1,
                "passed": False,
                "error": str(traceback.format_exc()),
                "inputRep": tc.get("inputRep", "")
            })

    print(json.dumps(results))

if __name__ == "__main__":
    run_all_tests()
`;

        try {
            const resp = await api.post('/code/execute', {
                source_code: pythonScript,
                language: 'python',
                test_cases: [] // Tests are handled inside the pythonScript internally
            });

            if (resp.data && resp.data.stdout) {
                try {
                    const outputStr = resp.data.stdout;
                    // Attempt to parse out the JSON array from stdout line
                    const jsonStart = outputStr.indexOf('[');
                    let parsedResults = [];
                    if (jsonStart !== -1) {
                        parsedResults = JSON.parse(outputStr.substring(jsonStart));
                    } else {
                        throw new Error("No JSON found");
                    }

                    setTestResults(parsedResults);

                    const allPassed = parsedResults.every(r => r.passed);
                    if (allPassed) {
                        toast.success('All tests passed! 🎉');
                        const challengeId = `${currentRealm}-${currentChallenge}`;
                        if (!completedChallenges.includes(challengeId)) {
                            setCompletedChallenges([...completedChallenges, challengeId]);
                            setXp(xp + challenge.xp);

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
                } catch (jsonErr) {
                    console.error("Evaluation Error:", resp.data.stdout, resp.data.stderr);
                    setTestResults([{ testNum: 1, passed: false, error: resp.data.stderr || resp.data.stdout || "Runtime error detected." }]);
                }
            } else if (resp.data.error || resp.data.stderr) {
                setTestResults([{ testNum: 1, passed: false, error: resp.data.error || resp.data.stderr }]);
            } else {
                setTestResults([{ testNum: 1, passed: false, error: "Execution failed NO Output." }]);
            }
        } catch (error) {
            console.error(error);
            setTestResults([{ testNum: 1, passed: false, error: "Failed to connect to Python Exec API." }]);
        } finally {
            setIsRunning(false);
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
            <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-200/40 blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-200/40 blur-3xl"></div>
                </div>

                {/* Header */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-slate-900">
                            <Terminal className="h-8 w-8 text-orange-500" />
                            Python Code Quest
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500" />
                                    <span className="font-bold text-slate-800">{xp} XP</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/gamified-assessment')}
                                className="px-4 py-2 bg-white border border-gray-200 hover:border-orange-500 text-slate-700 hover:text-orange-500 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                            >
                                Exit Quest
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-600 font-medium">Choose your realm and conquer coding challenges!</p>
                </div>

                {/* Realm Map */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {realms.map((realm, idx) => {
                        const unlocked = isRealmUnlocked(idx);
                        const completed = realm.challenges.every((_, cIdx) => isChallengeCompleted(idx, cIdx));
                        const Icon = realm.icon;

                        return (
                            <motion.div
                                key={realm.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border-2 shadow-sm transition-all duration-300 ${unlocked
                                    ? completed
                                        ? 'border-emerald-500 shadow-md'
                                        : 'border-gray-200 hover:border-orange-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                {!unlocked && (
                                    <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                                        <Lock className="h-12 w-12 text-slate-400" />
                                    </div>
                                )}

                                <div className={`mb-4 flex ${unlocked ? (completed ? 'text-emerald-500' : 'text-indigo-500') : 'text-slate-400'}`}><Icon className="h-12 w-12" /></div>
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
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : unlocked
                                                        ? 'bg-slate-50 hover:bg-white text-slate-700 hover:text-orange-600 border border-transparent hover:border-orange-200 hover:shadow-sm'
                                                        : 'bg-slate-100 text-slate-400'
                                                    }`}
                                            >
                                                <span className="font-medium">{challenge.title}</span>
                                                {challengeCompleted ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">+{challenge.xp} XP</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {completed && (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mt-2 text-sm font-bold border border-emerald-100">
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
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => setGameState('map')}
                            className="text-slate-500 hover:text-orange-500 mb-2 flex items-center gap-2 transition-colors font-medium"
                        >
                            <Map className="h-4 w-4" />
                            Back to Map
                        </button>
                        <h2 className="text-2xl font-bold text-slate-900">{challenge.title}</h2>
                        <p className="text-slate-600 text-sm font-medium">{realms[currentRealm].name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-amber-500 font-bold text-lg bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 inline-block mb-1">+{challenge.xp} XP</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{challenge.difficulty}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Story & Instructions */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <Swords className="h-5 w-5 text-orange-500" />
                        Quest Story
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">{challenge.story}</p>

                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mb-4 mt-auto"
                    >
                        <Lightbulb className="h-5 w-5" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                    </button>

                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm"
                        >
                            <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                                <span className="text-lg">💡</span> Hint:
                            </h4>
                            <p className="text-amber-800 text-sm font-medium">{challenge.hint}</p>
                        </motion.div>
                    )}

                    {testResults && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-slate-800 mb-3">Test Results:</h4>
                            <div className="space-y-2">
                                {testResults.map((result) => (
                                    <div
                                        key={result.testNum}
                                        className={`p-3 rounded-lg text-sm border ${result.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between font-medium">
                                            <span>Test {result.testNum}</span>
                                            {result.passed ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <span>❌</span>
                                            )}
                                        </div>
                                        {!result.passed && result.error ? (
                                            <div className="text-xs mt-1 text-red-600 font-mono bg-red-100/50 p-2 rounded mt-2 whitespace-pre-wrap">Error: {result.error}</div>
                                        ) : !result.passed ? (
                                            <div className="text-xs mt-2 text-red-600 font-mono bg-red-100/50 p-2 rounded space-y-1">
                                                <div><span className="font-bold opacity-75">Input:</span> {result.inputRep}</div>
                                                <div><span className="font-bold opacity-75">Expected:</span> {result.expected}</div>
                                                <div><span className="font-bold opacity-75">Actual:</span> {result.actual}</div>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Code Editor */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <Code className="h-5 w-5 text-indigo-500" />
                        Your Code
                    </h3>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-64 flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 shadow-inner"
                        spellCheck="false"
                    />
                    <button
                        onClick={runTests}
                        disabled={isRunning}
                        className={`w-full py-3 text-white shadow-md hover:shadow-lg rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isRunning ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:-translate-y-1'}`}
                    >
                        {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
                        {isRunning ? 'Running Python Execution...' : 'Run Tests'}
                    </button>
                </div>
            </div>
        </div>
    );
}
