import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChatRoomTable1766245271925 implements MigrationInterface {
    name = 'CreateChatRoomTable1766245271925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" ADD "content" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "content"`);
    }

}
