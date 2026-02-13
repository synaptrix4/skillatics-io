import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Users, MapPin, Clock, Lightbulb, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import alasql from 'alasql';

export default function SQLDetective() {
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(0);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [solved, setSolved] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Initialize database on mount
    useEffect(() => {
        initializeDatabase();
    }, []);

    const initializeDatabase = () => {
        // Create tables
        alasql('DROP TABLE IF EXISTS suspects');
        alasql('DROP TABLE IF EXISTS evidence');
        alasql('DROP TABLE IF EXISTS locations');
        alasql('DROP TABLE IF EXISTS alibis');

        // Suspects table
        alasql('CREATE TABLE suspects (id INT, name STRING, age INT, occupation STRING, status STRING)');
        alasql('INSERT INTO suspects VALUES (1, "Dr. Sarah Chen", 42, "Professor", "Alive")');
        alasql('INSERT INTO suspects VALUES (2, "Mark Johnson", 35, "Lab Assistant", "Alive")');
        alasql('INSERT INTO suspects VALUES (3, "Emily Rodriguez", 28, "Graduate Student", "Deceased")');
        alasql('INSERT INTO suspects VALUES (4, "Prof. David Kim", 55, "Department Head", "Alive")');
        alasql('INSERT INTO suspects VALUES (5, "Lisa Park", 31, "Researcher", "Alive")');

        // Evidence table
        alasql('CREATE TABLE evidence (id INT, item STRING, location STRING, found_time STRING, suspect_id INT)');
        alasql('INSERT INTO evidence VALUES (1, "Coffee Cup", "Lab 305", "22:30", 2)');
        alasql('INSERT INTO evidence VALUES (2, "Laptop", "Lab 305", "22:35", 3)');
        alasql('INSERT INTO evidence VALUES (3, "Lab Coat", "Hallway", "22:45", 1)');
        alasql('INSERT INTO evidence VALUES (4, "Key Card", "Lab 305", "22:50", 4)');
        alasql('INSERT INTO evidence VALUES (5, "Research Notes", "Office 210", "23:00", 5)');

        // Locations table
        alasql('CREATE TABLE locations (id INT, name STRING, floor INT, access_level STRING)');
        alasql('INSERT INTO locations VALUES (1, "Lab 305", 3, "Restricted")');
        alasql('INSERT INTO locations VALUES (2, "Office 210", 2, "Private")');
        alasql('INSERT INTO locations VALUES (3, "Main Hallway", 3, "Public")');
        alasql('INSERT INTO locations VALUES (4, "Library", 1, "Public")');

        // Alibis table
        alasql('CREATE TABLE alibis (id INT, suspect_id INT, location STRING, time STRING, witness STRING)');
        alasql('INSERT INTO alibis VALUES (1, 1, "Home", "22:00-23:00", "Spouse")');
        alasql('INSERT INTO alibis VALUES (2, 2, "Lab 305", "21:30-22:45", "Security Camera")');
        alasql('INSERT INTO alibis VALUES (3, 4, "Office", "22:00-22:30", "None")');
        alasql('INSERT INTO alibis VALUES (4, 5, "Library", "21:00-23:30", "Librarian")');
    };

    const story = [
        {
            title: "Chapter 1: The Discovery",
            narrative: "It's midnight at Tech University. Campus security has discovered graduate student Emily Rodriguez unconscious in Lab 305. The police have sealed the crime scene and need your help to investigate. Your mission: use SQL queries to analyze the evidence database and identify what happened.",
            task: "Start by exploring the database. Query the suspects table to see who might be involved.",
            hint: "Try: SELECT * FROM suspects;",
            targetQuery: /SELECT.*FROM\s+suspects/i,
            successMessage: "Excellent! You've identified all potential suspects. Let's dig deeper..."
        },
        {
            title: "Chapter 2: The Crime Scene",
            narrative: "You notice several pieces of evidence were found in and around Lab 305. Emily was working late on her research project. The lab requires keycard access and is monitored by security cameras.",
            task: "Find all evidence that was found in 'Lab 305'. What items were discovered at the crime scene?",
            hint: "Try: SELECT * FROM evidence WHERE location = 'Lab 305';",
            targetQuery: /SELECT.*FROM\s+evidence.*WHERE.*location.*Lab\s+305/i,
            successMessage: "Great work! The coffee cup, laptop, and keycard tell an interesting story..."
        },
        {
            title: "Chapter 3: Following the Trail",
            narrative: "The evidence shows that multiple people had access to the lab that night. The key card found belongs to Prof. David Kim, but Mark Johnson's coffee cup and Emily's laptop were also there.",
            task: "Investigate the alibis. Find out who was at 'Lab 305' between 21:30 and 23:00. Join the suspects and alibis tables.",
            hint: "Try: SELECT suspects.name, alibis.time, alibis.location FROM suspects JOIN alibis ON suspects.id = alibis.suspect_id WHERE alibis.location LIKE '%Lab%';",
            targetQuery: /SELECT.*FROM\s+(suspects|alibis).*JOIN.*(suspects|alibis)/i,
            successMessage: "Interesting! Mark Johnson was at the lab, confirmed by security cameras..."
        },
        {
            title: "Chapter 4: The Missing Piece",
            narrative: "You discover that the surveillance footage shows Mark Johnson leaving the lab at 22:45, but Emily's laptop shows activity until 22:50. Someone else must have been there!",
            task: "Find who had access to restricted areas. Look for suspects with evidence found in restricted locations.",
            hint: "Try: SELECT DISTINCT suspects.name, evidence.item FROM suspects JOIN evidence ON suspects.id = evidence.suspect_id JOIN locations ON evidence.location = locations.name WHERE locations.access_level = 'Restricted';",
            targetQuery: /SELECT.*suspects.*evidence.*locations.*Restricted/i,
            successMessage: "You've narrowed down the suspects! Time for the final deduction..."
        },
        {
            title: "Chapter 5: The Final Deduction",
            narrative: "All evidence points to one person: Mark Johnson left at 22:45, but someone with restricted access came after. Dr. Sarah Chen's lab coat was found in the hallway at 22:45, but her alibi says she was home. However, Prof. Kim's keycard was used at 22:50 - the same time as the laptop activity!",
            task: "Find the suspect who: had their key card as evidence AND does NOT have a verified alibi (witness is 'None').",
            hint: "Try: SELECT suspects.name FROM suspects JOIN evidence ON suspects.id = evidence.suspect_id JOIN alibis ON suspects.id = alibis.suspect_id WHERE evidence.item = 'Key Card' AND alibis.witness = 'None';",
            targetQuery: /SELECT.*suspects.*evidence.*alibis.*Key\s+Card.*None/i,
            successMessage: "🎉 CASE SOLVED! Prof. David Kim was at the scene. His keycard was found, and he has no verified alibi. Excellent detective work!"
        }
    ];

    const executeQuery = () => {
        try {
            const result = alasql(query);
            setResults(result);

            // Check if query matches the target pattern for current chapter
            if (story[chapter].targetQuery.test(query)) {
                toast.success(story[chapter].successMessage);

                if (chapter < story.length - 1) {
                    setTimeout(() => {
                        setChapter(chapter + 1);
                        setQuery('');
                        setResults(null);
                        setShowHint(false);
                    }, 2000);
                } else {
                    setSolved(true);
                }
            } else {
                toast.error("This query doesn't reveal the right clues. Try again or use a hint!");
            }
        } catch (error) {
            toast.error(`SQL Error: ${error.message}`);
            setResults(null);
        }
    };

    const useHint = () => {
        setShowHint(true);
        setHintsUsed(hintsUsed + 1);
        toast.info("Hint revealed!");
    };

    if (solved) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <CheckCircle className="h-32 w-32 text-green-400 mx-auto mb-6" />
                    <h1 className="text-5xl font-black mb-4">Case Closed!</h1>
                    <p className="text-xl text-indigo-200 mb-6">
                        You successfully identified Prof. David Kim as the culprit using your SQL detective skills!
                    </p>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8">
                        <h3 className="font-bold text-2xl mb-4">Your Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-3xl font-black text-yellow-400">{5 - hintsUsed}</div>
                                <div className="text-sm text-gray-300">Chapters Solved Solo</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-orange-400">{hintsUsed}</div>
                                <div className="text-sm text-gray-300">Hints Used</div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all"
                    >
                        Back to Games
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                        <Search className="h-8 w-8 text-yellow-400" />
                        SQL Detective
                    </h1>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                        Exit Game
                    </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span>Chapter {chapter + 1} of {story.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        <span>{hintsUsed} Hints Used</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Story Panel */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-indigo-400" />
                        {story[chapter].title}
                    </h2>
                    <p className="text-indigo-100 leading-relaxed mb-6">
                        {story[chapter].narrative}
                    </p>
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-4">
                        <h3 className="font-bold text-yellow-300 mb-2">🎯 Your Task:</h3>
                        <p className="text-yellow-100 text-sm">{story[chapter].task}</p>
                    </div>
                    <button
                        onClick={useHint}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <Lightbulb className="h-5 w-5" />
                        {showHint ? "Hint Revealed Below" : "Need a Hint?"}
                    </button>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                        >
                            <h3 className="font-bold text-green-300 mb-2">💡 Hint:</h3>
                            <code className="text-green-100 text-sm block font-mono">{story[chapter].hint}</code>
                        </motion.div>
                    )}
                </div>

                {/* SQL Editor Panel */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-green-400" />
                        SQL Console
                    </h2>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter your SQL query here..."
                        className="w-full h-32 bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                    />
                    <button
                        onClick={executeQuery}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all mb-4"
                    >
                        Execute Query
                    </button>

                    {/* Results */}
                    {results && (
                        <div className="bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64">
                            <h3 className="font-bold text-gray-300 mb-2">Query Results:</h3>
                            {results.length === 0 ? (
                                <p className="text-gray-500">No results found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                {Object.keys(results[0]).map((key) => (
                                                    <th key={key} className="text-left p-2 text-gray-400">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((row, idx) => (
                                                <tr key={idx} className="border-b border-gray-800">
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="p-2 text-gray-200">{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Database Schema Reference */}
            <div className="max-w-6xl mx-auto mt-8">
                <details className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <summary className="p-4 cursor-pointer font-bold hover:bg-white/5 rounded-2xl">
                        📚 Database Schema Reference
                    </summary>
                    <div className="p-6 grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <h4 className="font-bold text-indigo-400 mb-2">suspects</h4>
                            <code className="text-xs text-gray-300">id, name, age, occupation, status</code>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <h4 className="font-bold text-indigo-400 mb-2">evidence</h4>
                            <code className="text-xs text-gray-300">id, item, location, found_time, suspect_id</code>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <h4 className="font-bold text-indigo-400 mb-2">locations</h4>
                            <code className="text-xs text-gray-300">id, name, floor, access_level</code>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4">
                            <h4 className="font-bold text-indigo-400 mb-2">alibis</h4>
                            <code className="text-xs text-gray-300">id, suspect_id, location, time, witness</code>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
