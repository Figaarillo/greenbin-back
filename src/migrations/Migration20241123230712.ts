import { Migration } from '@mikro-orm/migrations';

export class Migration20241123230712 extends Migration {
  async up(): Promise<void> {
    // Verificar y eliminar constraints solo si existen
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'green_point_entity_entity_id_foreign'
            AND table_name = 'green_point_entity'
        ) THEN
          ALTER TABLE "green_point_entity" DROP CONSTRAINT "green_point_entity_entity_id_foreign";
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'neighbor_entity_entity_id_foreign'
            AND table_name = 'neighbor_entity'
        ) THEN
          ALTER TABLE "neighbor_entity" DROP CONSTRAINT "neighbor_entity_entity_id_foreign";
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'responsible_entity_entity_id_foreign'
            AND table_name = 'responsible_entity'
        ) THEN
          ALTER TABLE "responsible_entity" DROP CONSTRAINT "responsible_entity_entity_id_foreign";
        END IF;
      END $$;
    `);

    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'reward_partner_entity_entity_id_foreign'
            AND table_name = 'reward_partner_entity'
        ) THEN
          ALTER TABLE "reward_partner_entity" DROP CONSTRAINT "reward_partner_entity_entity_id_foreign";
        END IF;
      END $$;
    `);

    // Crear nueva tabla entities
    this.addSql(`
      CREATE TABLE "entities" (
        "id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL,
        "updated_at" timestamptz NOT NULL,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "password" varchar(255) NOT NULL,
        "city" varchar(255) NOT NULL,
        "province" varchar(255) NOT NULL,
        "coordinates" jsonb NOT NULL,
        "role" text CHECK ("role" IN ('entity', 'neighbor', 'responsible', 'rewardPartner', 'admin')) NOT NULL,
        CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
      );
    `);

    this.addSql('ALTER TABLE "entities" ADD CONSTRAINT "entities_name_unique" UNIQUE ("name");');
    this.addSql('ALTER TABLE "entities" ADD CONSTRAINT "entities_email_unique" UNIQUE ("email");');
    this.addSql('ALTER TABLE "entities" ADD CONSTRAINT "entities_coordinates_unique" UNIQUE ("coordinates");');

    // Eliminar tabla entity_entity si existe
    this.addSql('DROP TABLE IF EXISTS "entity_entity" CASCADE;');

    // Restaurar o agregar nuevas constraints
    this.addSql(`
      ALTER TABLE "green_point_entity"
      ADD CONSTRAINT "green_point_entity_entity_id_foreign"
      FOREIGN KEY ("entity_id") REFERENCES "entities" ("id") ON UPDATE CASCADE;
    `);

    // Similar para otras tablas si es necesario...
  }
}
