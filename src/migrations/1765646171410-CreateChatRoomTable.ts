import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChatRoomTable1765646171410 implements MigrationInterface {
    name = 'CreateChatRoomTable1765646171410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f3cc0ca0c4b191410f1e0ab5d21"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD "id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "chatRoomId"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "chatRoomId" integer`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f3cc0ca0c4b191410f1e0ab5d21" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_f3cc0ca0c4b191410f1e0ab5d21"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "chatRoomId"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "chatRoomId" character varying`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e"`);
        await queryRunner.query(`ALTER TABLE "chat_room" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_room" ADD CONSTRAINT "PK_8aa3a52cf74c96469f0ef9fbe3e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_f3cc0ca0c4b191410f1e0ab5d21" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
