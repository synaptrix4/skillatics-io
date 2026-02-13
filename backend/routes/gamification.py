from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId

from extensions import mongo
from services.gamification import (
    get_leaderboard,
    get_user_rank,
    ACHIEVEMENTS,
    calculate_level,
    xp_for_next_level
)

gamification_bp = Blueprint("gamification", __name__)


@gamification_bp.get("/profile")
@jwt_required()
def get_gamification_profile():
    """Get user's gamification profile (XP, level, badges, rank)"""
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    xp = user.get("xp", 0)
    level = user.get("level", 1)
    badges = user.get("badges", [])
    
    # Get user rank
    rank = get_user_rank(user_id)
    
    # Calculate progress to next level
    current_level_xp = level ** 2 * 100
    next_level_xp = xp_for_next_level(level)
    xp_progress = xp - current_level_xp
    xp_needed = next_level_xp - current_level_xp
    
    # Get badge details
    badge_details = []
    for badge_id in badges:
        if badge_id in ACHIEVEMENTS:
            achievement = ACHIEVEMENTS[badge_id]
            badge_details.append({
                "id": badge_id,
                "name": achievement["name"],
                "description": achievement["description"],
                "icon": achievement["icon"]
            })
    
    return jsonify({
        "xp": xp,
        "level": level,
        "rank": rank,
        "badges": badge_details,
        "xp_progress": xp_progress,
        "xp_needed": xp_needed,
        "progress_percentage": int((xp_progress / xp_needed) * 100) if xp_needed > 0 else 0
    })


@gamification_bp.get("/achievements")
@jwt_required()
def get_achievements():
    """Get all achievements with earned status"""
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    earned_badges = user.get("badges", [])
    
    achievements_list = []
    for achievement_id, achievement in ACHIEVEMENTS.items():
        achievements_list.append({
            "id": achievement_id,
            "name": achievement["name"],
            "description": achievement["description"],
            "icon": achievement["icon"],
            "xp_bonus": achievement["xp_bonus"],
            "earned": achievement_id in earned_badges
        })
    
    return jsonify({
        "achievements": achievements_list,
        "earned_count": len(earned_badges),
        "total_count": len(ACHIEVEMENTS)
    })


@gamification_bp.get("/leaderboard")
@jwt_required()
def leaderboard():
    """Get leaderboard rankings"""
    timeframe = request.args.get("timeframe", "all")  # all, weekly, monthly
    limit = int(request.args.get("limit", 100))
    
    if timeframe not in ["all", "weekly", "monthly"]:
        timeframe = "all"
    
    leaderboard_data = get_leaderboard(timeframe, limit)
    
    # Get current user's rank
    user_id = get_jwt_identity()
    user_rank = get_user_rank(user_id)
    
    # Find current user in leaderboard
    current_user_entry = None
    for entry in leaderboard_data:
        if entry["userId"] == user_id:
            current_user_entry = entry
            break
    
    return jsonify({
        "leaderboard": leaderboard_data,
        "user_rank": user_rank,
        "user_entry": current_user_entry,
        "timeframe": timeframe,
        "total_users": len(leaderboard_data)
    })


@gamification_bp.get("/stats")
@jwt_required()
def gamification_stats():
    """Get overall gamification statistics"""
    
    # Total XP distributed
    pipeline = [
        {"$match": {"role": "Student"}},
        {"$group": {
            "_id": None,
            "total_xp": {"$sum": "$xp"},
            "avg_level": {"$avg": "$level"},
            "total_badges": {"$sum": {"$size": {"$ifNull": ["$badges", []]}}}
        }}
    ]
    
    stats = list(mongo.db.users.aggregate(pipeline))
    
    if stats:
        stats = stats[0]
        return jsonify({
            "total_xp_distributed": stats.get("total_xp", 0),
            "average_level": round(stats.get("avg_level", 1), 2),
            "total_badges_earned": stats.get("total_badges", 0),
            "total_achievements": len(ACHIEVEMENTS)
        })
    
    return jsonify({
        "total_xp_distributed": 0,
        "average_level": 1,
        "total_badges_earned": 0,
        "total_achievements": len(ACHIEVEMENTS)
    })
