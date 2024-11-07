import { Migration } from '@mikro-orm/migrations';

export class Migration20241028041903 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "green_point_entity" rename column "mail" to "email";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "green_point_entity" rename column "email" to "mail";');
  }

}
