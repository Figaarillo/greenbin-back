import { Migration } from '@mikro-orm/migrations';

export class Migration20241123222220 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "waste_categories" add column "co2" real not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "waste_categories" drop column "co2";');
  }

}
