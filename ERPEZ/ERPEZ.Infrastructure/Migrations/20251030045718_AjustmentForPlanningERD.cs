using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjustmentForPlanningERD : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.DropForeignKey(
                name: "FK_KPIs_FunctionPercentageAllocations_FunctionPercentageAlloca~",
                schema: "catalog",
                table: "KPIs");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropTable(
                name: "Products",
                schema: "catalog");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_DeliveryUnitId",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_DUAllocationId_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPObjectives_WFPId",
                schema: "catalog",
                table: "WFPObjectives");

            migrationBuilder.DropIndex(
                name: "IX_WFPActivities_WFPId",
                schema: "catalog",
                table: "WFPActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DeliveryUnitId",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DUAllocationId_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_FunctionPercentageAllocations_Function_Name",
                schema: "catalog",
                table: "FunctionPercentageAllocations");

            migrationBuilder.DropIndex(
                name: "IX_DUAllocations_DeliveryUnitId",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.DropIndex(
                name: "IX_DUAllocations_ReceivedFundId_DeliveryUnitId_Purpose",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.DropColumn(
                name: "Function",
                schema: "catalog",
                table: "FunctionPercentageAllocations");

            migrationBuilder.RenameColumn(
                name: "Name",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                newName: "FunctionType");

            migrationBuilder.AddColumn<string>(
                name: "FunctionType",
                schema: "catalog",
                table: "KPIs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "WFPs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DUAllocationId",
                schema: "catalog",
                table: "WFPs",
                column: "DUAllocationId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPActivities_WFPId",
                schema: "catalog",
                table: "WFPActivities",
                column: "WFPId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "OPCRs",
                columns: new[] { "DeliveryUnitId", "FiscalYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DUAllocationId",
                schema: "catalog",
                table: "OPCRs",
                column: "DUAllocationId");

            migrationBuilder.CreateIndex(
                name: "IX_DUAllocations_DeliveryUnitId_Purpose",
                schema: "catalog",
                table: "DUAllocations",
                columns: new[] { "DeliveryUnitId", "Purpose" });

            migrationBuilder.CreateIndex(
                name: "IX_DUAllocations_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                column: "ReceivedFundId");

            migrationBuilder.AddForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                column: "ReceivedFundId",
                principalSchema: "catalog",
                principalTable: "ReceivedFunds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "OPCRs",
                column: "DUAllocationId",
                principalSchema: "catalog",
                principalTable: "DUAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "WFPs",
                column: "DUAllocationId",
                principalSchema: "catalog",
                principalTable: "DUAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.DropForeignKey(
                name: "FK_OPCRs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPs_DUAllocationId",
                schema: "catalog",
                table: "WFPs");

            migrationBuilder.DropIndex(
                name: "IX_WFPActivities_WFPId",
                schema: "catalog",
                table: "WFPActivities");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_OPCRs_DUAllocationId",
                schema: "catalog",
                table: "OPCRs");

            migrationBuilder.DropIndex(
                name: "IX_DUAllocations_DeliveryUnitId_Purpose",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.DropIndex(
                name: "IX_DUAllocations_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations");

            migrationBuilder.DropColumn(
                name: "FunctionType",
                schema: "catalog",
                table: "KPIs");

            migrationBuilder.RenameColumn(
                name: "FunctionType",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "Function",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Products",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Sku = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DeliveryUnitId",
                schema: "catalog",
                table: "WFPs",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPs_DUAllocationId_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "WFPs",
                columns: new[] { "DUAllocationId", "DeliveryUnitId", "FiscalYear" });

            migrationBuilder.CreateIndex(
                name: "IX_WFPObjectives_WFPId",
                schema: "catalog",
                table: "WFPObjectives",
                column: "WFPId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPActivities_WFPId",
                schema: "catalog",
                table: "WFPActivities",
                column: "WFPId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DeliveryUnitId",
                schema: "catalog",
                table: "OPCRs",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_OPCRs_DUAllocationId_DeliveryUnitId_FiscalYear",
                schema: "catalog",
                table: "OPCRs",
                columns: new[] { "DUAllocationId", "DeliveryUnitId", "FiscalYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FunctionPercentageAllocations_Function_Name",
                schema: "catalog",
                table: "FunctionPercentageAllocations",
                columns: new[] { "Function", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_DUAllocations_DeliveryUnitId",
                schema: "catalog",
                table: "DUAllocations",
                column: "DeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_DUAllocations_ReceivedFundId_DeliveryUnitId_Purpose",
                schema: "catalog",
                table: "DUAllocations",
                columns: new[] { "ReceivedFundId", "DeliveryUnitId", "Purpose" });

            migrationBuilder.AddForeignKey(
                name: "FK_DUAllocations_ReceivedFunds_ReceivedFundId",
                schema: "catalog",
                table: "DUAllocations",
                column: "ReceivedFundId",
                principalSchema: "catalog",
                principalTable: "ReceivedFunds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_KPIs_FunctionPercentageAllocations_FunctionPercentageAlloca~",
                schema: "catalog",
                table: "KPIs",
                column: "FunctionPercentageAllocationId",
                principalSchema: "catalog",
                principalTable: "FunctionPercentageAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OPCRs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "OPCRs",
                column: "DUAllocationId",
                principalSchema: "catalog",
                principalTable: "DUAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WFPs_DUAllocations_DUAllocationId",
                schema: "catalog",
                table: "WFPs",
                column: "DUAllocationId",
                principalSchema: "catalog",
                principalTable: "DUAllocations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
