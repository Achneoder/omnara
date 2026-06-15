import { Migration } from '@mikro-orm/migrations';

export class Migration20260618000000_api_keys_drop_site extends Migration {
  async up(): Promise<void> {
    this.addSql(`ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "site_id";`);
  }

  async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE "api_keys" ADD COLUMN "site_id" uuid REFERENCES "sites"("id") ON DELETE CASCADE;`,
    );
  }
}
