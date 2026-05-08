import { Migration } from '@mikro-orm/migrations';

export class Migration20241215162435 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "entities" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "description" text not null, "password" varchar(255) not null, "city" varchar(255) not null, "province" varchar(255) not null, "coordinates" jsonb not null, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, constraint "entities_pkey" primary key ("id"));');
    this.addSql('alter table "entities" add constraint "entities_name_unique" unique ("name");');
    this.addSql('alter table "entities" add constraint "entities_email_unique" unique ("email");');
    this.addSql('alter table "entities" add constraint "entities_coordinates_unique" unique ("coordinates");');

    this.addSql('create table "green_point_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "phone_number" varchar(255) not null, "description" text not null, "address" varchar(255) not null, "coordinates" jsonb not null, "entity_id" uuid not null, constraint "green_point_entity_pkey" primary key ("id"));');
    this.addSql('alter table "green_point_entity" add constraint "green_point_entity_coordinates_unique" unique ("coordinates");');

    this.addSql('create table "neighbors" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "dni" int not null, "birthdate" timestamptz not null, "phone_number" varchar(255) not null, "points" int not null default 0, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, "entity_id" uuid not null, constraint "neighbors_pkey" primary key ("id"));');
    this.addSql('alter table "neighbors" add constraint "neighbors_username_unique" unique ("username");');
    this.addSql('alter table "neighbors" add constraint "neighbors_email_unique" unique ("email");');

    this.addSql('create table "responsible_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "dni" int not null, "phone_number" varchar(255) not null, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, "entity_id" uuid not null, constraint "responsible_entity_pkey" primary key ("id"));');
    this.addSql('alter table "responsible_entity" add constraint "responsible_entity_username_unique" unique ("username");');
    this.addSql('alter table "responsible_entity" add constraint "responsible_entity_email_unique" unique ("email");');

    this.addSql('create table "reward_partner_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "username" varchar(255) not null, "address" varchar(255) not null, "cuit" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "phone_number" varchar(255) not null, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, "coordinates" jsonb not null, "entity_id" uuid not null, constraint "reward_partner_entity_pkey" primary key ("id"));');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_name_unique" unique ("name");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_username_unique" unique ("username");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_cuit_unique" unique ("cuit");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_email_unique" unique ("email");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_coordinates_unique" unique ("coordinates");');

    this.addSql('create table "coupon" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "description" varchar(255) not null, "discount" int not null, "is_available" boolean not null, "state" varchar(255) not null, "valid_days" int not null, "cost_in_points" int not null, "reward_partner_id" uuid not null, constraint "coupon_pkey" primary key ("id"));');

    this.addSql('create table "coupon_transactions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "code" varchar(255) not null, "status" varchar(255) not null, "adquisition_date" timestamptz null, "redeem_date" timestamptz null, "expiration_date" timestamptz not null, "cost_in_points" int not null, "coupon_id" uuid not null, "neighbor_id" uuid not null, "reward_partner_id" uuid not null, constraint "coupon_transactions_pkey" primary key ("id"));');
    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_coupon_id_unique" unique ("coupon_id");');

    this.addSql('create table "waste_categories" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "points_per_weight" int not null, "description" text not null, "co2" real not null, constraint "waste_categories_pkey" primary key ("id"));');
    this.addSql('alter table "waste_categories" add constraint "waste_categories_name_unique" unique ("name");');

    this.addSql('create table "wastes" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "category_id" uuid not null, "points" int not null default 0, "weight" real not null, "points_per_weight" int not null, constraint "wastes_pkey" primary key ("id"));');

    this.addSql('create table "neighbors_wastes" ("neighbor_entity_id" uuid not null, "waste_entity_id" uuid not null, constraint "neighbors_wastes_pkey" primary key ("neighbor_entity_id", "waste_entity_id"));');

    this.addSql('create table "wastes_neighbors" ("waste_entity_id" uuid not null, "neighbor_entity_id" uuid not null, constraint "wastes_neighbors_pkey" primary key ("waste_entity_id", "neighbor_entity_id"));');

    this.addSql('create table "wastes_transactions" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "responsible_id" uuid not null, "neighbor_id" uuid not null, "green_point_id" uuid not null, "total_points" int not null default 0, "date" timestamptz not null, constraint "wastes_transactions_pkey" primary key ("id"));');

    this.addSql('create table "wastes_transactions_details" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "waste_id" uuid not null, "points_per_weight" int not null default 0, "weight" int not null default 0, "points" int not null default 0, "transaction_id" uuid not null, constraint "wastes_transactions_details_pkey" primary key ("id"));');

    this.addSql('alter table "green_point_entity" add constraint "green_point_entity_entity_id_foreign" foreign key ("entity_id") references "entities" ("id") on update cascade;');

    this.addSql('alter table "neighbors" add constraint "neighbors_entity_id_foreign" foreign key ("entity_id") references "entities" ("id") on update cascade;');

    this.addSql('alter table "responsible_entity" add constraint "responsible_entity_entity_id_foreign" foreign key ("entity_id") references "entities" ("id") on update cascade;');

    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_entity_id_foreign" foreign key ("entity_id") references "entities" ("id") on update cascade;');

    this.addSql('alter table "coupon" add constraint "coupon_reward_partner_id_foreign" foreign key ("reward_partner_id") references "reward_partner_entity" ("id") on update cascade;');

    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_coupon_id_foreign" foreign key ("coupon_id") references "coupon" ("id") on update cascade;');
    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_neighbor_id_foreign" foreign key ("neighbor_id") references "neighbors" ("id") on update cascade;');
    this.addSql('alter table "coupon_transactions" add constraint "coupon_transactions_reward_partner_id_foreign" foreign key ("reward_partner_id") references "reward_partner_entity" ("id") on update cascade;');

    this.addSql('alter table "wastes" add constraint "wastes_category_id_foreign" foreign key ("category_id") references "waste_categories" ("id") on update cascade;');

    this.addSql('alter table "neighbors_wastes" add constraint "neighbors_wastes_neighbor_entity_id_foreign" foreign key ("neighbor_entity_id") references "neighbors" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "neighbors_wastes" add constraint "neighbors_wastes_waste_entity_id_foreign" foreign key ("waste_entity_id") references "wastes" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "wastes_neighbors" add constraint "wastes_neighbors_waste_entity_id_foreign" foreign key ("waste_entity_id") references "wastes" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "wastes_neighbors" add constraint "wastes_neighbors_neighbor_entity_id_foreign" foreign key ("neighbor_entity_id") references "neighbors" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "wastes_transactions" add constraint "wastes_transactions_responsible_id_foreign" foreign key ("responsible_id") references "responsible_entity" ("id") on update cascade;');
    this.addSql('alter table "wastes_transactions" add constraint "wastes_transactions_neighbor_id_foreign" foreign key ("neighbor_id") references "neighbors" ("id") on update cascade;');
    this.addSql('alter table "wastes_transactions" add constraint "wastes_transactions_green_point_id_foreign" foreign key ("green_point_id") references "green_point_entity" ("id") on update cascade;');

    this.addSql('alter table "wastes_transactions_details" add constraint "wastes_transactions_details_waste_id_foreign" foreign key ("waste_id") references "wastes" ("id") on update cascade;');
    this.addSql('alter table "wastes_transactions_details" add constraint "wastes_transactions_details_transaction_id_foreign" foreign key ("transaction_id") references "wastes_transactions" ("id") on update cascade;');
  }

}
