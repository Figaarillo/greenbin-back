import { Migration } from '@mikro-orm/migrations';

export class Migration20260804170000 extends Migration {

  override async up(): Promise<void> {
    // Este UNIQUE lo generó un @OneToOne mal puesto en CouponTransactionEntity:
    // limitaba cada cupón a un único canje en TODA la app, para siempre. La regla
    // real (un canje ADQUIRIDO por vecino) la aplica RedeemCouponUseCase.
    this.addSql(`alter table "coupon_transactions" drop constraint if exists "coupon_transactions_coupon_id_unique";`);
  }

  override async down(): Promise<void> {
    // Ojo: revertir solo funciona si no se acumularon canjes repetidos del mismo
    // cupón mientras el constraint no estuvo.
    this.addSql(`alter table "coupon_transactions" add constraint "coupon_transactions_coupon_id_unique" unique ("coupon_id");`);
  }

}
