import { Migration } from '@mikro-orm/migrations';

export class Migration20241003022247 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "responsible_entity" add column "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "responsible_entity" drop column "role";');
  }

}
