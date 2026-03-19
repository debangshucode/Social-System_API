import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1773911163245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name:'users',
                columns:[
                    {
                        name:'id',
                        type:'int',
                        isPrimary:true,
                        isGenerated:true,
                        generationStrategy:'increment'
                    },
                    {
                        name:'email',
                        type:'varchar',
                        isUnique:true,
                    },
                    {
                        name:'password',
                        type:'varchar',
                    },
                    {
                        name:'first_name',
                        type:'varchar',
                    },
                    {
                        name:'last_name',
                        type:'varchar',
                    },
                    {
                        name:'phone_number',
                        type:'varchar',
                        length:'10',
                    },
                    {
                        name:'role',
                        type:'enum',
                        enum:['ADMIN','USER'],
                        default:"'USER'"
                    },
                    {
                        name:'created_at',
                        type:'timestamp',
                        default:'now()'
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users')
    }

}
