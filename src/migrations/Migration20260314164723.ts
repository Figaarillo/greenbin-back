import { Migration } from '@mikro-orm/migrations';

export class Migration20260314164723 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "neighbors" add column if not exists "is_active" boolean not null default true;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "neighbors" drop column if exists "is_active";');
  }

}
