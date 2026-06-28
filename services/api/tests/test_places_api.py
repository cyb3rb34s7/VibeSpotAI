import psycopg
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def delete_vibe_check(vibe_check_id: str) -> None:
    conninfo = settings.database_sync_url.replace("postgresql+psycopg://", "postgresql://", 1)
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM vibe_checks WHERE id = %s", (vibe_check_id,))


def restore_summary_state(place_slug: str, summary: dict) -> None:
    conninfo = settings.database_sync_url.replace("postgresql+psycopg://", "postgresql://", 1)
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE place_summaries
                SET
                    evidence_count = %s,
                    summary_text = %s,
                    best_for = %s,
                    confidence_score = %s
                WHERE place_id = (SELECT id FROM places WHERE slug = %s)
                """,
                (
                    summary["evidence_count"],
                    summary["summary"],
                    summary["best_for"],
                    summary["confidence_score"],
                    place_slug,
                ),
            )


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


def test_create_vibe_check_accepts_local_submission() -> None:
    client = TestClient(app)
    before_detail = client.get("/places/kissa-focus").json()["data"]
    created_id = None

    try:
        response = client.post(
            "/places/kissa-focus/vibe-checks",
            json={
                "visit_intent": "deep_work",
                "noise_score": 22,
                "wifi_score": 5,
                "crowd_level": "low",
                "best_use_case": "Deep Work",
                "recommend_mode": "yes",
                "short_note": "calm corner table, excellent wifi",
                "location_confidence": 0.9,
            },
        )

        assert response.status_code == 201
        body = response.json()
        created_id = body["data"]["id"]
        assert body["success"] is True
        assert body["data"]["place_slug"] == "kissa-focus"
        assert body["data"]["short_note"] == "calm corner table, excellent wifi"
        assert body["data"]["trust_weight"] == 0.9
        assert len(body["data"]["id"]) > 10
        after_detail = client.get("/places/kissa-focus").json()["data"]
        assert after_detail["evidence_count"] == before_detail["evidence_count"] + 1
    finally:
        if created_id is not None:
            delete_vibe_check(created_id)
            restore_summary_state("kissa-focus", before_detail)


def test_create_vibe_check_rejects_unknown_place() -> None:
    client = TestClient(app)

    response = client.post(
        "/places/not-a-real-place/vibe-checks",
        json={
            "visit_intent": "deep_work",
            "noise_score": 22,
            "wifi_score": 5,
            "crowd_level": "low",
            "best_use_case": "Deep Work",
            "recommend_mode": "yes",
            "short_note": "calm corner table, excellent wifi",
        },
    )

    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "not_found"
