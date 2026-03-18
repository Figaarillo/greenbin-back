import { Migration } from '@mikro-orm/migrations';

export class Migration20260314164723 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "neighbors" drop column "deleted_at";');

    this.addSql('alter table "neighbors" add column "is_active" boolean not null default true;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "neighbors" drop column "is_active";');

    this.addSql('alter table "neighbors" add column "deleted_at" timestamptz null;');
  }

}
