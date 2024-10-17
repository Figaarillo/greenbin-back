import { Migration } from '@mikro-orm/migrations';

export class Migration20241015204940 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "green_point_entity" alter column "coordinates" type jsonb using ("coordinates"::jsonb);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "green_point_entity" alter column "coordinates" type varchar(255) using ("coordinates"::varchar(255));');
  }

}
