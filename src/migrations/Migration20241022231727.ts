import { Migration } from '@mikro-orm/migrations';

export class Migration20241022231727 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "entity_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "description" text not null, "password" varchar(255) not null, "city" varchar(255) not null, "province" varchar(255) not null, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, constraint "entity_entity_pkey" primary key ("id"));');
    this.addSql('alter table "entity_entity" add constraint "entity_entity_name_unique" unique ("name");');
    this.addSql('alter table "entity_entity" add constraint "entity_entity_email_unique" unique ("email");');

    this.addSql('create table "green_point_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "description" text not null, "address" varchar(255) not null, "coordinates" jsonb not null, constraint "green_point_entity_pkey" primary key ("id"));');
    this.addSql('alter table "green_point_entity" add constraint "green_point_entity_coordinates_unique" unique ("coordinates");');

    this.addSql('create table "neighbor_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "dni" int not null, "birthdate" timestamptz not null, "phone_number" varchar(255) not null, "points" int not null default 0, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, constraint "neighbor_entity_pkey" primary key ("id"));');
    this.addSql('alter table "neighbor_entity" add constraint "neighbor_entity_username_unique" unique ("username");');
    this.addSql('alter table "neighbor_entity" add constraint "neighbor_entity_email_unique" unique ("email");');

    this.addSql('create table "responsible_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "dni" int not null, "phone_number" varchar(255) not null, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, constraint "responsible_entity_pkey" primary key ("id"));');
    this.addSql('alter table "responsible_entity" add constraint "responsible_entity_username_unique" unique ("username");');
    this.addSql('alter table "responsible_entity" add constraint "responsible_entity_email_unique" unique ("email");');

    this.addSql('create table "reward_partner_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "username" varchar(255) not null, "address" varchar(255) not null, "cuit" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "phone_number" varchar(255) not null, "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null, constraint "reward_partner_entity_pkey" primary key ("id"));');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_name_unique" unique ("name");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_username_unique" unique ("username");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_cuit_unique" unique ("cuit");');
    this.addSql('alter table "reward_partner_entity" add constraint "reward_partner_entity_email_unique" unique ("email");');

    this.addSql('create table "waste_category_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "description" text not null, constraint "waste_category_entity_pkey" primary key ("id"));');
    this.addSql('alter table "waste_category_entity" add constraint "waste_category_entity_name_unique" unique ("name");');
  }

}
