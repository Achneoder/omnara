import { Migration } from '@mikro-orm/migrations';

export class Migration20260614000000_phase1_entities extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TYPE "site_platform" AS ENUM ('wordpress', 'shopify', 'custom');
    `);

    this.addSql(`
      CREATE TYPE "content_status" AS ENUM ('draft', 'review', 'live', 'archived');
    `);

    this.addSql(`
      CREATE TABLE "sites" (
        "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
        "name"        VARCHAR(255)  NOT NULL,
        "url"         VARCHAR(255)  NOT NULL,
        "platform"    "site_platform" NOT NULL,
        "settings"    JSONB         NULL DEFAULT '{}',
        "created_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql(`
      CREATE TABLE "api_keys" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "key_hash"      TEXT          NOT NULL,
        "label"         VARCHAR(255)  NOT NULL,
        "site_id"       UUID          NOT NULL,
        "last_used_at"  TIMESTAMPTZ   NULL,
        "revoked_at"    TIMESTAMPTZ   NULL,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "api_keys_site_fk" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`
      CREATE INDEX "api_keys_site_id_idx" ON "api_keys" ("site_id");
    `);

    this.addSql(`
      CREATE TABLE "content_types" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "site_id"       UUID          NOT NULL,
        "name"          VARCHAR(255)  NOT NULL,
        "slug"          VARCHAR(255)  NOT NULL,
        "field_schema"  JSONB         NULL DEFAULT '{}',
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "content_types_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "content_types_site_fk" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`
      CREATE INDEX "content_types_site_id_idx" ON "content_types" ("site_id");
    `);

    this.addSql(`
      CREATE UNIQUE INDEX "content_types_site_id_slug_unique" ON "content_types" ("site_id", "slug");
    `);

    this.addSql(`
      CREATE TABLE "content_entries" (
        "id"                UUID              NOT NULL DEFAULT gen_random_uuid(),
        "site_id"           UUID              NOT NULL,
        "content_type_id"   UUID              NOT NULL,
        "title"             VARCHAR(255)      NOT NULL,
        "slug"              VARCHAR(255)      NOT NULL,
        "body"              JSONB             NULL DEFAULT '{}',
        "status"            "content_status"  NOT NULL,
        "published_at"      TIMESTAMPTZ       NULL,
        "author_session_id" VARCHAR(255)      NULL,
        "created_at"        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
        CONSTRAINT "content_entries_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "content_entries_site_fk" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE CASCADE,
        CONSTRAINT "content_entries_content_type_fk" FOREIGN KEY ("content_type_id")
          REFERENCES "content_types" ("id") ON DELETE RESTRICT
      );
    `);

    this.addSql(`
      CREATE INDEX "content_entries_site_id_idx" ON "content_entries" ("site_id");
    `);

    this.addSql(`
      CREATE INDEX "content_entries_content_type_id_idx" ON "content_entries" ("content_type_id");
    `);

    this.addSql(`
      CREATE INDEX "content_entries_status_idx" ON "content_entries" ("status");
    `);

    this.addSql(`
      CREATE TABLE "media_references" (
        "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
        "content_entry_id" UUID          NOT NULL,
        "url"              TEXT          NOT NULL,
        "alt_text"         VARCHAR(255)  NULL,
        "mime_type"        VARCHAR(255)  NOT NULL,
        "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "media_references_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "media_references_content_entry_fk" FOREIGN KEY ("content_entry_id")
          REFERENCES "content_entries" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`
      CREATE INDEX "media_references_content_entry_id_idx" ON "media_references" ("content_entry_id");
    `);

    this.addSql(`
      CREATE TABLE "activity_logs" (
        "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
        "site_id"      UUID          NULL,
        "session_id"   VARCHAR(255)  NULL,
        "action"       VARCHAR(255)  NOT NULL,
        "entity_type"  VARCHAR(100)  NOT NULL,
        "entity_id"    VARCHAR(255)  NULL,
        "metadata"     JSONB         NULL DEFAULT '{}',
        "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "activity_logs_site_fk" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE SET NULL
      );
    `);

    this.addSql(`
      CREATE INDEX "activity_logs_site_id_idx" ON "activity_logs" ("site_id");
    `);

    this.addSql(`
      CREATE INDEX "activity_logs_session_id_idx" ON "activity_logs" ("session_id");
    `);

    this.addSql(`
      CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" ("created_at");
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "activity_logs";`);
    this.addSql(`DROP TABLE IF EXISTS "media_references";`);
    this.addSql(`DROP TABLE IF EXISTS "content_entries";`);
    this.addSql(`DROP TABLE IF EXISTS "content_types";`);
    this.addSql(`DROP TABLE IF EXISTS "api_keys";`);
    this.addSql(`DROP TABLE IF EXISTS "sites";`);
    this.addSql(`DROP TYPE IF EXISTS "content_status";`);
    this.addSql(`DROP TYPE IF EXISTS "site_platform";`);
  }
}
