import { Migration } from '@mikro-orm/migrations';

export class Migration20241125051738 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "coupon_transactions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "code" varchar(255) not null, "status" varchar(255) not null, "adquisition_date" timestamptz null, "redeem_date" timestamptz null, "expiration_date" timestamptz not null, "cost_in_points" int not null, "coupon_id" uuid not null, "neighbor_id" uuid not null, "reward_partner_id" uuid not null, constraint "coupon_transactions_pkey" primary key ("id"));');
    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_coupon_id_unique" unique ("coupon_id");');

    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_coupon_id_foreign" foreign key ("coupon_id") references "coupon" ("id") on update cascade;');
    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_neighbor_id_foreign" foreign key ("neighbor_id") references "neighbor_entity" ("id") on update cascade;');
    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_reward_partner_id_foreign" foreign key ("reward_partner_id") references "reward_partner_entity" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "coupon_transactions" cascade;');
  }

}
