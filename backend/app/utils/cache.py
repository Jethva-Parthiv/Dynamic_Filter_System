import json
import hashlib
import datetime


def make_cache_key(prefix: str, data: dict) -> str:
    """Create a deterministic cache key (JSON + SHA256) that supports dates."""
    def default_serializer(obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        raise TypeError(f"Type {obj.__class__.__name__} not serializable")

    raw = json.dumps(data, sort_keys=True, default=default_serializer)
    return f"{prefix}:{hashlib.sha256(raw.encode()).hexdigest()}"
