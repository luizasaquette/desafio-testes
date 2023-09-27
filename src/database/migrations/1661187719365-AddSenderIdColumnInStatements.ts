import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddSenderIdColumnInStatements1661187719365 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn(
        "statements",
        new TableColumn({
          name: "sender_id",
          type: "uuid",
          isNullable: true
        })
      );

      await queryRunner.createForeignKey(
        "statements",
        new TableForeignKey({
          name: "UserStatementFK",
          columnNames: ["sender_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "users",
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        })
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey("statements", "UserStatementFK");

      await queryRunner.dropColumn("statements", "sender_id");
    }
}
