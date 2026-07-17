import { Migration } from '@mikro-orm/migrations';

export class Migration20260717130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "notification_preferences" add column "coupon_expiring_soon" boolean not null default true;`);
    this.addSql(`alter table "coupon_transactions" add column "expiration_notified_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "notification_preferences" drop column "coupon_expiring_soon";`);
    this.addSql(`alter table "coupon_transactions" drop column "expiration_notified_at";`);
  }

}
