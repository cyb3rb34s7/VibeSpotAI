from app.jobs import summary_jobs


def test_enqueue_summary_refresh_sends_slug_to_actor(monkeypatch) -> None:
    sent_slugs: list[str] = []

    def fake_send(slug: str) -> None:
        sent_slugs.append(slug)

    monkeypatch.setattr(summary_jobs.refresh_place_summary_job, "send", fake_send)

    summary_jobs.enqueue_summary_refresh("kissa-focus")

    assert sent_slugs == ["kissa-focus"]
