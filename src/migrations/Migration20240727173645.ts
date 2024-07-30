import { Migration } from '@mikro-orm/migrations'

export class Migration20240727173645 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "waste_category_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "description" text not null, constraint "waste_category_entity_pkey" primary key ("id"));'
    )
    this.addSql(
      'alter table "waste_category_entity" add constraint "waste_category_entity_name_unique" unique ("name");'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "waste_category_entity" cascade;')
  }
}
