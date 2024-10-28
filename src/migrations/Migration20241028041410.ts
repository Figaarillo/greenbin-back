import { Migration } from '@mikro-orm/migrations';

export class Migration20241028041410 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "green_point_entity" add column "mail" varchar(255) not null, add column "phone_number" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "green_point_entity" drop column "mail", drop column "phone_number";');
  }

}
