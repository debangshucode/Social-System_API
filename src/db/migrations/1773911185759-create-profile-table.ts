import { Table, MigrationInterface, QueryRunner } from "typeorm";

export class CreateProfileTable1773911185759 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name:'profiles',
                columns:[
                    {
                        name:'id',
                        type:'int',
                        isPrimary:true,
                        isGenerated:true,
                        generationStrategy:'increment'
                    },
                    {
                        name:'user_name',
                        type:'varchar',
                        isUnique:true,
                    },
                    {
                        name:'bio',
                        type:'text',
                    },
                    {
                        name:'avatar_url',
                        type:'varchar'
                    },
                    {
                        name:'created_at',
                        type:'timestamp',
                        default:'now()'
                    },
                    {
                        name:'deleted_at',
                        type:'timestamp',
                        isNullable:true
                    },
                    {
                        name:'updated_at',
                        type:'timestamp',
                        default:'now()',
                        onUpdate:'CURRENT_TIMESTAMP'
                    },
                    {
                        name:'user_id',
                        type:'int',
                        isUnique:true,
                    }
                ],
                foreignKeys:[
                    {
                        columnNames:['user_id'],
                        referencedTableName:'users',
                        referencedColumnNames:['id'],
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('profiles')
    }

}
