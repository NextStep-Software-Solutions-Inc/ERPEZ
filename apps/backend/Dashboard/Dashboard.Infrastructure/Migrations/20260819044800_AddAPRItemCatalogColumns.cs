using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ERPEZ.Infrastructure.Persistence;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260819044800_AddAPRItemCatalogColumns")]
    public partial class AddAPRItemCatalogColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE procurement.""APRItems"" ALTER COLUMN ""APPItemId"" DROP NOT NULL;
                ALTER TABLE procurement.""APRItems"" ALTER COLUMN ""PPMPItemId"" DROP NOT NULL;
                ALTER TABLE procurement.""APRItems"" ADD COLUMN IF NOT EXISTS ""ItemCode"" text;
                ALTER TABLE procurement.""APRItems"" ADD COLUMN IF NOT EXISTS ""Description"" text;
                ALTER TABLE procurement.""APRItems"" ADD COLUMN IF NOT EXISTS ""Unit"" text;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE procurement.""APRItems"" DROP COLUMN IF EXISTS ""ItemCode"";
                ALTER TABLE procurement.""APRItems"" DROP COLUMN IF EXISTS ""Description"";
                ALTER TABLE procurement.""APRItems"" DROP COLUMN IF EXISTS ""Unit"";
            ");
        }
    }
}
