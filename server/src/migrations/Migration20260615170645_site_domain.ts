import { Migration } from '@mikro-orm/migrations';

export class Migration20260615170645 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(`alter table "sites" add column "domain" varchar(253) null;`);
    this.addSql(`alter table "sites" add constraint "sites_domain_unique" unique ("domain");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "sites" drop constraint "sites_domain_unique";`);
    this.addSql(`alter table "sites" drop column "domain";`);
  }
}
