from __future__ import annotations

import datetime as dt
from dataclasses import dataclass

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from backend.models.db import get_db


@dataclass
class User(UserMixin):
    id: int
    email: str


def _row_to_user(row: object | None) -> User | None:
    if row is None:
        return None
    return User(id=int(row["id"]), email=str(row["email"]))


def get_user_by_id(user_id: int | str) -> User | None:
    row = get_db().execute("SELECT id, email FROM users WHERE id = ?", (int(user_id),)).fetchone()
    return _row_to_user(row)


def get_user_by_email(email: str) -> User | None:
    row = get_db().execute("SELECT id, email FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    return _row_to_user(row)


def create_user(email: str, password: str) -> User:
    clean_email = email.lower().strip()
    password_hash = generate_password_hash(password)
    now = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"

    db = get_db()
    cursor = db.execute(
        "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
        (clean_email, password_hash, now),
    )
    user_id = int(cursor.lastrowid)
    db.execute(
        "INSERT INTO user_settings (user_id, language, units, dark_mode, notification_email, alerts_enabled) VALUES (?, 'English', 'metric', 0, ?, 1)",
        (user_id, clean_email),
    )
    for rule_type, threshold in (
        ("rain_probability", 70),
        ("temperature_c", 35),
        ("wind_kmh", 40),
        ("uv_index", 8),
    ):
        db.execute(
            "INSERT INTO alert_rules (user_id, rule_type, threshold, enabled, created_at) VALUES (?, ?, ?, 1, ?)",
            (user_id, rule_type, threshold, now),
        )
    db.commit()
    return User(id=user_id, email=clean_email)


def verify_user(email: str, password: str) -> User | None:
    clean_email = email.lower().strip()
    row = get_db().execute("SELECT id, email, password_hash FROM users WHERE email = ?", (clean_email,)).fetchone()
    if row is None:
        return None
    if not check_password_hash(str(row["password_hash"]), password):
        return None
    return User(id=int(row["id"]), email=str(row["email"]))


def get_user_settings(user_id: int) -> dict[str, object]:
    row = get_db().execute(
        "SELECT language, units, dark_mode, notification_email, alerts_enabled FROM user_settings WHERE user_id = ?",
        (int(user_id),),
    ).fetchone()
    if row is None:
        return {
            "language": "English",
            "units": "metric",
            "darkMode": False,
            "notificationEmail": "",
            "alertsEnabled": True,
        }
    return {
        "language": str(row["language"]),
        "units": str(row["units"]),
        "darkMode": bool(int(row["dark_mode"])),
        "notificationEmail": str(row["notification_email"] or ""),
        "alertsEnabled": bool(int(row["alerts_enabled"])),
    }


def update_user_settings(user_id: int, payload: dict[str, object]) -> dict[str, object]:
    current = get_user_settings(user_id)
    merged = {
        "language": str(payload.get("language", current["language"])),
        "units": "imperial" if str(payload.get("units", current["units"])) == "imperial" else "metric",
        "dark_mode": 1 if bool(payload.get("darkMode", current["darkMode"])) else 0,
        "notification_email": str(payload.get("notificationEmail", current["notificationEmail"])).strip(),
        "alerts_enabled": 1 if bool(payload.get("alertsEnabled", current["alertsEnabled"])) else 0,
    }

    db = get_db()
    db.execute(
        """
        INSERT INTO user_settings (user_id, language, units, dark_mode, notification_email, alerts_enabled)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET language = excluded.language,
                      units = excluded.units,
                      dark_mode = excluded.dark_mode,
                      notification_email = excluded.notification_email,
                      alerts_enabled = excluded.alerts_enabled
        """,
        (
            int(user_id),
            merged["language"],
            merged["units"],
            merged["dark_mode"],
            merged["notification_email"],
            merged["alerts_enabled"],
        ),
    )
    db.commit()
    return get_user_settings(user_id)


def list_saved_cities(user_id: int) -> list[str]:
    rows = get_db().execute(
        "SELECT city FROM saved_cities WHERE user_id = ? ORDER BY created_at DESC",
        (int(user_id),),
    ).fetchall()
    return [str(row["city"]) for row in rows]


def add_saved_city(user_id: int, city: str) -> list[str]:
    clean_city = city.strip()
    if not clean_city:
        return list_saved_cities(user_id)

    now = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"
    db = get_db()
    db.execute(
        "INSERT OR IGNORE INTO saved_cities (user_id, city, created_at) VALUES (?, ?, ?)",
        (int(user_id), clean_city, now),
    )
    db.commit()
    return list_saved_cities(user_id)


def remove_saved_city(user_id: int, city: str) -> list[str]:
    db = get_db()
    db.execute("DELETE FROM saved_cities WHERE user_id = ? AND city = ?", (int(user_id), city.strip()))
    db.commit()
    return list_saved_cities(user_id)


def list_alert_rules(user_id: int) -> list[dict[str, object]]:
    rows = get_db().execute(
        "SELECT id, rule_type, threshold, enabled FROM alert_rules WHERE user_id = ? ORDER BY id ASC",
        (int(user_id),),
    ).fetchall()
    return [
        {
            "id": int(row["id"]),
            "ruleType": str(row["rule_type"]),
            "threshold": float(row["threshold"]),
            "enabled": bool(int(row["enabled"])),
        }
        for row in rows
    ]


def upsert_alert_rules(user_id: int, rules: list[dict[str, object]]) -> list[dict[str, object]]:
    now = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"
    db = get_db()
    for rule in rules:
        rule_type = str(rule.get("ruleType", "")).strip()
        if not rule_type:
            continue
        threshold = float(rule.get("threshold", 0))
        enabled = 1 if bool(rule.get("enabled", True)) else 0
        db.execute(
            """
            INSERT INTO alert_rules (user_id, rule_type, threshold, enabled, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, rule_type)
            DO UPDATE SET threshold = excluded.threshold, enabled = excluded.enabled
            """,
            (int(user_id), rule_type, threshold, enabled, now),
        )
    db.commit()
    return list_alert_rules(user_id)
