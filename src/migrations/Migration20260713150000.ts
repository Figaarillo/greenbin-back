import { Migration } from '@mikro-orm/migrations';

export class Migration20260713150000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "push_subscriptions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "is_active" boolean not null default true, "recipient_id" varchar(255) not null, "recipient_role" text check ("recipient_role" in ('entity', 'neighbor', 'responsible', 'rewardPartner', 'admin')) not null, "endpoint" text not null, "p256dh" varchar(255) not null, "auth" varchar(255) not null, constraint "push_subscriptions_pkey" primary key ("id"));`);
    this.addSql(`alter table "push_subscriptions" add constraint "push_subscriptions_endpoint_unique" unique ("endpoint");`);
    this.addSql(`create index "push_subscriptions_recipient_id_recipient_role_index" on "push_subscriptions" ("recipient_id", "recipient_role");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "push_subscriptions" cascade;`);
  }

}
