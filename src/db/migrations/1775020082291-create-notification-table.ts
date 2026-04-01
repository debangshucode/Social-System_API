import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNotificationTable1775020082291 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'notifications',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: 'receiver_id',
                        type: 'int'
                    },
                    {
                        name: 'sender_id',
                        type: 'int',
                    }, {
                        name: 'post_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'message',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enumName: 'notification_type',
                        enum: ['LIKE', 'COMMENT', 'FOLLOW_REQ', 'FOLLOW_ACP']
                    },
                    {
                        name: 'is_read',
                        type: 'boolean',
                        default: 'false'
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
                        isNullable: true
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['receiver_id'],
                        referencedTableName: 'profiles',
                        referencedColumnNames: ['id']
                    },
                    {
                        columnNames: ['sender_id'],
                        referencedTableName: 'profiles',
                        referencedColumnNames: ['id']
                    },
                    {
                        columnNames:['post_id'],
                        referencedTableName:'posts',
                        referencedColumnNames:['id']
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('notifications')
    }

}
