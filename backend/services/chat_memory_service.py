from __future__ import annotations

import datetime as dt
from typing import Any

from backend.models.db import get_db


class ChatMemoryService:
    def save_message(
        self,
        *,
        role: str,
        message: str,
        user_id: int | None = None,
        session_id: str = "",
        language: str = "",
    ) -> None:
        clean_role = str(role or "").strip().lower()
        clean_message = str(message or "").strip()
        clean_session_id = str(session_id or "").strip()
        clean_language = str(language or "").strip()

        if clean_role not in {"user", "model", "assistant", "system"}:
            clean_role = "user"
        if not clean_message:
            return

        timestamp = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"
        db = get_db()
        db.execute(
            """
            INSERT INTO chat_history (user_id, session_id, role, message, language, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (int(user_id) if user_id is not None else None, clean_session_id or None, clean_role, clean_message, clean_language, timestamp),
        )
        db.commit()

    def get_recent_messages(
        self,
        *,
        user_id: int | None = None,
        session_id: str = "",
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        safe_limit = max(1, min(int(limit), 30))
        db = get_db()

        rows = []
        if user_id is not None:
            rows = db.execute(
                """
                SELECT role, message, language, timestamp
                FROM chat_history
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (int(user_id), safe_limit),
            ).fetchall()
        elif session_id.strip():
            rows = db.execute(
                """
                SELECT role, message, language, timestamp
                FROM chat_history
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (session_id.strip(), safe_limit),
            ).fetchall()

        messages = [
            {
                "role": str(row["role"]),
                "text": str(row["message"]),
                "language": str(row["language"] or ""),
                "timestamp": str(row["timestamp"]),
            }
            for row in rows
        ]
        messages.reverse()
        return messages


chat_memory_service = ChatMemoryService()
