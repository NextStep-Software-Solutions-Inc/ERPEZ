using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSubDUAllocationEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WFPPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPPAPDepartments_SubDeliveryUnits_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropTable(
                name: "SubDUAllocations",
                schema: "planning");

            migrationBuilder.DropTable(
                name: "SubDeliveryUnits",
                schema: "planning");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropColumn(
                name: "SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.RenameColumn(
                name: "ParentDUId",
                schema: "planning",
                table: "DeliveryUnits",
                newName: "ParentId");

            migrationBuilder.RenameIndex(
                name: "IX_DeliveryUnits_OfficeId_ParentDUId",
                schema: "planning",
                table: "DeliveryUnits",
                newName: "IX_DeliveryUnits_OfficeId_ParentId");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                columns: new[] { "WFPPAPId", "DeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryUnits_ParentId",
                schema: "planning",
                table: "DeliveryUnits",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_DeliveryUnits_DeliveryUnits_ParentId",
                schema: "planning",
                table: "DeliveryUnits",
                column: "ParentId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeliveryUnits_DeliveryUnits_ParentId",
                schema: "planning",
                table: "DeliveryUnits");

            migrationBuilder.DropForeignKey(
                name: "FK_WFPPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments");

            migrationBuilder.DropIndex(
                name: "IX_DeliveryUnits_ParentId",
                schema: "planning",
                table: "DeliveryUnits");

            migrationBuilder.RenameColumn(
                name: "ParentId",
                schema: "planning",
                table: "DeliveryUnits",
                newName: "ParentDUId");

            migrationBuilder.RenameIndex(
                name: "IX_DeliveryUnits_OfficeId_ParentId",
                schema: "planning",
                table: "DeliveryUnits",
                newName: "IX_DeliveryUnits_OfficeId_ParentDUId");

            migrationBuilder.AlterColumn<Guid>(
                name: "DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "SubDeliveryUnits",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ResponsibilityCenterCode = table.Column<string>(type: "text", nullable: true),
                    SubDeliveryUnitHead = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubDeliveryUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubDeliveryUnits_DeliveryUnits_DeliveryUnitId",
                        column: x => x.DeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "DeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubDUAllocations",
                schema: "planning",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DUAllocationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubDeliveryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubDUAllocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubDUAllocations_DUAllocations_DUAllocationId",
                        column: x => x.DUAllocationId,
                        principalSchema: "planning",
                        principalTable: "DUAllocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubDUAllocations_SubDeliveryUnits_SubDeliveryUnitId",
                        column: x => x.SubDeliveryUnitId,
                        principalSchema: "planning",
                        principalTable: "SubDeliveryUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                column: "SubDeliveryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_WFPPAPDepartments_WFPPAPId_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                columns: new[] { "WFPPAPId", "SubDeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubDeliveryUnits_DeliveryUnitId_Name",
                schema: "planning",
                table: "SubDeliveryUnits",
                columns: new[] { "DeliveryUnitId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubDUAllocations_DUAllocationId_SubDeliveryUnitId",
                schema: "planning",
                table: "SubDUAllocations",
                columns: new[] { "DUAllocationId", "SubDeliveryUnitId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubDUAllocations_SubDeliveryUnitId",
                schema: "planning",
                table: "SubDUAllocations",
                column: "SubDeliveryUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPPAPDepartments_DeliveryUnits_DeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                column: "DeliveryUnitId",
                principalSchema: "planning",
                principalTable: "DeliveryUnits",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WFPPAPDepartments_SubDeliveryUnits_SubDeliveryUnitId",
                schema: "planning",
                table: "WFPPAPDepartments",
                column: "SubDeliveryUnitId",
                principalSchema: "planning",
                principalTable: "SubDeliveryUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
