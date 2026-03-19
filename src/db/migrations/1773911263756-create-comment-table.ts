import { Table, MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentTable1773911263756 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'comments',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: 'content',
                        type: 'text',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                        onUpdate: 'CURRENT_TIMESTAMP'
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
                        type: 'int',
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('comments')
    }

}
