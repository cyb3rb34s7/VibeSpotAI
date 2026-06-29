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


def start_and_verify_session(client: TestClient, email: str) -> str:
    start_response = client.post("/auth/start", json={"email": email})
    assert start_response.status_code == 200
    start_body = start_response.json()
    assert start_body["success"] is True
    assert start_body["data"]["delivery"] == "local_response"
    assert len(start_body["data"]["otp_code"]) == 6
    assert start_body["data"]["expires_in_seconds"] > 0

    verify_response = client.post(
        "/auth/verify",
        json={
            "email": email,
            "otp_code": start_body["data"]["otp_code"],
        },
    )
    assert verify_response.status_code == 200
    verify_body = verify_response.json()
    assert verify_body["success"] is True
    assert verify_body["data"]["token_type"] == "bearer"
    assert len(verify_body["data"]["access_token"]) >= 32
    assert verify_body["data"]["user"]["email"] == email
    return verify_body["data"]["access_token"]


def test_email_otp_creates_database_backed_session_and_current_user() -> None:
    client = TestClient(app)

    token = start_and_verify_session(client, "priya@vibespot.local")

    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    me_body = me_response.json()
    assert me_body["success"] is True
    assert me_body["data"]["handle"] == "priya"
    assert me_body["data"]["email"] == "priya@vibespot.local"
    assert me_body["data"]["home_city"] == "Bangalore"


def test_auth_me_rejects_missing_or_invalid_token() -> None:
    client = TestClient(app)

    missing_response = client.get("/auth/me")
    invalid_response = client.get("/auth/me", headers={"Authorization": "Bearer not-real"})

    assert missing_response.status_code == 401
    assert missing_response.json()["error"]["code"] == "unauthorized"
    assert invalid_response.status_code == 401
    assert invalid_response.json()["error"]["code"] == "unauthorized"


def test_auth_verify_rejects_wrong_otp() -> None:
    client = TestClient(app)

    client.post("/auth/start", json={"email": "priya@vibespot.local"})
    response = client.post(
        "/auth/verify",
        json={"email": "priya@vibespot.local", "otp_code": "000000"},
    )

    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "invalid_otp"


def test_logout_revokes_session() -> None:
    client = TestClient(app)
    token = start_and_verify_session(client, "priya@vibespot.local")

    logout_response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert logout_response.status_code == 200
    assert logout_response.json()["success"] is True
    assert me_response.status_code == 401
    assert me_response.json()["error"]["code"] == "unauthorized"


def test_profiles_me_returns_contribution_summary() -> None:
    client = TestClient(app)
    token = start_and_verify_session(client, "rahul@vibespot.local")

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
    token = start_and_verify_session(client, "rahul@vibespot.local")
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
