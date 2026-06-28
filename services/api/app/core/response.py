from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.trace import ensure_trace_id


def get_trace_id(request: Request) -> str:
    trace_id = getattr(request.state, "trace_id", None)
    if trace_id is None:
        trace_id = ensure_trace_id()
        request.state.trace_id = trace_id
    return trace_id


def ok(request: Request, data: Any) -> dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "trace_id": get_trace_id(request),
    }


def error_response(
    request: Request,
    *,
    status_code: int,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details or {},
            },
            "trace_id": get_trace_id(request),
        },
    )
