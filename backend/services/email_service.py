from __future__ import annotations

import smtplib
from email.message import EmailMessage

from backend.config import get_settings


def send_email_alert(recipient: str, subject: str, message: str) -> tuple[bool, str]:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_from:
        return False, "SMTP settings are not configured."

    email = EmailMessage()
    email["Subject"] = subject
    email["From"] = settings.smtp_from
    email["To"] = recipient
    email.set_content(message)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(email)
        return True, "Email sent"
    except Exception as exc:
        return False, str(exc)
