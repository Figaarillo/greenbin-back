import { Migration } from '@mikro-orm/migrations';

export class Migration20241004021431 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "entity_entity" add column "email" varchar(255) not null, add column "role" text check ("role" in (\'entity\', \'neighbor\', \'responsible\', \'rewardPartner\', \'admin\')) not null;');
    this.addSql('alter table "entity_entity" add constraint "entity_entity_email_unique" unique ("email");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "entity_entity" drop constraint "entity_entity_email_unique";');
    this.addSql('alter table "entity_entity" drop column "email", drop column "role";');
  }

}
