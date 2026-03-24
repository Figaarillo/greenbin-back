import { Migration } from '@mikro-orm/migrations';

export class Migration20260316133714 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "reward_partner_entity" add column "is_active" boolean not null default true;');
    this.addSql('alter table "neighbors" add column "is_active" boolean not null default true;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "reward_partner_entity" drop column "is_active";');
    this.addSql('alter table "neighbors" drop column "is_active";');
  }

}