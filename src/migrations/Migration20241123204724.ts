import { Migration } from '@mikro-orm/migrations';

export class Migration20241123204724 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wastes" alter column "weight" type real using ("weight"::real);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wastes" alter column "weight" type int using ("weight"::int);');
  }

}
