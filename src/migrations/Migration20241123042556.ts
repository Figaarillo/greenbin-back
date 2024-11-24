import { Migration } from '@mikro-orm/migrations';

export class Migration20241123042556 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "coupon" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "description" varchar(255) not null, "discount" int not null, "is_available" boolean not null, "valid_days" int not null, "cost_in_points" int not null, "reward_partner_id" uuid not null, constraint "coupon_pkey" primary key ("id"));');

    this.addSql('alter table "coupon" add constraint "coupon_reward_partner_id_foreign" foreign key ("reward_partner_id") references "reward_partner_entity" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "coupon" cascade;');
  }

}
