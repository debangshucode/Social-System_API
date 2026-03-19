import { Table, MigrationInterface, QueryRunner } from "typeorm";

export class CreateLikeTable1773911272820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'likes',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'profile_id',
                        type: 'int',
                    },
                    {
                        name: 'post_id',
                        type: 'int'
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ['profile_id'],
                        referencedTableName: 'profiles',
                        referencedColumnNames: ['id']
                    },
                    {
                        columnNames: ['post_id'],
                        referencedTableName: 'posts',
                        referencedColumnNames: ['id']
                    }
                ]
            })
        )
        await queryRunner.query(`
      CREATE UNIQUE INDEX "unique_active_like"
      ON "likes" ("profile_id", "post_id")
      WHERE "deleted_at" IS NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP INDEX "unique_active_like"
    `);

        await queryRunner.dropTable('likes')
    }

}
