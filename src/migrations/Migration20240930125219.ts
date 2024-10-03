import { Migration } from '@mikro-orm/migrations';

export class Migration20240930125219 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "neighbor_entity" add column "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "neighbor_entity" drop column "role";');
  }

}
