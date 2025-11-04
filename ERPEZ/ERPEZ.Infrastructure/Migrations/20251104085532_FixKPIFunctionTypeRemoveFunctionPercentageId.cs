using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixKPIFunctionTypeRemoveFunctionPercentageId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_KPIs_FunctionPercentageAllocationId_Name",
                schema: "catalog",
                table: "KPIs");

            migrationBuilder.DropColumn(
                name: "FunctionPercentageAllocationId",
                schema: "catalog",
                table: "KPIs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FunctionPercentageAllocationId",
                schema: "catalog",
                table: "KPIs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_KPIs_FunctionPercentageAllocationId_Name",
                schema: "catalog",
                table: "KPIs",
                columns: new[] { "FunctionPercentageAllocationId", "Name" });
        }
    }
}
