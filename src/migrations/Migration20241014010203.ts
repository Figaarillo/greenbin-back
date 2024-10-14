import { Migration } from '@mikro-orm/migrations';

export class Migration20241014010203 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "green_point_entity" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "description" text not null, "address" varchar(255) not null, "coordinates" varchar(255) not null, constraint "green_point_entity_pkey" primary key ("id"));');
    this.addSql('alter table "green_point_entity" add constraint "green_point_entity_coordinates_unique" unique ("coordinates");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "green_point_entity" cascade;');
  }

}
