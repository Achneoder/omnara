import { Migration } from '@mikro-orm/migrations';

// Phase 1 migration already created individual indexes on site_id, content_type_id,
// and status columns. This migration adds composite indexes for the query patterns
// introduced in Phase 3: filtering entries by (site + status) and (site + content_type),
// and filtering activity logs by (site + date).
export class Migration20260614000001_phase3_indexes extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE INDEX "content_entries_site_id_status_idx"
        ON "content_entries" ("site_id", "status");
    `);

    this.addSql(`
      CREATE INDEX "content_entries_site_id_content_type_id_idx"
        ON "content_entries" ("site_id", "content_type_id");
    `);

    this.addSql(`
      CREATE INDEX "activity_logs_site_id_created_at_idx"
        ON "activity_logs" ("site_id", "created_at");
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "content_entries_site_id_status_idx";`);
    this.addSql(`DROP INDEX IF EXISTS "content_entries_site_id_content_type_id_idx";`);
    this.addSql(`DROP INDEX IF EXISTS "activity_logs_site_id_created_at_idx";`);
  }
}
