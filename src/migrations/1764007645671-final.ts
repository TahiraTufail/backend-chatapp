import { MigrationInterface, QueryRunner } from "typeorm";

export class Final1764007645671 implements MigrationInterface {
    name = 'Final1764007645671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "discription" TO "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "description" TO "discription"`);
    }

}
