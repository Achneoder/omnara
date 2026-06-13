import { Migration } from '@mikro-orm/migrations';

export class Migration20260613000000_initial extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TYPE "user_role" AS ENUM ('admin', 'editor');
    `);

    this.addSql(`
      CREATE TABLE "users" (
        "id"                     UUID        NOT NULL DEFAULT gen_random_uuid(),
        "email"                  VARCHAR(255) NOT NULL,
        "password_hash"          TEXT        NOT NULL,
        "role"                   "user_role" NOT NULL,
        "is_active"              BOOLEAN     NOT NULL DEFAULT TRUE,
        "failed_login_attempts"  INT         NOT NULL DEFAULT 0,
        "locked_until"           TIMESTAMPTZ NULL,
        "created_at"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql(`
      CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
    `);

    this.addSql(`
      CREATE TABLE "refresh_tokens" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"     UUID        NOT NULL,
        "token_hash"  TEXT        NOT NULL,
        "family_id"   UUID        NOT NULL,
        "expires_at"  TIMESTAMPTZ NOT NULL,
        "revoked_at"  TIMESTAMPTZ NULL,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "refresh_tokens_user_fk" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`
      CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens" ("family_id");
    `);

    this.addSql(`
      CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "refresh_tokens";`);
    this.addSql(`DROP TABLE IF EXISTS "users";`);
    this.addSql(`DROP TYPE IF EXISTS "user_role";`);
  }
}
