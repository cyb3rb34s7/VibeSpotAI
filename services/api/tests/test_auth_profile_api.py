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


def test_dev_login_returns_token_and_current_user() -> None:
    client = TestClient(app)

    login_response = client.post("/auth/dev-login", json={"handle": "priya"})

    assert login_response.status_code == 200
    login_body = login_response.json()
    assert login_body["success"] is True
    assert login_body["data"]["token_type"] == "bearer"
    assert login_body["data"]["access_token"].startswith("local-dev.")
    assert login_body["data"]["user"]["handle"] == "priya"
    assert login_body["data"]["user"]["display_name"] == "Priya"

    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {login_body['data']['access_token']}"},
    )

    assert me_response.status_code == 200
    me_body = me_response.json()
    assert me_body["success"] is True
    assert me_body["data"]["handle"] == "priya"
    assert me_body["data"]["home_city"] == "Bangalore"


def test_auth_me_rejects_missing_or_invalid_token() -> None:
    client = TestClient(app)

    missing_response = client.get("/auth/me")
    invalid_response = client.get("/auth/me", headers={"Authorization": "Bearer not-real"})

    assert missing_response.status_code == 401
    assert missing_response.json()["error"]["code"] == "unauthorized"
    assert invalid_response.status_code == 401
    assert invalid_response.json()["error"]["code"] == "unauthorized"


def test_profiles_me_returns_contribution_summary() -> None:
    client = TestClient(app)
    token = client.post("/auth/dev-login", json={"handle": "rahul_roasts"}).json()["data"][
        "access_token"
    ]

    response = client.get("/profiles/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    profile = body["data"]
    assert profile["user"]["handle"] == "rahul_roasts"
    assert profile["stats"]["vibe_checks_count"] >= 1
    assert profile["stats"]["places_contributed_count"] >= 1
    assert len(profile["taste_tags"]) >= 1
    assert len(profile["recent_drops"]) >= 1
    assert {"place_name", "place_slug", "short_note", "submitted_at"} <= set(
        profile["recent_drops"][0]
    )


def test_authenticated_vibe_check_uses_bearer_user() -> None:
    client = TestClient(app)
    token = client.post("/auth/dev-login", json={"handle": "rahul_roasts"}).json()["data"][
        "access_token"
    ]
    before_detail = client.get("/places/kissa-focus").json()["data"]
    created_id = None

    try:
        response = client.post(
            "/places/kissa-focus/vibe-checks",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "visit_intent": "deep_work",
                "noise_score": 20,
                "wifi_score": 5,
                "crowd_level": "low",
                "best_use_case": "Deep Work",
                "recommend_mode": "yes",
                "short_note": "auth-owned local drop",
                "location_confidence": 0.88,
            },
        )

        assert response.status_code == 201
        body = response.json()
        created_id = body["data"]["id"]
        assert body["success"] is True
        assert body["data"]["created_by_handle"] == "rahul_roasts"

        profile = client.get("/profiles/me", headers={"Authorization": f"Bearer {token}"}).json()[
            "data"
        ]
        assert profile["recent_drops"][0]["short_note"] == "auth-owned local drop"
        assert profile["recent_drops"][0]["place_slug"] == "kissa-focus"
    finally:
        if created_id is not None:
            delete_vibe_check(created_id)
            restore_summary_state("kissa-focus", before_detail)
