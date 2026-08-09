import { Migration } from '@mikro-orm/migrations';

export class Migration20260712135759 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "notifications" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "is_active" boolean not null default true, "recipient_id" varchar(255) not null, "recipient_role" text check ("recipient_role" in ('entity', 'neighbor', 'responsible', 'rewardPartner', 'admin')) not null, "category" text check ("category" in ('COUPON_PURCHASED', 'COUPON_REDEEMED', 'COUPON_CREATED', 'POINTS_DELIVERED')) not null, "title" varchar(255) not null, "body" text not null, "read_at" timestamptz null, constraint "notifications_pkey" primary key ("id"));`);
    this.addSql(`create index "notifications_recipient_id_recipient_role_index" on "notifications" ("recipient_id", "recipient_role");`);

    this.addSql(`create table "notification_preferences" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "is_active" boolean not null default true, "recipient_id" varchar(255) not null, "recipient_role" text check ("recipient_role" in ('entity', 'neighbor', 'responsible', 'rewardPartner', 'admin')) not null, "coupon_purchased" boolean not null default true, "coupon_redeemed" boolean not null default true, "coupon_created" boolean not null default true, "points_delivered" boolean not null default true, constraint "notification_preferences_pkey" primary key ("id"));`);
    this.addSql(`alter table "notification_preferences" add constraint "notification_preferences_recipient_id_recipient_role_unique" unique ("recipient_id", "recipient_role");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notifications" cascade;`);
    this.addSql(`drop table if exists "notification_preferences" cascade;`);
  }

}
