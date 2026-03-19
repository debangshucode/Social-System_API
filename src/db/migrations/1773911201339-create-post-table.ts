import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePostTable1773911201339 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'posts',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name:'content',
                        type:'text',
                    },
                    {
                        name:'created_at',
                        type:'timestamp',
                        default:'now()'
                    },
                    {
                        name:'updated_at',
                        type:'timestamp',
                        default:'now()',
                        onUpdate:'CURRENT_TIMESTAMP'
                    },
                    {
                        name:'deleted_at',
                        type:'timestamp',
                        isNullable:true,
                    },
                    {
                        name:'profile_id',
                        type:'int',
                    }
                ],
                foreignKeys:[
                    {
                        columnNames:['profile_id'],
                        referencedTableName:'profiles',
                        referencedColumnNames:['id']
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('posts')
    }

}
