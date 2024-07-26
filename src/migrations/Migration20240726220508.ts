import { Migration } from '@mikro-orm/migrations'

export class Migration20240726220508 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "responsible_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "dni" int not null, "phone_number" int not null, constraint "responsible_entity_pkey" primary key ("id"));'
    )
    this.addSql(
      'alter table "responsible_entity" add constraint "responsible_entity_username_unique" unique ("username");'
    )
    this.addSql('alter table "responsible_entity" add constraint "responsible_entity_email_unique" unique ("email");')
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "responsible_entity" cascade;')
  }
}
