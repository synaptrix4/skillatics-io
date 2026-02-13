import os
from urllib.parse import urlparse, urlunparse
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from extensions import jwt, mongo


def create_app() -> Flask:
    """
    Factory function to create and configure the Flask application.
    """
    load_dotenv()
    app = Flask(__name__)
    
    # --- CORS Configuration ---
    # Allow frontend origin from environment variable
    frontend_url = os.getenv("FRONTEND_URL", "*")
    CORS(app, resources={
        r"/api/*": {
            "origins": frontend_url,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # --- Database Configuration ---
    # Ensure Mongo URI always includes a database name for clarity
    # and to avoid defaulting to 'test' db in some environments.
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillatics")
    
    # Check for preferred DB name from various env variables
    preferred_db = os.getenv("MONGO_DB") or os.getenv("DB_NAME") or os.getenv("MONGO_DATABASE")
    
    parsed = urlparse(mongo_uri)
    path_has_db = parsed.path and parsed.path != "/"
    
    if not path_has_db:
        # If no DB is in the URI path, add one.
        # Use the preferred_db var, or default to 'skillatics'
        db_name = (preferred_db or "skillatics").strip()
        if not db_name.startswith("/"):
             db_name = f"/{db_name}"
        
        parsed = parsed._replace(path=db_name)
        mongo_uri = urlunparse(parsed)

    app.config["MONGO_URI"] = mongo_uri
    
    # --- JWT Configuration ---
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-me")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

    # --- Initialize Extensions ---
    mongo.init_app(app)
    jwt.init_app(app)

    # --- Import and Register Blueprints ---
    # Import blueprints here, after extensions are initialized,
    # to avoid circular import errors.
    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.test_engine import test_bp
    from routes.data import data_bp
    from routes.topics import topics_bp
    from routes.code_execution import code_bp
    from routes.gamification import gamification_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(test_bp, url_prefix="/api/test")
    app.register_blueprint(data_bp, url_prefix="/api/data")
    app.register_blueprint(topics_bp, url_prefix="/api/learn")
    app.register_blueprint(code_bp, url_prefix="/api/code")
    app.register_blueprint(gamification_bp, url_prefix="/api/gamification")

    # --- Health Check Route ---
    @app.get("/api/health")
    def health():
        """
Entrypoint to check if the API is running."""
        return jsonify({"status": "ok", "message": "API is healthy"})

    return app


# --- Run Application ---
if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_ENV") == "development" # Enable debug mode if in development
    )
