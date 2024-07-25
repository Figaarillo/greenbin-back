import { Migration } from '@mikro-orm/migrations'

export class Migration20240724233829 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "entity_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "description" text not null, "password" varchar(255) not null, "city" varchar(255) not null, "province" varchar(255) not null, constraint "entity_entity_pkey" primary key ("id"));'
    )
    this.addSql('alter table "entity_entity" add constraint "entity_entity_name_unique" unique ("name");')
  }
}
