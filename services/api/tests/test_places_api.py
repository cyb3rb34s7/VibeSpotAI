from fastapi.testclient import TestClient

from app.main import app


def test_nearby_places_returns_seeded_places_ordered_by_distance() -> None:
    client = TestClient(app)

    response = client.get("/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert len(body["trace_id"]) == 10
    assert len(body["data"]) >= 3
    distances = [place["distance_m"] for place in body["data"]]
    assert distances == sorted(distances)
    first_place = body["data"][0]
    assert first_place["name"] == "Kissa Focus"
    assert first_place["match_percent"] >= 72
    assert "Deep Work" in first_place["tags"]
