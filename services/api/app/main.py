from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import places
from app.core.response import error_response, ok
from app.core.trace import ensure_trace_id

app = FastAPI(title="VibeSpot API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:38201",
        "http://127.0.0.1:38201",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(places.router)


@app.middleware("http")
async def trace_middleware(request: Request, call_next):
    trace_id = request.headers.get("X-Trace-Id") or ensure_trace_id()
    request.state.trace_id = trace_id
    response = await call_next(request)
    response.headers["X-Trace-Id"] = trace_id
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    code = "not_found" if exc.status_code == 404 else "http_error"
    return error_response(
        request,
        status_code=exc.status_code,
        code=code,
        message=str(exc.detail),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return error_response(
        request,
        status_code=422,
        code="validation_error",
        message="Request validation failed",
        details={"errors": exc.errors()},
    )


@app.get("/health")
def health(request: Request) -> dict:
    return ok(request, {"status": "ok", "service": "vibespot-api"})
