import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContactTable11764363408261 implements MigrationInterface {
    name = 'CreateContactTable11764363408261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."contact_status_enum" AS ENUM('active', 'blocked', 'removed')`);
        await queryRunner.query(`CREATE TABLE "contact" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "phoneNumber" character varying NOT NULL, "contactUserId" integer, "status" "public"."contact_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_e7e34fa8e409e9146f4729fd0cb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contact" ADD CONSTRAINT "FK_d76aaf2d35498425d419f3f8e33" FOREIGN KEY ("contactUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_d76aaf2d35498425d419f3f8e33"`);
        await queryRunner.query(`ALTER TABLE "contact" DROP CONSTRAINT "FK_e7e34fa8e409e9146f4729fd0cb"`);
        await queryRunner.query(`DROP TABLE "contact"`);
        await queryRunner.query(`DROP TYPE "public"."contact_status_enum"`);
    }

}
