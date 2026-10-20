using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP_EZ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateInquiriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create Inquiries Table with IF NOT EXISTS for safe existing database reconciliation
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS public."Inquiries" (
                    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
                    "ReferenceCode" character varying(64) NULL,
                    "InquiryType" character varying(32) NOT NULL,
                    "ContactName" character varying(255) NULL,
                    "Email" character varying(255) NOT NULL,
                    "Phone" character varying(64) NULL,
                    "OrganizationName" character varying(255) NULL,
                    "Status" character varying(64) NOT NULL DEFAULT 'New',
                    "AssignedTo" character varying(255) NULL,
                    "Notes" text NULL,
                    "PlanName" character varying(100) NULL,
                    "Tier" character varying(64) NULL,
                    "DeploymentType" character varying(100) NULL,
                    "TeamSize" character varying(64) NULL,
                    "RequestedModules" text[] NULL,
                    "ScopeSummary" text NULL,
                    "EstimatedDelivery" text NULL,
                    "PreferredDate" character varying(64) NULL,
                    "PreferredTimeSlot" character varying(100) NULL,
                    "Source" character varying(255) NULL,
                    "MetadataJson" text NULL,
                    "SubmittedAtUtc" timestamp with time zone NOT NULL DEFAULT now(),
                    "UpdatedAtUtc" timestamp with time zone NOT NULL DEFAULT now(),
                    "IsDeleted" boolean NOT NULL DEFAULT FALSE,
                    CONSTRAINT "PK_Inquiries" PRIMARY KEY ("Id")
                );

                -- Harmonize defaults on existing databases to prevent session-time-zone-dependent conversion
                ALTER TABLE public."Inquiries"
                    ALTER COLUMN "SubmittedAtUtc" SET DEFAULT now(),
                    ALTER COLUMN "UpdatedAtUtc" SET DEFAULT now();
            """);

            // 2. Constraints and Indexes (including partial and PostgreSQL expression-based indexes)
            migrationBuilder.Sql("""
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_Inquiries_ReferenceCode"
                    ON public."Inquiries" ("ReferenceCode")
                    WHERE "ReferenceCode" IS NOT NULL AND "IsDeleted" = FALSE;

                CREATE UNIQUE INDEX IF NOT EXISTS "IX_Inquiries_Subscriber_Email"
                    ON public."Inquiries" (LOWER("Email"))
                    WHERE "InquiryType" = 'Subscriber' AND "IsDeleted" = FALSE;

                CREATE INDEX IF NOT EXISTS "IX_Inquiries_Type_SubmittedAt"
                    ON public."Inquiries" ("InquiryType", "SubmittedAtUtc" DESC);

                CREATE INDEX IF NOT EXISTS "IX_Inquiries_Status_SubmittedAt"
                    ON public."Inquiries" ("Status", "SubmittedAtUtc" DESC);

                CREATE INDEX IF NOT EXISTS "IX_Inquiries_Email"
                    ON public."Inquiries" (LOWER("Email"));

                CREATE INDEX IF NOT EXISTS "IX_Inquiries_Organization"
                    ON public."Inquiries" ("OrganizationName")
                    WHERE "OrganizationName" IS NOT NULL;

                CREATE INDEX IF NOT EXISTS "IX_Inquiries_SubmittedAtUtc"
                    ON public."Inquiries" ("SubmittedAtUtc" DESC);

                CREATE INDEX IF NOT EXISTS "IX_Inquiries_IsDeleted"
                    ON public."Inquiries" ("IsDeleted")
                    WHERE "IsDeleted" = FALSE;
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS public."Inquiries" CASCADE;
            """);
        }
    }
}
