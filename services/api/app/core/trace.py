import time
import secrets

TRACE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"


def ensure_trace_id() -> str:
    timestamp = base58_time(int(time.time()))[-5:]
    random_part = "".join(secrets.choice(TRACE_ALPHABET) for _ in range(5))
    return f"{timestamp}{random_part}"


def base58_time(value: int) -> str:
    if value == 0:
        return TRACE_ALPHABET[0]

    base = len(TRACE_ALPHABET)
    chars: list[str] = []
    while value:
        value, remainder = divmod(value, base)
        chars.append(TRACE_ALPHABET[remainder])
    return "".join(reversed(chars))
