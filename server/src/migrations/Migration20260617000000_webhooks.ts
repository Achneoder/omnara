import { Migration } from '@mikro-orm/migrations';

export class Migration20260617000000_webhooks extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE "webhooks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "site_id" uuid NOT NULL,
        "url" varchar NOT NULL,
        "secret" varchar NOT NULL,
        "event_types" jsonb NOT NULL DEFAULT '[]',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql(`
      ALTER TABLE "webhooks"
        ADD CONSTRAINT "webhooks_site_id_fkey"
        FOREIGN KEY ("site_id") REFERENCES "sites" ("id") ON DELETE CASCADE;
    `);

    this.addSql(`CREATE INDEX "webhooks_site_id_index" ON "webhooks" ("site_id");`);

    this.addSql(`
      CREATE TABLE "webhook_deliveries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "webhook_id" uuid NOT NULL,
        "event" varchar NOT NULL,
        "payload" jsonb NOT NULL DEFAULT '{}',
        "status_code" int NULL,
        "response_body" text NULL,
        "attempts" int NOT NULL DEFAULT 0,
        "success" boolean NOT NULL DEFAULT false,
        "delivered_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql(`
      ALTER TABLE "webhook_deliveries"
        ADD CONSTRAINT "webhook_deliveries_webhook_id_fkey"
        FOREIGN KEY ("webhook_id") REFERENCES "webhooks" ("id") ON DELETE CASCADE;
    `);

    this.addSql(
      `CREATE INDEX "webhook_deliveries_webhook_id_index" ON "webhook_deliveries" ("webhook_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "webhook_deliveries";`);
    this.addSql(`DROP TABLE IF EXISTS "webhooks";`);
  }
}
