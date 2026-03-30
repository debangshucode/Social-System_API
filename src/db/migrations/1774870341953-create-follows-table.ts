import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFollowsTable1774870341953 implements MigrationInterface {

     public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.createTable(
                new Table({
                    name: 'follows',
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
                            name: 'follower_id',
                            type: 'int',
                        },
                        {
                            name: 'following_id',
                            type: 'int'
                        }
                    ],
                    foreignKeys: [
                        {
                            columnNames: ['follower_id'],
                            referencedTableName: 'profiles',
                            referencedColumnNames: ['id']
                        },
                        {
                            columnNames: ['following_id'],
                            referencedTableName: 'profiles',
                            referencedColumnNames: ['id']
                        }
                    ]
                })
            )
            await queryRunner.query(`
          CREATE UNIQUE INDEX "unique_active_follow"
          ON "follows" ("follower_id", "following_id")
          WHERE "deleted_at" IS NULL
        `);
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query(`
          DROP INDEX "unique_active_follow"
        `);
    
            await queryRunner.dropTable('follows')
        }

}
