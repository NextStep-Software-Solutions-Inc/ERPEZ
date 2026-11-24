using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ERPEZ.Infrastructure.Persistence;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260819063500_AddAPRReturnAndAuditFields")]
    public partial class AddAPRReturnAndAuditFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE procurement.""APRs"" ADD COLUMN IF NOT EXISTS ""ReturnedDate"" timestamp with time zone;
                ALTER TABLE procurement.""APRs"" ADD COLUMN IF NOT EXISTS ""ReturnRemarks"" text;
                ALTER TABLE procurement.""APRs"" ADD COLUMN IF NOT EXISTS ""ApprovedBy"" text;
                ALTER TABLE procurement.""APRs"" ADD COLUMN IF NOT EXISTS ""ReturnedBy"" text;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE procurement.""APRs"" DROP COLUMN IF EXISTS ""ReturnedDate"";
                ALTER TABLE procurement.""APRs"" DROP COLUMN IF EXISTS ""ReturnRemarks"";
                ALTER TABLE procurement.""APRs"" DROP COLUMN IF EXISTS ""ApprovedBy"";
                ALTER TABLE procurement.""APRs"" DROP COLUMN IF EXISTS ""ReturnedBy"";
            ");
        }
    }
}
