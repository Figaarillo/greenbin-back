import { Migration } from '@mikro-orm/migrations';

export class Migration20260310120943 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "coupon" add column "redemption_code" varchar(6) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "coupon" drop column "redemption_code";');
  }

}
