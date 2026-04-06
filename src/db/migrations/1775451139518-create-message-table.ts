import { message_status } from "src/messages/entities/message.entity";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMessageTable1775451139518 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'messages',
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
                    },
                    {
                        name: 'content',
                        type: 'text',
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enumName: 'message_status',
                        enum: ['PENDING', 'SENT', 'FAILED'],
                        default:"'PENDING'"
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
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('messages')
    }

}
