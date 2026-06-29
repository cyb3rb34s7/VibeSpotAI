"""auth sessions

Revision ID: 0002_auth_sessions
Revises: 0001_initial
Create Date: 2026-06-29
"""

from alembic import op

revision = "0002_auth_sessions"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email varchar(255)")
    op.execute(
        """
        UPDATE users
        SET email = CASE handle
            WHEN 'priya' THEN 'priya@vibespot.local'
            WHEN 'alex_vibe' THEN 'alex@vibespot.local'
            WHEN 'mika_shib' THEN 'mika@vibespot.local'
            WHEN 'rahul_roasts' THEN 'rahul@vibespot.local'
            WHEN 'naina_notes' THEN 'naina@vibespot.local'
            ELSE handle || '@vibespot.local'
        END
        WHERE email IS NULL
        """
    )
    op.execute("ALTER TABLE users ALTER COLUMN email SET NOT NULL")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (lower(email))")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS auth_otp_challenges (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            email varchar(255) NOT NULL,
            otp_hash varchar(128) NOT NULL,
            expires_at timestamptz NOT NULL,
            consumed_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_auth_otp_challenges_email_created
        ON auth_otp_challenges (lower(email), created_at DESC)
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS auth_sessions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash varchar(128) NOT NULL UNIQUE,
            expires_at timestamptz NOT NULL,
            revoked_at timestamptz,
            created_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_auth_sessions_user_id ON auth_sessions (user_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS auth_sessions")
    op.execute("DROP TABLE IF EXISTS auth_otp_challenges")
    op.execute("DROP INDEX IF EXISTS ix_users_email")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS email")
