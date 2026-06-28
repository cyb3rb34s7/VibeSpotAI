from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse


def ok(request: Request, data: Any) -> dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "trace_id": request.state.trace_id,
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
            "trace_id": request.state.trace_id,
        },
    )
