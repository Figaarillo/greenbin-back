import { Migration } from '@mikro-orm/migrations';

export class Migration20260324153101 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "neighbors" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "reward_partner_entity" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "coupon" add column if not exists "redemption_code" varchar(6) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "neighbors" drop column if exists "is_active";');

    this.addSql('alter table "reward_partner_entity" drop column if exists "is_active";');

    this.addSql('alter table "coupon" drop column if exists "redemption_code";');
  }

}
