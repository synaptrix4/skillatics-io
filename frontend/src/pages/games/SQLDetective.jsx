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
            <div className="min-h-screen bg-slate-50 text-slate-900 p-8 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/40 blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-3xl"></div>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <CheckCircle className="h-32 w-32 text-emerald-500 mx-auto mb-6 drop-shadow-md" />
                    <h1 className="text-5xl font-black mb-4 text-slate-900">Case Closed!</h1>
                    <p className="text-xl text-slate-600 font-medium mb-6">
                        You successfully identified Prof. David Kim as the culprit using your SQL detective skills!
                    </p>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-gray-200 shadow-xl">
                        <h3 className="font-black text-2xl mb-6 text-slate-800">Your Performance</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                                <div className="text-4xl font-black text-amber-500 mb-2">{5 - hintsUsed}</div>
                                <div className="text-sm font-bold text-amber-700/80 uppercase tracking-wider">Chapters Solved Solo</div>
                            </div>
                            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                                <div className="text-4xl font-black text-orange-500 mb-2">{hintsUsed}</div>
                                <div className="text-sm font-bold text-orange-700/80 uppercase tracking-wider">Hints Used</div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
                    >
                        Back to Games
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-slate-900">
                        <Search className="h-8 w-8 text-amber-500" />
                        SQL Detective
                    </h1>
                    <button
                        onClick={() => navigate('/gamified-assessment')}
                        className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-sm hover:shadow-md rounded-lg transition-all font-medium hover:-translate-y-1"
                    >
                        Exit Game
                    </button>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-slate-600">Chapter <span className="text-blue-600">{chapter + 1}</span> of {story.length}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="text-slate-600"><span className="text-amber-600">{hintsUsed}</span> Hints Used</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Story Panel */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-full">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 border-b border-gray-100 pb-4">
                        <FileText className="h-6 w-6 text-indigo-500" />
                        {story[chapter].title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium flex-grow">
                        {story[chapter].narrative}
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 shadow-sm">
                        <h3 className="font-bold text-amber-700 flex items-center gap-2 mb-2 uppercase tracking-wider text-sm">
                            <MapPin className="h-4 w-4" />
                            Your Task:
                        </h3>
                        <p className="text-amber-900 font-medium">{story[chapter].task}</p>
                    </div>
                    <button
                        onClick={useHint}
                        className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm hover:shadow-md rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-2 hover:-translate-y-1"
                    >
                        <Lightbulb className="h-5 w-5" />
                        {showHint ? "Hint Revealed Below" : "Need a Hint?"}
                    </button>
                    <AnimatePresence>
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm overflow-hidden"
                            >
                                <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-2 uppercase tracking-wider text-sm">
                                    <Lightbulb className="h-4 w-4" />
                                    Hint:
                                </h3>
                                <code className="text-emerald-800 text-sm block font-mono bg-emerald-100/50 p-3 rounded-lg border border-emerald-200/50">{story[chapter].hint}</code>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* SQL Editor Panel */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-full">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 border-b border-gray-100 pb-4">
                        <BookOpen className="h-6 w-6 text-emerald-500" />
                        SQL Console
                    </h2>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter your SQL query here..."
                        className="w-full min-h-[160px] bg-slate-900 border border-slate-700 shadow-inner rounded-xl p-4 text-slate-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 resize-none"
                        spellCheck="false"
                    />
                    <button
                        onClick={executeQuery}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg rounded-xl font-bold transition-all mb-6 flex items-center justify-center gap-2 text-lg hover:-translate-y-1"
                    >
                        Execute Query
                    </button>

                    {/* Results */}
                    {results && (
                        <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-xl p-4 overflow-auto max-h-64 flex-grow">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3 uppercase tracking-wider text-sm">
                                <Users className="h-4 w-4 text-slate-500" />
                                Query Results:
                            </h3>
                            {results.length === 0 ? (
                                <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-center">
                                    <p className="text-slate-500 font-medium">No results found for your query.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-xs border-b border-slate-200 sticky top-0">
                                            <tr>
                                                {Object.keys(results[0]).map((key) => (
                                                    <th key={key} className="px-4 py-3">{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {results.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{val}</td>
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
                <details className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
                    <summary className="p-4 cursor-pointer font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-800">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        Database Schema Reference
                    </summary>
                    <div className="p-6 grid md:grid-cols-2 gap-4 bg-slate-50/50 border-t border-gray-100">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                suspects
                            </h4>
                            <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded block mt-2 font-mono break-all">id, name, age, occupation, status</code>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                evidence
                            </h4>
                            <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded block mt-2 font-mono break-all">id, item, location, found_time, suspect_id</code>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                locations
                            </h4>
                            <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded block mt-2 font-mono break-all">id, name, floor, access_level</code>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-indigo-600 mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                alibis
                            </h4>
                            <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded block mt-2 font-mono break-all">id, suspect_id, location, time, witness</code>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
