using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPEZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicHolidaysAndBiddingMilestones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE planning.""ProcurementActivityTypes"" ADD COLUMN IF NOT EXISTS ""DisplayOrder"" integer NOT NULL DEFAULT 0;
                ALTER TABLE planning.""ProcurementActivityTypes"" ADD COLUMN IF NOT EXISTS ""MilestoneKey"" text;

                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""CompletedAt"" timestamp with time zone;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""CompletedBy"" text;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""ConfirmedAt"" timestamp with time zone;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""ConfirmedBy"" text;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""IbPostingDate"" date;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""LockedAt"" timestamp with time zone;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""LockedBy"" text;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""MilestoneKey"" text;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""MilestoneOrder"" integer NOT NULL DEFAULT 0;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""ProcurementCategory"" text;
                ALTER TABLE procurement.""BiddingActivitySchedules"" ADD COLUMN IF NOT EXISTS ""ScheduleStatus"" text;

                CREATE TABLE IF NOT EXISTS procurement.""PublicHolidays"" (
                    ""Id"" uuid NOT NULL CONSTRAINT ""PK_PublicHolidays"" PRIMARY KEY,
                    ""Date"" date NOT NULL,
                    ""Name"" text NOT NULL,
                    ""Type"" text NOT NULL,
                    ""Year"" integer NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text,
                    ""UpdatedAt"" timestamp with time zone,
                    ""UpdatedBy"" text,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    ""DeletedAt"" timestamp with time zone,
                    ""DeletedBy"" text
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP TABLE IF EXISTS procurement.""PublicHolidays"";
                ALTER TABLE planning.""ProcurementActivityTypes"" DROP COLUMN IF EXISTS ""DisplayOrder"";
                ALTER TABLE planning.""ProcurementActivityTypes"" DROP COLUMN IF EXISTS ""MilestoneKey"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""CompletedAt"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""CompletedBy"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""ConfirmedAt"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""ConfirmedBy"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""IbPostingDate"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""LockedAt"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""LockedBy"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""MilestoneKey"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""MilestoneOrder"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""ProcurementCategory"";
                ALTER TABLE procurement.""BiddingActivitySchedules"" DROP COLUMN IF EXISTS ""ScheduleStatus"";
            ");
        }
    }
}
