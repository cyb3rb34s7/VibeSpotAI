from fastapi import FastAPI, Request

from app.api.routes import places
from app.core.response import ok
from app.core.trace import ensure_trace_id

app = FastAPI(title="VibeSpot API", version="0.1.0")
app.include_router(places.router)


@app.middleware("http")
async def trace_middleware(request: Request, call_next):
    trace_id = request.headers.get("X-Trace-Id") or ensure_trace_id()
    request.state.trace_id = trace_id
    response = await call_next(request)
    response.headers["X-Trace-Id"] = trace_id
    return response


@app.get("/health")
def health(request: Request) -> dict:
    return ok(request, {"status": "ok", "service": "vibespot-api"})
