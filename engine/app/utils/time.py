from datetime import datetime, timezone
from typing import Optional


def parse_time(value: Optional[str], default: str) -> datetime:
    if not value:
        value = default

    if value.endswith("Z"):
        value = value[:-1] + "+00:00"

    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        # Fallback to date-only
        parsed = datetime.strptime(value, "%Y-%m-%d")

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed


def to_iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
