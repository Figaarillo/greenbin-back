import { Migration } from '@mikro-orm/migrations';

export class Migration20241125054552 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "coupon" add column "state" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "coupon" drop column "state";');
  }

}
