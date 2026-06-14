import { Migration } from '@mikro-orm/migrations';

export class Migration20260616000001_navigation extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "menu_items" (
        "id"         UUID          NOT NULL DEFAULT gen_random_uuid(),
        "site_id"    UUID          NOT NULL,
        "label"      VARCHAR(255)  NOT NULL,
        "url"        VARCHAR(2048) NOT NULL,
        "parent_id"  UUID          NULL,
        "sort_order" INTEGER       NOT NULL DEFAULT 0,
        "menu_name"  VARCHAR(50)   NOT NULL DEFAULT 'header',
        "created_at" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "menu_items_site_id_fkey" FOREIGN KEY ("site_id")
          REFERENCES "sites" ("id") ON DELETE CASCADE,
        CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id")
          REFERENCES "menu_items" ("id") ON DELETE CASCADE
      );
    `);

    this.addSql(`CREATE INDEX "menu_items_site_id_idx" ON "menu_items" ("site_id");`);
    this.addSql(`CREATE INDEX "menu_items_parent_id_idx" ON "menu_items" ("parent_id");`);
    this.addSql(`CREATE INDEX "menu_items_menu_name_idx" ON "menu_items" ("menu_name");`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "menu_items";`);
  }
}
