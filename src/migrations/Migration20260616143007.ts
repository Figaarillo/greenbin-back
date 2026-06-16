import { Migration } from '@mikro-orm/migrations';

export class Migration20260616143007 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "entities" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "green_point_entity" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "responsible_entity" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "coupon" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "coupon_transactions" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "wastes" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "wastes_transactions" add column if not exists "is_active" boolean not null default true;');

    this.addSql('alter table "wastes_transactions_details" add column if not exists "is_active" boolean not null default true;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "entities" drop column if exists "is_active";');

    this.addSql('alter table "green_point_entity" drop column if exists "is_active";');

    this.addSql('alter table "responsible_entity" drop column if exists "is_active";');

    this.addSql('alter table "coupon" drop column if exists "is_active";');

    this.addSql('alter table "coupon_transactions" drop column if exists "is_active";');

    this.addSql('alter table "wastes" drop column if exists "is_active";');

    this.addSql('alter table "wastes_transactions" drop column if exists "is_active";');

    this.addSql('alter table "wastes_transactions_details" drop column if exists "is_active";');
  }

}
