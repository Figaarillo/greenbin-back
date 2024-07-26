import { Migration } from '@mikro-orm/migrations'

export class Migration20240726230213 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "responsible_entity" alter column "phone_number" type varchar(255) using ("phone_number"::varchar(255));'
    )
  }

  async down(): Promise<void> {
    this.addSql('alter table "responsible_entity" alter column "phone_number" type int using ("phone_number"::int);')
  }
}
