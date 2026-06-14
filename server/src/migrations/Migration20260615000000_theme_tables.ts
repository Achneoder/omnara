import { Migration } from '@mikro-orm/migrations';

export class Migration20260615000000_theme_tables extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "site_themes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "site_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "version" varchar(255) NOT NULL,
        "tokens" jsonb NOT NULL DEFAULT '{}',
        "raw_css" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "site_themes_pkey" PRIMARY KEY ("id")
      );
    `);
    this.addSql(`
      ALTER TABLE "site_themes"
        ADD CONSTRAINT "site_themes_site_id_unique" UNIQUE ("site_id");
      ALTER TABLE "site_themes"
        ADD CONSTRAINT "site_themes_site_id_fkey"
        FOREIGN KEY ("site_id") REFERENCES "sites" ("id") ON DELETE CASCADE;
      CREATE INDEX "site_themes_site_id_idx" ON "site_themes" ("site_id");
    `);
    this.addSql(`
      CREATE TYPE "component_category" AS ENUM ('layout','hero','card','article','product','media','cta','nav','footer','misc');
      CREATE TABLE "theme_components" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "theme_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "category" "component_category" NOT NULL,
        "template" text NOT NULL,
        "css" text NULL,
        "props_schema" jsonb NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "theme_components_pkey" PRIMARY KEY ("id")
      );
    `);
    this.addSql(`
      ALTER TABLE "theme_components"
        ADD CONSTRAINT "theme_components_theme_id_slug_unique" UNIQUE ("theme_id", "slug");
      ALTER TABLE "theme_components"
        ADD CONSTRAINT "theme_components_theme_id_fkey"
        FOREIGN KEY ("theme_id") REFERENCES "site_themes" ("id") ON DELETE CASCADE;
      CREATE INDEX "theme_components_theme_id_idx" ON "theme_components" ("theme_id");
    `);
    this.addSql(`
      ALTER TABLE "content_types"
        ADD COLUMN "component_id" uuid NULL;
      ALTER TABLE "content_types"
        ADD CONSTRAINT "content_types_component_id_fkey"
        FOREIGN KEY ("component_id") REFERENCES "theme_components" ("id") ON DELETE SET NULL;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "content_types" DROP COLUMN IF EXISTS "component_id";`);
    this.addSql(`DROP TABLE IF EXISTS "theme_components";`);
    this.addSql(`DROP TYPE IF EXISTS "component_category";`);
    this.addSql(`DROP TABLE IF EXISTS "site_themes";`);
  }
}
