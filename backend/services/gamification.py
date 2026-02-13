"""
Gamification Service - Handles XP, levels, badges, and achievements
"""
from datetime import datetime, timedelta
from bson import ObjectId
from extensions import mongo

# Achievement Definitions
ACHIEVEMENTS = {
    "first_test": {
        "id": "first_test",
        "name": "First Steps",
        "description": "Complete your first test",
        "icon": "🎯",
        "xp_bonus": 50,
        "condition": lambda user_data: user_data.get("tests_completed", 0) >= 1
    },
    "perfect_score": {
        "id": "perfect_score",
        "name": "Perfectionist",
        "description": "Score 100% on any test",
        "icon": "💯",
        "xp_bonus": 100,
        "condition": lambda user_data: user_data.get("perfect_scores", 0) >= 1
    },
    "week_streak": {
        "id": "week_streak",
        "name": "Dedicated Learner",
        "description": "Practice for 7 consecutive days",
        "icon": "🔥",
        "xp_bonus": 200,
        "condition": lambda user_data: user_data.get("current_streak", 0) >= 7
    },
    "speed_demon": {
        "id": "speed_demon",
        "name": "Speed Demon",
        "description": "Complete a test in under 10 minutes",
        "icon": "⚡",
        "xp_bonus": 75,
        "condition": lambda user_data: user_data.get("fastest_test_minutes", float('inf')) < 10
    },
    "topic_master": {
        "id": "topic_master",
        "name": "Topic Master",
        "description": "Score 80%+ on 3 tests in the same topic",
        "icon": "🎓",
        "xp_bonus": 150,
        "condition": lambda user_data: any(
            stats.get("high_scores", 0) >= 3 
            for stats in user_data.get("topic_stats", {}).values()
        )
    },
    "coding_ninja": {
        "id": "coding_ninja",
        "name": "Coding Ninja",
        "description": "Solve 5 coding problems",
        "icon": "🥷",
        "xp_bonus": 250,
        "condition": lambda user_data: user_data.get("coding_problems_solved", 0) >= 5
    },
    "early_bird": {
        "id": "early_bird",
        "name": "Early Bird",
        "description": "Complete a test before 8 AM",
        "icon": "🌅",
        "xp_bonus": 50,
        "condition": lambda user_data: user_data.get("has_early_test", False)
    },
    "night_owl": {
        "id": "night_owl",
        "name": "Night Owl",
        "description": "Complete a test after 10 PM",
        "icon": "🦉",
        "xp_bonus": 50,
        "condition": lambda user_data: user_data.get("has_late_test", False)
    },
    "century_club": {
        "id": "century_club",
        "name": "Century Club",
        "description": "Earn 1000 total XP",
        "icon": "🏆",
        "xp_bonus": 100,
        "condition": lambda user_data: user_data.get("total_xp", 0) >= 1000
    },
    "consistency_king": {
        "id": "consistency_king",
        "name": "Consistency King",
        "description": "Complete 10 tests",
        "icon": "👑",
        "xp_bonus": 300,
        "condition": lambda user_data: user_data.get("tests_completed", 0) >= 10
    }
}


def calculate_level(xp):
    """Calculate level from XP using sqrt formula: level = floor(sqrt(xp/100))"""
    import math
    return max(1, math.floor(math.sqrt(xp / 100)))


def xp_for_next_level(current_level):
    """Calculate XP needed for next level"""
    return (current_level + 1) ** 2 * 100


def calculate_xp_reward(score, total_questions, difficulty_avg=3, time_taken_sec=0):
    """
    Calculate XP reward based on test performance.
    
    Args:
        score: Score percentage (0-100)
        total_questions: Number of questions in test
        difficulty_avg: Average difficulty of questions (1-5)
        time_taken_sec: Time taken in seconds
    
    Returns:
        int: XP earned
    """
    # Base XP: 10 XP per question
    base_xp = total_questions * 10
    
    # Accuracy multiplier (0.5x to 2x)
    accuracy_multiplier = 0.5 + (score / 100) * 1.5
    
    # Difficulty bonus (1x to 1.5x)
    difficulty_multiplier = 1 + (difficulty_avg - 1) / 8  # Max +0.5x for difficulty 5
    
    # Speed bonus (if completed quickly)
    speed_bonus = 0
    if time_taken_sec > 0 and time_taken_sec < 600:  # Under 10 minutes
        speed_bonus = 50
    
    # Perfect score bonus
    perfect_bonus = 100 if score == 100 else 0
    
    total_xp = int(base_xp * accuracy_multiplier * difficulty_multiplier + speed_bonus + perfect_bonus)
    
    return max(10, total_xp)  # Minimum 10 XP


def update_user_xp(user_id, xp_to_add):
    """Add XP to user and update level"""
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    
    current_xp = user.get("xp", 0)
    new_xp = current_xp + xp_to_add
    new_level = calculate_level(new_xp)
    old_level = calculate_level(current_xp)
    
    # Check if leveled up
    leveled_up = new_level > old_level
    
    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "xp": new_xp,
                "level": new_level
            }
        }
    )
    
    return {
        "new_xp": new_xp,
        "xp_gained": xp_to_add,
        "new_level": new_level,
        "leveled_up": leveled_up,
        "xp_for_next_level": xp_for_next_level(new_level),
        "xp_progress": new_xp - (new_level ** 2 * 100)
    }


