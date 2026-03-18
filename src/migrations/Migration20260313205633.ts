import { Migration } from '@mikro-orm/migrations';

export class Migration20260313205633 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "neighbors" add column "deleted_at" timestamptz null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "neighbors" drop column "deleted_at";');
  }

}
