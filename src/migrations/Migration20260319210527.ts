import { Migration } from '@mikro-orm/migrations';

export class Migration20260319210527 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "coupon" add column if not exists "redemption_code" varchar(6) null;');
    this.addSql('alter table "waste_categories" add column if not exists "is_active" boolean not null default true;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "coupon" drop column if exists "redemption_code";');
    this.addSql('alter table "waste_categories" drop column if exists "is_active";');
  }

}