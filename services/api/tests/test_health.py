from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"] == {"status": "ok", "service": "vibespot-api"}
    assert len(body["trace_id"]) == 10
    assert response.headers["X-Trace-Id"] == body["trace_id"]
