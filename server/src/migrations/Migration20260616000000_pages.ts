import { Migration } from '@mikro-orm/migrations';

export class Migration20260616000000_pages extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "pages" (
        "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
        "site_id"      UUID          NOT NULL,
        "title"        VARCHAR(255)  NOT NULL,
        "slug"         VARCHAR(255)  NOT NULL,
        "is_homepage"  BOOLEAN       NOT NULL DEFAULT false,
        "meta"         JSONB         NULL DEFAULT '{}',
        "status"       VARCHAR(20)   NOT NULL DEFAULT 'draft',
        "sort_order"   INTEGER       NOT NULL DEFAULT 0,
        "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "pages_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "pages_site_id_fkey" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`CREATE UNIQUE INDEX "pages_site_id_slug_unique" ON "pages" ("site_id", "slug");`);
    this.addSql(`CREATE INDEX "pages_site_id_idx" ON "pages" ("site_id");`);
    this.addSql(`CREATE INDEX "pages_status_idx" ON "pages" ("status");`);

    this.addSql(`
      CREATE TABLE "page_sections" (
        "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
        "page_id"      UUID          NOT NULL,
        "component_id" UUID          NOT NULL,
        "sort_order"   INTEGER       NOT NULL DEFAULT 0,
        "props"        JSONB         NULL DEFAULT '{}',
        "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id")
          REFERENCES "pages" ("id") ON DELETE CASCADE,
        CONSTRAINT "page_sections_component_id_fkey" FOREIGN KEY ("component_id")
          REFERENCES "theme_components" ("id") ON DELETE RESTRICT
      );
    `);

    this.addSql(`CREATE INDEX "page_sections_page_id_idx" ON "page_sections" ("page_id");`);
    this.addSql(
      `CREATE INDEX "page_sections_component_id_idx" ON "page_sections" ("component_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "page_sections";`);
    this.addSql(`DROP TABLE IF EXISTS "pages";`);
  }
}
