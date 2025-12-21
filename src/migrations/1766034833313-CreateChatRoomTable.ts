import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChatRoomTable1766034833313 implements MigrationInterface {
    name = 'CreateChatRoomTable1766034833313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "FK_39222595c4f3159bee77a4c8566"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "FK_b8edc3fcacee985a6d7dddca792"`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "UQ_39222595c4f3159bee77a4c8566" UNIQUE ("firstUserId")`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "UQ_b8edc3fcacee985a6d7dddca792" UNIQUE ("secondUserId")`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "FK_39222595c4f3159bee77a4c8566" FOREIGN KEY ("firstUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "FK_b8edc3fcacee985a6d7dddca792" FOREIGN KEY ("secondUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "FK_b8edc3fcacee985a6d7dddca792"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "FK_39222595c4f3159bee77a4c8566"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "UQ_b8edc3fcacee985a6d7dddca792"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "UQ_39222595c4f3159bee77a4c8566"`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "FK_b8edc3fcacee985a6d7dddca792" FOREIGN KEY ("secondUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "FK_39222595c4f3159bee77a4c8566" FOREIGN KEY ("firstUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
