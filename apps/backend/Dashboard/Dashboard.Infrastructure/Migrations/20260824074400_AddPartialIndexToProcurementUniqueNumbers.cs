using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartialIndexToProcurementUniqueNumbers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS procurement.\"IX_PurchaseRequests_PRNumber\";");
            migrationBuilder.Sql("DROP INDEX IF EXISTS procurement.\"IX_ConsolidatedPRs_CPRNumber\";");
            migrationBuilder.Sql("DROP INDEX IF EXISTS procurement.\"IX_APRs_APRNumber\";");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "PRNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRs_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs",
                column: "CPRNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_APRs_APRNumber",
                schema: "procurement",
                table: "APRs",
                column: "APRNumber",
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS procurement.\"IX_PurchaseRequests_PRNumber\";");
            migrationBuilder.Sql("DROP INDEX IF EXISTS procurement.\"IX_ConsolidatedPRs_CPRNumber\";");
            migrationBuilder.Sql("DROP INDEX IF EXISTS procurement.\"IX_APRs_APRNumber\";");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_PRNumber",
                schema: "procurement",
                table: "PurchaseRequests",
                column: "PRNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsolidatedPRs_CPRNumber",
                schema: "procurement",
                table: "ConsolidatedPRs",
                column: "CPRNumber",
                unique: true);
        }
    }
}
