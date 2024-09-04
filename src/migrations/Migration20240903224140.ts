import { Migration } from '@mikro-orm/migrations'

export class Migration20240903224140 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "neighbor_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "dni" int not null, "birthdate" timestamptz not null, "phone_number" varchar(255) not null, "points" int not null default 0, constraint "neighbor_entity_pkey" primary key ("id"));'
    )
    this.addSql('alter table "neighbor_entity" add constraint "neighbor_entity_username_unique" unique ("username");')
    this.addSql('alter table "neighbor_entity" add constraint "neighbor_entity_email_unique" unique ("email");')
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "neighbor_entity" cascade;')
  }
}
