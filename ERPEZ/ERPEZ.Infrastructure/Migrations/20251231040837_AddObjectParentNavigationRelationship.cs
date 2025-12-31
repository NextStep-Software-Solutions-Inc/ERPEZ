using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddObjectParentNavigationRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Objects_Objects_ParentObjectId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.DropIndex(
                name: "IX_Objects_ParentObjectId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "ParentObjectId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.AddForeignKey(
                name: "FK_Objects_Objects_ParentId",
                schema: "planning",
                table: "Objects",
                column: "ParentId",
                principalSchema: "planning",
                principalTable: "Objects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Objects_Objects_ParentId",
                schema: "planning",
                table: "Objects");

            migrationBuilder.AddColumn<Guid>(
                name: "ParentObjectId",
                schema: "planning",
                table: "Objects",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Objects_ParentObjectId",
                schema: "planning",
                table: "Objects",
                column: "ParentObjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Objects_Objects_ParentObjectId",
                schema: "planning",
                table: "Objects",
                column: "ParentObjectId",
                principalSchema: "planning",
                principalTable: "Objects",
                principalColumn: "Id");
        }
    }
}
