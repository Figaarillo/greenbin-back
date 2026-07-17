import { Migration } from '@mikro-orm/migrations';

export class Migration20260717120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "notification_preferences" add column "email_enabled" boolean not null default true;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "notification_preferences" drop column "email_enabled";`);
  }

}
