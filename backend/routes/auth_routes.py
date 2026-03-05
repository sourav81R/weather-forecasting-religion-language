from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user

from backend.models.user import (
    add_saved_city,
    create_user,
    get_user_settings,
    list_alert_rules,
    list_saved_cities,
    remove_saved_city,
    upsert_alert_rules,
    update_user_settings,
    verify_user,
)

bp = Blueprint("auth_api", __name__, url_prefix="/api")


@bp.post("/auth/signup")
def signup():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    try:
        user = create_user(email=email, password=password)
    except Exception as exc:
        return jsonify({"error": f"Unable to create user: {exc}"}), 400

    login_user(user)
    return jsonify({"user": {"id": user.id, "email": user.email}, "settings": get_user_settings(user.id)})


@bp.post("/auth/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    user = verify_user(email=email, password=password)
    if user is None:
        return jsonify({"error": "Invalid email or password."}), 401

    login_user(user)
    return jsonify({"user": {"id": user.id, "email": user.email}, "settings": get_user_settings(user.id)})


@bp.post("/auth/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"ok": True})


@bp.get("/auth/me")
def me():
    if not current_user.is_authenticated:
        return jsonify({"authenticated": False})
    return jsonify(
        {
            "authenticated": True,
            "user": {"id": int(current_user.id), "email": current_user.email},
            "settings": get_user_settings(int(current_user.id)),
            "savedCities": list_saved_cities(int(current_user.id)),
            "alertRules": list_alert_rules(int(current_user.id)),
        }
    )


@bp.get("/user/settings")
@login_required
def get_settings():
    return jsonify(get_user_settings(int(current_user.id)))


@bp.post("/user/settings")
@login_required
def post_settings():
    payload = request.get_json(silent=True) or {}
    settings = update_user_settings(int(current_user.id), payload)
    return jsonify(settings)


@bp.get("/user/cities")
@login_required
def get_cities():
    return jsonify({"cities": list_saved_cities(int(current_user.id))})


@bp.post("/user/cities")
@login_required
def post_city():
    payload = request.get_json(silent=True) or {}
    city = str(payload.get("city", "")).strip()
    if not city:
        return jsonify({"error": "City is required."}), 400
    cities = add_saved_city(int(current_user.id), city)
    return jsonify({"cities": cities})


@bp.delete("/user/cities")
@login_required
def delete_city():
    payload = request.get_json(silent=True) or {}
    city = str(payload.get("city", "")).strip()
    cities = remove_saved_city(int(current_user.id), city)
    return jsonify({"cities": cities})


@bp.get("/user/alert-rules")
@login_required
def get_alert_rules():
    return jsonify({"rules": list_alert_rules(int(current_user.id))})


@bp.post("/user/alert-rules")
@login_required
def post_alert_rules():
    payload = request.get_json(silent=True) or {}
    rules = payload.get("rules") if isinstance(payload.get("rules"), list) else []
    updated = upsert_alert_rules(int(current_user.id), rules)
    return jsonify({"rules": updated})
