import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddFollowStatus1774935111503 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'follows',
            new TableColumn({
                name: 'status',
                type: 'enum',
                enumName: 'follows_status_enum',
                enum: ['ACCEPT', 'REJECT', 'PENDING'],
                default: `'PENDING'`,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('follows', 'status');
        await queryRunner.query(`DROP TYPE "public"."follows_status_enum"`);
    }

}
