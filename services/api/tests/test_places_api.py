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


def test_place_detail_returns_summary_and_recent_vibe_checks() -> None:
    client = TestClient(app)

    response = client.get("/places/kissa-focus")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert len(body["trace_id"]) == 10

    place = body["data"]
    assert place["slug"] == "kissa-focus"
    assert place["name"] == "Kissa Focus"
    assert place["address"]
    assert place["summary"]
    assert place["best_for"] == "Deep Work"
    assert place["evidence_count"] >= 1
    assert 0 <= place["signals"]["avg_noise_score"] <= 100
    assert place["signals"]["avg_wifi_score"] >= 1
    assert len(place["recent_vibe_checks"]) >= 1
    assert {"visit_intent", "best_use_case", "short_note", "submitted_at"} <= set(
        place["recent_vibe_checks"][0]
    )


def test_place_detail_returns_404_for_unknown_slug() -> None:
    client = TestClient(app)

    response = client.get("/places/not-a-real-place")

    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "not_found"
