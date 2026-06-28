from typing import Any

from fastapi import Request


def ok(request: Request, data: Any) -> dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "trace_id": request.state.trace_id,
    }
