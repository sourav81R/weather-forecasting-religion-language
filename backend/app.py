from __future__ import annotations

from pathlib import Path

from flask import Flask, send_from_directory
from flask_login import LoginManager

from backend.config import get_settings
from backend.models.db import init_db
from backend.models.user import get_user_by_id
from backend.routes.auth_routes import bp as auth_bp
from backend.routes.intelligence_routes import bp as intelligence_bp
from backend.routes.weather_routes import bp as weather_bp


def create_app() -> Flask:
    settings = get_settings()
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"

    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=settings.secret_key,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True,
    )

    init_db(app)
    _init_login(app)

    app.register_blueprint(weather_bp)
    app.register_blueprint(intelligence_bp)
    app.register_blueprint(auth_bp)

    @app.get("/")
    def index():
        return send_from_directory(frontend_dir, "index.html")

    @app.get("/frontend/<path:filename>")
    def frontend_static(filename: str):
        return send_from_directory(frontend_dir, filename)

    @app.get("/css/<path:filename>")
    def css(filename: str):
        return send_from_directory(frontend_dir / "css", filename)

    @app.get("/js/<path:filename>")
    def js(filename: str):
        return send_from_directory(frontend_dir / "js", filename)

    @app.get("/components/<path:filename>")
    def components(filename: str):
        return send_from_directory(frontend_dir / "components", filename)

    @app.get("/manifest.json")
    def manifest():
        return send_from_directory(frontend_dir, "manifest.json")

    @app.get("/service-worker.js")
    def service_worker():
        return send_from_directory(frontend_dir, "service-worker.js")

    @app.get("/health")
    def health():
        return {"ok": True}

    return app


def _init_login(app: Flask) -> None:
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id: str):
        return get_user_by_id(int(user_id))
