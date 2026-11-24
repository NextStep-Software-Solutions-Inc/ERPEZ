using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReturnedFieldsAndIndexesToPurchaseRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE procurement.""PurchaseRequests"" ADD COLUMN IF NOT EXISTS ""ReturnRemarks"" text;
                ALTER TABLE procurement.""PurchaseRequests"" ADD COLUMN IF NOT EXISTS ""ReturnedBy"" text;
                ALTER TABLE procurement.""PurchaseRequests"" ADD COLUMN IF NOT EXISTS ""ReturnedDate"" timestamp with time zone;

                CREATE INDEX IF NOT EXISTS ""IX_PurchaseRequests_OfficeId_PRType_Status"" 
                ON procurement.""PurchaseRequests"" (""OfficeId"", ""PRType"", ""Status"") 
                WHERE ""IsDeleted"" = false;

                ALTER TABLE procurement.""PRItems"" DROP CONSTRAINT IF EXISTS ""FK_PRItems_APRItems_APRItemId"";

                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'FK_PRItems_APRItems_APRItemId'
                    ) THEN
                        ALTER TABLE procurement.""PRItems""
                        ADD CONSTRAINT ""FK_PRItems_APRItems_APRItemId""
                        FOREIGN KEY (""APRItemId"") REFERENCES procurement.""APRItems"" (""Id"")
                        ON DELETE RESTRICT;
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE procurement.""PRItems"" DROP CONSTRAINT IF EXISTS ""FK_PRItems_APRItems_APRItemId"";
                DROP INDEX IF EXISTS procurement.""IX_PurchaseRequests_OfficeId_PRType_Status"";
                ALTER TABLE procurement.""PurchaseRequests"" DROP COLUMN IF EXISTS ""ReturnRemarks"";
                ALTER TABLE procurement.""PurchaseRequests"" DROP COLUMN IF EXISTS ""ReturnedBy"";
                ALTER TABLE procurement.""PurchaseRequests"" DROP COLUMN IF EXISTS ""ReturnedDate"";
            ");
        }
    }
}
