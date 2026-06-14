import { Migration } from '@mikro-orm/migrations';

export class Migration20260616000002_assets extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "assets" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "site_id"       UUID          NOT NULL,
        "original_name" VARCHAR(500)  NOT NULL,
        "storage_path"  VARCHAR(1000) NOT NULL,
        "mime_type"     VARCHAR(255)  NOT NULL,
        "size"          BIGINT        NOT NULL DEFAULT 0,
        "category"      VARCHAR(20)   NOT NULL DEFAULT 'other',
        "variants"      JSONB         NULL DEFAULT '{}',
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "assets_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "assets_site_id_fkey" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`CREATE INDEX "assets_site_id_idx" ON "assets" ("site_id");`);
    this.addSql(`CREATE INDEX "assets_category_idx" ON "assets" ("category");`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "assets";`);
  }
}
