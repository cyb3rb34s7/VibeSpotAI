from fastapi.testclient import TestClient

from app.main import app


def test_unknown_route_returns_trace_error_envelope() -> None:
    client = TestClient(app)

    response = client.get("/not-a-real-route")

    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "not_found"
    assert body["error"]["message"] == "Not Found"
    assert len(body["trace_id"]) == 10


def test_validation_error_returns_trace_error_envelope() -> None:
    client = TestClient(app)

    response = client.get("/places/nearby?lat=500&lng=77.6245")

    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["details"]["errors"]
    assert len(body["trace_id"]) == 10
