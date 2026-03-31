import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddPostMediaColumns1774942214773 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns(
            'posts',
            [
                new TableColumn({
                    name: 'media_path',
                    type: 'varchar',
                    isNullable: true
                }),
                new TableColumn({
                    name: 'media_type',
                    type: 'enum',
                    enumName: 'media_type',
                    enum: ['IMAGE', 'VIDEO'],
                    isNullable: true
                }),
                new TableColumn({
                    name: 'media_mime',
                    type: 'varchar',
                    isNullable: true
                }),
            ]
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('posts', 'media_mime');
        await queryRunner.dropColumn('posts', 'media_type');
        await queryRunner.dropColumn('posts', 'media_path');
        await queryRunner.query(`DROP TYPE "public"."posts_media_type_enum"`);
    }


}
