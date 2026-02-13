import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Target, Clock, Star, Flame, Award, CheckCircle, XCircle, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export default function GamifiedAssessment() {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState(null);

    const gameModes = [
        {
            id: 'sql-detective',
            title: 'SQL Detective',
            icon: Brain,
            description: 'Solve a murder mystery using SQL queries! Investigate clues in a crime database.',
            color: 'from-indigo-500 to-purple-600',
            xpReward: 150,
            difficulty: 'Intermediate',
            duration: '30-45 min',
            route: '/games/sql-detective'
        },
        {
            id: 'code-quest',
            title: 'Code Quest',
            icon: Trophy,
            description: 'RPG adventure teaching algorithms! Battle bugs with data structures.',
            color: 'from-orange-500 to-red-500',
            xpReward: 200,
            difficulty: 'Advanced',
            duration: '60 min',
            route: '/games/code-quest'
        },
        {
            id: 'logic-labyrinth',
            title: 'Logic Labyrinth',
            icon: Target,
            description: 'Escape the puzzle tower! Solve logic puzzles to unlock each floor.',
            color: 'from-green-500 to-teal-500',
            xpReward: 100,
            difficulty: 'Beginner',
            duration: '20-30 min',
            route: '/games/logic-labyrinth'
        },
        {
            id: 'debug-dungeon',
            title: 'Debug Dungeon',
            icon: Flame,
            description: 'Fix buggy code to escape! Practice debugging across multiple languages.',
            color: 'from-pink-500 to-rose-500',
            xpReward: 175,
            difficulty: 'Advanced',
            duration: '45 min',
            route: '/games/debug-dungeon'
        }
    ];

    const handleStartGame = (mode) => {
        if (mode.comingSoon) {
            toast('Coming Soon! This game is under development.', { icon: '🚧' });
            return;
        }
        setSelectedMode(mode);
        toast.success(`Starting ${mode.title}!`);
        navigate(mode.route);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                    <Trophy className="h-8 w-8 text-white" />
                                </div>
                                Educational Games
                            </h1>
                            <p className="text-gray-600">Master programming and aptitude through story-driven adventures!</p>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">500</div>
                                <div className="text-xs text-gray-500 uppercase">Total XP</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">12</div>
                                <div className="text-xs text-gray-500 uppercase">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">85%</div>
                                <div className="text-xs text-gray-500 uppercase">Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Game Modes Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {gameModes.map((mode, index) => (
                        <motion.div
                            key={mode.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                            {/* Content */}
                            <div className="relative p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${mode.color} shadow-lg`}>
                                        <mode.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-sm font-bold">+{mode.xpReward} XP</span>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${mode.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                            mode.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                mode.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {mode.difficulty}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{mode.description}</p>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{mode.duration}</span>
                                    </div>
                                    {mode.comingSoon && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>

                                {/* Start Button */}
                                <button
                                    onClick={() => handleStartGame(mode)}
                                    className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${mode.color} 
                    hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
                                >
                                    <Zap className="h-4 w-4" />
                                    Start Challenge
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-indigo-600" />
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {[
                            { mode: 'Quick Fire Challenge', score: 8, total: 10, xp: 50, time: '2 hours ago', success: true },
                            { mode: 'Streak Master', score: 12, total: 15, xp: 75, time: '1 day ago', success: true },
                            { mode: 'Brain Boost', score: 7, total: 12, xp: 30, time: '2 days ago', success: false }
                        ].map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    {activity.success ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <div>
                                        <div className="font-semibold text-gray-900">{activity.mode}</div>
                                        <div className="text-sm text-gray-500">
                                            Score: {activity.score}/{activity.total} • +{activity.xp} XP
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">{activity.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
