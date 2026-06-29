from __future__ import annotations

import random

import psycopg
from psycopg.types.json import Jsonb

from app.core.config import settings

USERS = [
    ("priya", "priya@vibespot.local", "Priya"),
    ("alex_vibe", "alex@vibespot.local", "Alex"),
    ("mika_shib", "mika@vibespot.local", "Mika"),
    ("rahul_roasts", "rahul@vibespot.local", "Rahul"),
    ("naina_notes", "naina@vibespot.local", "Naina"),
]

PLACES = [
    ("Kissa Focus", "kissa-focus", 12.93524, 77.62448, ["Deep Work", "Fast Wifi", "Quiet"]),
    ("Aromas Koramangala", "aromas-koramangala", 12.93418, 77.62611, ["Cold Brew", "Laptop Friendly"]),
    ("Third Window Coffee", "third-window-coffee", 12.93681, 77.62173, ["Window Seats", "Filter Coffee"]),
    ("The Quiet Table", "the-quiet-table", 12.93296, 77.62372, ["Silent", "Solo Work"]),
    ("Roast Theory", "roast-theory", 12.93819, 77.62832, ["Specialty Coffee", "Work Calls"]),
    ("Paper Cup Social", "paper-cup-social", 12.93184, 77.62092, ["Friends", "Brunch"]),
    ("Loft & Latte", "loft-and-latte", 12.93762, 77.62565, ["High Ceiling", "Aesthetic"]),
    ("Blue Hour Brew", "blue-hour-brew", 12.93377, 77.62912, ["Late Evening", "Calm"]),
    ("Cafe Ledger", "cafe-ledger", 12.93904, 77.62268, ["Plug Points", "Deep Work"]),
    ("Noon Garden Cafe", "noon-garden-cafe", 12.93071, 77.62676, ["Outdoor", "Sunny"]),
    ("Signal Coffee Bar", "signal-coffee-bar", 12.93619, 77.63025, ["Quick Coffee", "Crowded"]),
    ("Attic Chai Room", "attic-chai-room", 12.93221, 77.61897, ["Chai", "Cozy"]),
]

NOTES = [
    "wifi held steady through a long call",
    "quiet until the post-lunch crowd came in",
    "window seat is the move",
    "playlist stayed soft enough to focus",
    "good for solo work, not group chaos",
    "chai was better than expected",
    "plug points are limited but useful",
    "staff did not rush laptop people",
]


def main() -> None:
    conninfo = settings.database_sync_url.replace("postgresql+psycopg://", "postgresql://", 1)
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                TRUNCATE
                    auth_sessions,
                    auth_otp_challenges,
                    place_summaries,
                    vibe_checks,
                    places,
                    users
                RESTART IDENTITY CASCADE
                """
            )
            user_ids = []
            for handle, email, display_name in USERS:
                cur.execute(
                    """
                    INSERT INTO users (handle, email, display_name, home_city)
                    VALUES (%s, %s, %s, 'Bangalore')
                    RETURNING id
                    """,
                    (handle, email, display_name),
                )
                user_ids.append(cur.fetchone()[0])

            place_ids = []
            for name, slug, lat, lng, tags in PLACES:
                cur.execute(
                    """
                    INSERT INTO places (name, slug, category, address, city, neighborhood, location, tags)
                    VALUES (
                        %s,
                        %s,
                        'cafe',
                        %s,
                        'Bangalore',
                        'Koramangala',
                        ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                        %s::jsonb
                    )
                    RETURNING id
                    """,
                    (
                        name,
                        slug,
                        f"{name}, Koramangala, Bangalore",
                        lng,
                        lat,
                        Jsonb(tags),
                    ),
                )
                place_id = cur.fetchone()[0]
                place_ids.append((place_id, name, tags))
                cur.execute(
                    """
                    INSERT INTO place_summaries (
                        place_id,
                        summary_text,
                        best_for,
                        avoid_when,
                        evidence_count,
                        confidence_score
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        place_id,
                        f"{name} is currently best understood as a {tags[0].lower()} spot based on early local drops.",
                        tags[0],
                        "Peak weekend evenings until more live checks confirm the pattern",
                        random.randint(4, 12),
                        0.74,
                    ),
                )

            for i in range(48):
                place_id, _name, tags = place_ids[i % len(place_ids)]
                user_id = user_ids[i % len(user_ids)]
                noise_score = random.choice([12, 18, 24, 31, 46, 58])
                wifi_score = random.choice([3, 4, 5])
                cur.execute(
                    """
                    INSERT INTO vibe_checks (
                        user_id,
                        place_id,
                        visit_intent,
                        noise_score,
                        wifi_score,
                        crowd_level,
                        best_use_case,
                        recommend_mode,
                        short_note,
                        location_confidence,
                        trust_weight,
                        raw_answers
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 0.95, 1.0, %s::jsonb)
                    """,
                    (
                        user_id,
                        place_id,
                        "deep_work",
                        noise_score,
                        wifi_score,
                        "low" if noise_score < 35 else "medium",
                        tags[0],
                        "yes",
                        random.choice(NOTES),
                        Jsonb({"seeded": True, "tag": tags[0]}),
                    ),
                )

            cur.execute(
                """
                WITH stats AS (
                    SELECT place_id, COUNT(*)::integer AS evidence_count
                    FROM vibe_checks
                    GROUP BY place_id
                )
                UPDATE place_summaries
                SET evidence_count = stats.evidence_count
                FROM stats
                WHERE place_summaries.place_id = stats.place_id
                """
            )

        conn.commit()

    print("Seeded VibeSpot local data")


if __name__ == "__main__":
    main()
