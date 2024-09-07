import { Migration } from '@mikro-orm/migrations'

export class Migration20240907004017 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "reward_partner_entity" alter column "cuit" type varchar(255) using ("cuit"::varchar(255));'
    )
  }

  async down(): Promise<void> {
    this.addSql('alter table "reward_partner_entity" alter column "cuit" type int using ("cuit"::int);')
  }
}
