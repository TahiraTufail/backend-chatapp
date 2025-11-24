import { MigrationInterface, QueryRunner } from "typeorm";

export class Final1764004559015 implements MigrationInterface {
    name = 'Final1764004559015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "discription" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "discription"`);
    }

}