def check_and_award_achievements(user_id):
    """
    Check if user has earned new achievements and award them.
    Returns list of newly earned achievements.
    """
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return []
    
    current_badges = user.get("badges", [])
    
    # Gather user data for achievement checking
    user_data = gather_user_achievement_data(user_id, user)
    
    newly_earned = []
    
    for achievement_id, achievement in ACHIEVEMENTS.items():
        # Skip if already earned
        if achievement_id in current_badges:
            continue
        
        # Check condition
        if achievement["condition"](user_data):
            # Award achievement
            mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$push": {"badges": achievement_id},
                    "$inc": {"xp": achievement["xp_bonus"]}
                }
            )
            
            newly_earned.append({
                "id": achievement_id,
                "name": achievement["name"],
                "description": achievement["description"],
                "icon": achievement["icon"],
                "xp_bonus": achievement["xp_bonus"]
            })
    
    return newly_earned


def gather_user_achievement_data(user_id, user=None):
    """Gather data needed for achievement checking"""
    if not user:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    
    # Count tests completed
    tests_completed = mongo.db.test_results.count_documents({"studentId": ObjectId(user_id)})
    
    # Check for perfect scores
    perfect_scores = mongo.db.test_results.count_documents({
        "studentId": ObjectId(user_id),
        "score": 100
    })
    
    # Count coding problems solved
    coding_solved = mongo.db.code_submissions.count_documents({
        "studentId": ObjectId(user_id),
        "all_passed": True
    })
    
    # Get fastest test time
    fastest_test = mongo.db.test_results.find_one(
        {"studentId": ObjectId(user_id)},
        sort=[("completedAt", -1)]
    )
    
    # Calculate streak (simplified - just check last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_tests = list(mongo.db.test_results.find({
        "studentId": ObjectId(user_id),
        "completedAt": {"$gte": seven_days_ago}
    }).sort("completedAt", 1))
    
    # Check for unique days with tests
    test_dates = set()
    for test in recent_tests:
        test_dates.add(test["completedAt"].date())
    
    current_streak = len(test_dates)
    
    # Check for early/late tests
    has_early_test = bool(mongo.db.test_results.find_one({
        "studentId": ObjectId(user_id),
        "$expr": {"$lt": [{"$hour": "$completedAt"}, 8]}
    }))
    
    has_late_test = bool(mongo.db.test_results.find_one({
        "studentId": ObjectId(user_id),
        "$expr": {"$gte": [{"$hour": "$completedAt"}, 22]}
    }))
    
    # Topic statistics
    topic_stats = {}
    pipeline = [
        {"$match": {"studentId": ObjectId(user_id)}},
        {"$unwind": "$history"},
        {"$lookup": {
            "from": "questions",
            "localField": "history.questionId",
            "foreignField": "_id",
            "as": "question"
        }},
        {"$unwind": "$question"},
        {"$group": {
            "_id": "$question.topic",
            "high_scores": {
                "$sum": {"$cond": [{"$gte": ["$score", 80]}, 1, 0]}
            }
        }}
    ]
    
    for doc in mongo.db.test_results.aggregate(pipeline):
        topic_stats[doc["_id"]] = {"high_scores": doc["high_scores"]}
    
    return {
        "tests_completed": tests_completed,
        "perfect_scores": perfect_scores,
        "coding_problems_solved": coding_solved,
        "current_streak": current_streak,
        "has_early_test": has_early_test,
        "has_late_test": has_late_test,
        "total_xp": user.get("xp", 0),
        "topic_stats": topic_stats,
        "fastest_test_minutes": 999  # Placeholder - would need to calculate from test session
    }


def get_leaderboard(timeframe="all", limit=100):
    """
    Get leaderboard rankings.
    
    Args:
        timeframe: 'weekly', 'monthly', or 'all'
        limit: Number of users to return
    
    Returns:
        List of users with rank, xp, level
    """
    match_filter = {}
    
    if timeframe == "weekly":
        week_ago = datetime.utcnow() - timedelta(days=7)
        # For weekly, we'd need to track XP gains per period
        # For now, just use current XP
        pass
    elif timeframe == "monthly":
        month_ago = datetime.utcnow() - timedelta(days=30)
        pass
    
    # Get top users by XP
    users = list(mongo.db.users.find(
        {"role": "Student"},
        {"name": 1, "email": 1, "xp": 1, "level": 1, "badges": 1}
    ).sort("xp", -1).limit(limit))
    
    leaderboard = []
    for rank, user in enumerate(users, 1):
        leaderboard.append({
            "rank": rank,
            "userId": str(user["_id"]),
            "name": user.get("name", "Unknown"),
            "email": user.get("email", ""),
            "xp": user.get("xp", 0),
            "level": user.get("level", 1),
            "badges": len(user.get("badges", []))
        })
    
    return leaderboard


def get_user_rank(user_id):
    """Get user's current rank on leaderboard"""
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    
    user_xp = user.get("xp", 0)
    
    # Count how many users have more XP
    higher_ranked = mongo.db.users.count_documents({
        "role": "Student",
        "xp": {"$gt": user_xp}
    })
    
    return higher_ranked + 1
