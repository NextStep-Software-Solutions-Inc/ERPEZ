-- ============================================================================
-- ERPEZ Production Multi-Stage Tenant Migration Script
-- Reference: SYSTEM_ARCHITECTURE.md Section 5.1 (Existing-Data Migration Strategy)
--
-- PURPOSE:
-- Safely backfill and enforce NOT NULL constraints on TenantId columns across all
-- operational tables without breaking existing single-tenant legacy records,
-- and establish composite unique indexes (TenantId, ...) to prevent cross-tenant collisions.
--
-- EXECUTION INSTRUCTIONS:
-- 1. Replace the legacy_tenant_id below with your verified legacy tenant GUID
--    (e.g., from Control Plane: SELECT "Id" FROM tenants WHERE "Slug" = 'primary-workspace';)
-- 2. Execute via psql:
--    psql -d erpez_operational -f scripts/migrations/production-tenant-backfill-and-migration.sql
-- ============================================================================

\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
    -- !!! CONFIGURE TARGET LEGACY TENANT ID BEFORE PRODUCTION EXECUTION !!!
    -- In single-tenant legacy migrations, this is the primary tenant's deterministic GUID.
    legacy_tenant_id CONSTANT uuid := COALESCE(
        NULLIF(current_setting('erpez.legacy_tenant_id', true), '')::uuid,
        '01a0d69d-924b-762c-a774-523a30544619'::uuid -- Fallback default: NextJump Solutions / primary tenant
    );

    table_record RECORD;
    null_count BIGINT;
    zero_count BIGINT;
    total_backfilled BIGINT := 0;
    idx_table_name TEXT;
    clean_name TEXT;

    -- All 136 tenant-scoped operational tables across planning and procurement schemas
    tenant_tables CONSTANT text[] := ARRAY[
        'planning."Agencies"',
        'planning."AgencyMasterBudgets"',
        'planning."APP_PPMP_Selections"',
        'planning."APPItems"',
        'planning."APPProcurementSchedules"',
        'planning."ApprovalEvents"',
        'planning."APPs"',
        'planning."APPSignatories"',
        'planning."Attributes"',
        'planning."BACResolutionWhereasClauses"',
        'planning."BudgetCalls"',
        'planning."Clusters"',
        'planning."DeliveryUnits"',
        'planning."DUKPITargetAssignments"',
        'planning."FiscalMonths"',
        'planning."FiscalYears"',
        'planning."FunctionAllocations"',
        'planning."FunctionConfigs"',
        'planning."FYActiveKPIMeasurements"',
        'planning."FYActiveKPIs"',
        'planning."GeneratedDocuments"',
        'planning."ItemPrices"',
        'planning."ItemRequests"',
        'planning."KPIAssignments"',
        'planning."KPIMeasurements"',
        'planning."KPIModeOfVerifications"',
        'planning."KPIPerformanceMeasures"',
        'planning."KPIs"',
        'planning."KPITargets"',
        'planning."LIBAmendmentRequests"',
        'planning."LineItemBudgetActivities"',
        'planning."LineItemBudgetDetails"',
        'planning."LineItemBudgets"',
        'planning."Locations"',
        'planning."MarketScopingActivities"',
        'planning."MarketScopingActivityAttachments"',
        'planning."MarketScopingActivitySettings"',
        'planning."MarketScopingHistories"',
        'planning."MarketScopingParameterAttachments"',
        'planning."MarketScopingParameters"',
        'planning."MarketScopingParameterSettings"',
        'planning."MarketScopings"',
        'planning."MFOPAPs"',
        'planning."NonCSEItems"',
        'planning."OfficeCeilings"',
        'planning."Offices"',
        'planning."OPCRActivities"',
        'planning."OPCRActivityEvaluations"',
        'planning."OPCRActivityMOVs"',
        'planning."OPCRActivityRatings"',
        'planning."OPCRConsolidations"',
        'planning."OPCREvaluations"',
        'planning."OPCRItemMOVs"',
        'planning."OPCRItemRatings"',
        'planning."OPCRItems"',
        'planning."OPCRPAPDepartments"',
        'planning."OPCRRatings"',
        'planning."OPCRs"',
        'planning."PerformanceMeasures"',
        'planning."PersonnelPositions"',
        'planning."PMTMembers"',
        'planning."PMTs"',
        'planning."Positions"',
        'planning."PPMPActivities"',
        'planning."PPMPExpenditureItems"',
        'planning."PPMPItemAllocations"',
        'planning."PPMPItems"',
        'planning."PPMPs"',
        'planning."ProcurementItems"',
        'planning."ProcurementPolicyConfigs"',
        'planning."Ratings"',
        'planning."RatingScaleLevels"',
        'planning."RatingScaleTemplates"',
        'planning."ResolutionClauses"',
        'planning."SubOfficeCeilings"',
        'planning."SupplierCategories"',
        'planning."SupplierRequirements"',
        'planning."Suppliers"',
        'planning."Transactions"',
        'planning."WFPObjectiveActivities"',
        'planning."WFPObjectiveActivityExpenditures"',
        'planning."WFPObjectives"',
        'planning."WFPObjectiveTimelines"',
        'planning."WFPPAPDepartments"',
        'planning."WFPPAPs"',
        'planning."WFPs"',
        'planning."WorkflowMatrices"',
        'procurement."AOBAwardedItems"',
        'procurement."AOBProcurementProjectMappings"',
        'procurement."AOBRFQMappings"',
        'procurement."AOBs"',
        'procurement."ApplicationUploadedDocuments"',
        'procurement."APRItemMilestones"',
        'procurement."APRItems"',
        'procurement."APRs"',
        'procurement."BACMembers"',
        'procurement."BACResolutionClauseLinks"',
        'procurement."BACResolutions"',
        'procurement."BACResolutionWhereasClauseItems"',
        'procurement."BiddingActivitySchedules"',
        'procurement."BiddingAwardRecommendations"',
        'procurement."BiddingDocument"',
        'procurement."BiddingEvaluatedBids"',
        'procurement."BiddingEvaluations"',
        'procurement."BiddingPostQualifications"',
        'procurement."BiddingSubmissionItems"',
        'procurement."BiddingSubmissions"',
        'procurement."BidOpeningRecords"',
        'procurement."ConsolidatedPRItems"',
        'procurement."ConsolidatedPRs"',
        'procurement."Contracts"',
        'procurement."DirectAcquisitionDocuments"',
        'procurement."DirectAcquisitions"',
        'procurement."DirectContractingProposalItems"',
        'procurement."DirectContractingProposals"',
        'procurement."DirectContractings"',
        'procurement."DirectPurchaseEntries"',
        'procurement."DocumentProfileItems"',
        'procurement."DocumentProfiles"',
        'procurement."NoticeOfAwardActivities"',
        'procurement."NoticeOfAwardMilestones"',
        'procurement."NoticeOfAwards"',
        'procurement."NoticeToProceeds"',
        'procurement."PRItems"',
        'procurement."ProcurementProjectAPPItems"',
        'procurement."ProcurementProjectApprovalEvents"',
        'procurement."ProcurementProjects"',
        'procurement."ProjectDocumentChecklists"',
        'procurement."PurchaseOrderItems"',
        'procurement."PurchaseOrders"',
        'procurement."PurchaseRequests"',
        'procurement."RFQItems"',
        'procurement."RFQs"',
        'procurement."RFQSuppliers"',
        'procurement."SupplierBidItems"',
        'procurement."SupplierBids"'
    ];
    target_table text;
BEGIN
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Starting ERPEZ Multi-Stage Tenant Migration (SYSTEM_ARCHITECTURE.md §5.1)';
    RAISE NOTICE 'Target Legacy Tenant ID: %', legacy_tenant_id;
    RAISE NOTICE '========================================================================';

    -- ────────────────────────────────────────────────────────────────────────
    -- STAGE 1: Schema Expansion
    -- Add "TenantId" uuid NULL to all TenantScopedEntity tables if not present
    -- ────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '>> STAGE 1: Schema Expansion (Add TenantId NULL)...';
    FOREACH target_table IN ARRAY tenant_tables
    LOOP
        -- Check if table exists in current database
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = split_part(target_table, '.', 1)
              AND table_name = trim(both '"' from split_part(target_table, '.', 2))
        ) THEN
            -- Add column if not exists
            EXECUTE format('ALTER TABLE %s ADD COLUMN IF NOT EXISTS "TenantId" uuid NULL;', target_table);
        END IF;
    END LOOP;
    RAISE NOTICE '   Stage 1 Complete: All tenant tables expanded with TenantId column.';

    -- ────────────────────────────────────────────────────────────────────────
    -- STAGE 2: Deterministic Provenance Backfill
    -- Backfill TenantId using legacy_tenant_id for all legacy rows
    -- ────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '>> STAGE 2: Deterministic Provenance Backfill...';
    FOREACH target_table IN ARRAY tenant_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = split_part(target_table, '.', 1)
              AND table_name = trim(both '"' from split_part(target_table, '.', 2))
        ) THEN
            EXECUTE format(
                'UPDATE %s SET "TenantId" = %L WHERE "TenantId" IS NULL OR "TenantId" = ''00000000-0000-0000-0000-000000000000'';',
                target_table, legacy_tenant_id
            );
            GET DIAGNOSTICS null_count = ROW_COUNT;
            IF null_count > 0 THEN
                RAISE NOTICE '   Backfilled % rows in %', null_count, target_table;
                total_backfilled := total_backfilled + null_count;
            END IF;
        END IF;
    END LOOP;
    RAISE NOTICE '   Stage 2 Complete: Total % legacy records backfilled with Tenant ID %.', total_backfilled, legacy_tenant_id;

    -- ────────────────────────────────────────────────────────────────────────
    -- STAGE 3: Integrity Validation (Fail-Closed)
    -- Verify 100% of rows in all tenant tables have a valid non-empty TenantId
    -- ────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '>> STAGE 3: Integrity Validation (Fail-Closed Verification)...';
    FOREACH target_table IN ARRAY tenant_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = split_part(target_table, '.', 1)
              AND table_name = trim(both '"' from split_part(target_table, '.', 2))
        ) THEN
            EXECUTE format(
                'SELECT COUNT(*) FROM %s WHERE "TenantId" IS NULL OR "TenantId" = ''00000000-0000-0000-0000-000000000000'';',
                target_table
            ) INTO null_count;

            IF null_count > 0 THEN
                RAISE EXCEPTION 'MIGRATION ABORTED: Found % orphaned records without valid TenantId in table %. Migration fails closed per SYSTEM_ARCHITECTURE.md §5.1.', null_count, target_table;
            END IF;
        END IF;
    END LOOP;
    RAISE NOTICE '   Stage 3 Complete: Zero orphaned records found. Provenance verified across all operational tables.';

    -- ────────────────────────────────────────────────────────────────────────
    -- STAGE 4: Schema Enforcement
    -- Enforce NOT NULL constraints on TenantId across all operational tables
    -- ────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '>> STAGE 4: Schema Enforcement (ALTER TABLE ... SET NOT NULL)...';
    FOREACH target_table IN ARRAY tenant_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = split_part(target_table, '.', 1)
              AND table_name = trim(both '"' from split_part(target_table, '.', 2))
        ) THEN
            EXECUTE format('ALTER TABLE %s ALTER COLUMN "TenantId" SET NOT NULL;', target_table);
            -- Ensure no default value persists so write-time interceptors must explicitly supply or assign it
            EXECUTE format('ALTER TABLE %s ALTER COLUMN "TenantId" DROP DEFAULT;', target_table);
        END IF;
    END LOOP;
    RAISE NOTICE '   Stage 4 Complete: NOT NULL constraint strictly enforced on all TenantId columns.';

    -- ────────────────────────────────────────────────────────────────────────
    -- STAGE 5: Index Migration
    -- Drop legacy single-column unique indexes and establish composite (TenantId, ...) indexes
    -- ────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '>> STAGE 5: Composite Index Migration...';

    -- 5.1 Procurement Core Transactions
    DROP INDEX IF EXISTS procurement."IX_PurchaseOrders_PONumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PurchaseOrders_TenantId_PONumber"
        ON procurement."PurchaseOrders" ("TenantId", "PONumber");

    DROP INDEX IF EXISTS procurement."IX_PurchaseRequests_PRNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PurchaseRequests_TenantId_PRNumber"
        ON procurement."PurchaseRequests" ("TenantId", "PRNumber")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS procurement."IX_ConsolidatedPRs_CPRNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_ConsolidatedPRs_TenantId_CPRNumber"
        ON procurement."ConsolidatedPRs" ("TenantId", "CPRNumber")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS procurement."IX_ConsolidatedPRItems_ConsolidatedPRId_PRItemId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_ConsolidatedPRItems_TenantId_ConsolidatedPRId_PRItemId"
        ON procurement."ConsolidatedPRItems" ("TenantId", "ConsolidatedPRId", "PRItemId");

    DROP INDEX IF EXISTS procurement."IX_RFQs_RFQNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_RFQs_TenantId_RFQNumber"
        ON procurement."RFQs" ("TenantId", "RFQNumber");

    DROP INDEX IF EXISTS procurement."IX_RFQs_TracingNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_RFQs_TenantId_TracingNumber"
        ON procurement."RFQs" ("TenantId", "TracingNumber");

    DROP INDEX IF EXISTS procurement."IX_RFQItems_RFQId_CPRItemId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_RFQItems_TenantId_RFQId_CPRItemId"
        ON procurement."RFQItems" ("TenantId", "RFQId", "CPRItemId");

    DROP INDEX IF EXISTS procurement."IX_RFQSuppliers_RFQId_SupplierId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_RFQSuppliers_TenantId_RFQId_SupplierId"
        ON procurement."RFQSuppliers" ("TenantId", "RFQId", "SupplierId");

    DROP INDEX IF EXISTS procurement."IX_APRs_APRNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_APRs_TenantId_APRNumber"
        ON procurement."APRs" ("TenantId", "APRNumber")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS procurement."IX_AOBs_AOBNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_AOBs_TenantId_AOBNumber"
        ON procurement."AOBs" ("TenantId", "AOBNumber");

    DROP INDEX IF EXISTS procurement."IX_AOBRFQMappings_AOBId_RFQId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_AOBRFQMappings_TenantId_AOBId_RFQId"
        ON procurement."AOBRFQMappings" ("TenantId", "AOBId", "RFQId");

    DROP INDEX IF EXISTS procurement."IX_BACResolutions_ResolutionNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_BACResolutions_TenantId_ResolutionNumber"
        ON procurement."BACResolutions" ("TenantId", "ResolutionNumber")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS procurement."IX_DirectAcquisitions_DANumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_DirectAcquisitions_TenantId_DANumber"
        ON procurement."DirectAcquisitions" ("TenantId", "DANumber");

    DROP INDEX IF EXISTS procurement."IX_DocumentProfiles_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_DocumentProfiles_TenantId_Name"
        ON procurement."DocumentProfiles" ("TenantId", "Name");

    DROP INDEX IF EXISTS procurement."IX_DocumentProfileItems_DocumentProfileId_MasterDocumentTypeId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_DocumentProfileItems_TenantId_DocProfile_MasterDocType"
        ON procurement."DocumentProfileItems" ("TenantId", "DocumentProfileId", "MasterDocumentTypeId");

    -- 5.2 Planning & Organizational Structures
    DROP INDEX IF EXISTS planning."IX_Offices_Code";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Offices_TenantId_Code"
        ON planning."Offices" ("TenantId", "Code");

    DROP INDEX IF EXISTS planning."IX_Positions_Code";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Positions_TenantId_Code"
        ON planning."Positions" ("TenantId", "Code");

    DROP INDEX IF EXISTS planning."IX_Clusters_Code";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Clusters_TenantId_Code"
        ON planning."Clusters" ("TenantId", "Code");

    DROP INDEX IF EXISTS planning."IX_Clusters_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Clusters_TenantId_Name"
        ON planning."Clusters" ("TenantId", "Name");

    DROP INDEX IF EXISTS planning."IX_Locations_Name_Code";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Locations_TenantId_Name_Code"
        ON planning."Locations" ("TenantId", "Name", "Code");

    DROP INDEX IF EXISTS planning."IX_MFOPAPs_Name_Code";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_MFOPAPs_TenantId_Name_Code"
        ON planning."MFOPAPs" ("TenantId", "Name", "Code");

    DROP INDEX IF EXISTS planning."IX_Transactions_FundSourceId_OrganizationId_LocationId_MFOPAPId_ObjectId_TransactionDate";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Transactions_TenantId_Accounting_Combination"
        ON planning."Transactions" ("TenantId", "FundSourceId", "OrganizationId", "LocationId", "MFOPAPId", "ObjectId", "TransactionDate");

    DROP INDEX IF EXISTS planning."IX_FiscalYears_TenantId_Year";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_FiscalYears_TenantId_Year"
        ON planning."FiscalYears" ("TenantId", "Year");

    DROP INDEX IF EXISTS planning."IX_FiscalMonths_FiscalYearId_MonthIndex";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_FiscalMonths_TenantId_FiscalYearId_MonthIndex"
        ON planning."FiscalMonths" ("TenantId", "FiscalYearId", "MonthIndex");

    DROP INDEX IF EXISTS planning."IX_PerformanceMeasures_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PerformanceMeasures_TenantId_Name"
        ON planning."PerformanceMeasures" ("TenantId", "Name");

    DROP INDEX IF EXISTS planning."IX_KPIModeOfVerifications_KPIId_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_KPIModeOfVerifications_TenantId_KPIId_Name"
        ON planning."KPIModeOfVerifications" ("TenantId", "KPIId", "Name");

    DROP INDEX IF EXISTS planning."IX_KPIPerformanceMeasures_KPIId_PerformanceMeasureId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_KPIPerformanceMeasures_TenantId_KPIId_PerformanceMeasureId"
        ON planning."KPIPerformanceMeasures" ("TenantId", "KPIId", "PerformanceMeasureId");

    DROP INDEX IF EXISTS planning."IX_Ratings_KPIPerformanceMeasureId_NumericalRating";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Ratings_TenantId_KPIPerformanceMeasureId_NumericalRating"
        ON planning."Ratings" ("TenantId", "KPIPerformanceMeasureId", "NumericalRating");

    DROP INDEX IF EXISTS planning."IX_KPITargets_KPIId_Period_QuarterName";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_KPITargets_TenantId_KPIId_Period_QuarterName"
        ON planning."KPITargets" ("TenantId", "KPIId", "Period", "QuarterName")
        WHERE "QuarterName" IS NOT NULL;

    DROP INDEX IF EXISTS planning."IX_KPIs_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_KPIs_TenantId_Name"
        ON planning."KPIs" ("TenantId", "Name");

    DROP INDEX IF EXISTS planning."IX_KPIAssignments_FYActiveKPIId_OfficeId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_KPIAssignments_TenantId_FYActiveKPIId_OfficeId"
        ON planning."KPIAssignments" ("TenantId", "FYActiveKPIId", "OfficeId");

    DROP INDEX IF EXISTS planning."IX_OPCRs_OfficeId_FiscalYearId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_OPCRs_TenantId_OfficeId_FiscalYearId"
        ON planning."OPCRs" ("TenantId", "OfficeId", "FiscalYearId");

    DROP INDEX IF EXISTS planning."IX_OPCRItems_OPCRId_KPIAssignmentId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_OPCRItems_TenantId_OPCRId_KPIAssignmentId"
        ON planning."OPCRItems" ("TenantId", "OPCRId", "KPIAssignmentId");

    DROP INDEX IF EXISTS planning."IX_OPCRActivities_OPCRItemId_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_OPCRActivities_TenantId_OPCRItemId_Name"
        ON planning."OPCRActivities" ("TenantId", "OPCRItemId", "Name");

    DROP INDEX IF EXISTS planning."IX_OPCRRatings_OPCREvaluationId_PerformanceMeasureId_OPCRId_DUKPITargetAssignmentId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_OPCRRatings_TenantId_OPCRRating_Combination"
        ON planning."OPCRRatings" ("TenantId", "OPCREvaluationId", "PerformanceMeasureId", "OPCRId", "DUKPITargetAssignmentId");

    DROP INDEX IF EXISTS planning."IX_OPCRPAPDepartments_OPCRActivityId_OfficeId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_OPCRPAPDepartments_TenantId_OPCRActivityId_OfficeId"
        ON planning."OPCRPAPDepartments" ("TenantId", "OPCRActivityId", "OfficeId");

    DROP INDEX IF EXISTS planning."IX_FunctionAllocations_FunctionType_FiscalYearId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_FunctionAllocations_TenantId_FunctionType_FiscalYearId"
        ON planning."FunctionAllocations" ("TenantId", "FunctionType", "FiscalYearId");

    DROP INDEX IF EXISTS planning."IX_WFPPAPDepartments_WFPPAPId_DeliveryUnitId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_WFPPAPDepartments_TenantId_WFPPAPId_DeliveryUnitId"
        ON planning."WFPPAPDepartments" ("TenantId", "WFPPAPId", "DeliveryUnitId");

    DROP INDEX IF EXISTS planning."IX_WFPObjectives_WFPId_Description";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_WFPObjectives_TenantId_WFPId_Description"
        ON planning."WFPObjectives" ("TenantId", "WFPId", "Description");

    DROP INDEX IF EXISTS planning."IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate";
    DROP INDEX IF EXISTS planning."IX_WFPObjectiveTimelines_WFPObjectiveActivityId_StartDate_EndDate";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_WFPObjectiveTimelines_TenantId_WFPObjAct_Start_End"
        ON planning."WFPObjectiveTimelines" ("TenantId", "WFPObjectiveActivityId", "StartDate", "EndDate");

    DROP INDEX IF EXISTS planning."IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType";
    DROP INDEX IF EXISTS planning."IX_WorkflowMatrices_FiscalYearId_OfficeId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_WorkflowMatrices_TenantId_FiscalYearId_OfficeId_DocType"
        ON planning."WorkflowMatrices" ("TenantId", "FiscalYearId", "OfficeId", "DocumentType")
        WHERE "IsDeleted" = false;
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_WorkflowMatrices_TenantId_FiscalYearId_OfficeId_Default"
        ON planning."WorkflowMatrices" ("TenantId", "FiscalYearId", "OfficeId")
        WHERE "IsDeleted" = false AND "DocumentType" IS NULL;

    DROP INDEX IF EXISTS planning."IX_APPs_APPNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_APPs_TenantId_APPNumber"
        ON planning."APPs" ("TenantId", "APPNumber");

    DROP INDEX IF EXISTS planning."IX_APP_PPMP_Selections_APPId_PPMPId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_APP_PPMP_Selections_TenantId_APPId_PPMPId"
        ON planning."APP_PPMP_Selections" ("TenantId", "APPId", "PPMPId");

    DROP INDEX IF EXISTS planning."IX_PPMPs_PPMPNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PPMPs_TenantId_PPMPNumber"
        ON planning."PPMPs" ("TenantId", "PPMPNumber");

    DROP INDEX IF EXISTS planning."IX_PPMPActivities_PPMPId_LIBActivityId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PPMPActivities_TenantId_PPMPId_LIBActivityId"
        ON planning."PPMPActivities" ("TenantId", "PPMPId", "LIBActivityId")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS planning."IX_PPMPItemAllocations_PPMPItemId_AllocationMonth";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PPMPItemAllocations_TenantId_PPMPItemId_AllocationMonth"
        ON planning."PPMPItemAllocations" ("TenantId", "PPMPItemId", "AllocationMonth");

    DROP INDEX IF EXISTS planning."IX_LineItemBudgets_LIBNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_LineItemBudgets_TenantId_LIBNumber"
        ON planning."LineItemBudgets" ("TenantId", "LIBNumber")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS planning."IX_AgencyMasterBudgets_FiscalYearId_FundSourceId_SourceDocumentType";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_AgencyMasterBudgets_TenantId_MasterBudget"
        ON planning."AgencyMasterBudgets" ("TenantId", "FiscalYearId", "FundSourceId", "SourceDocumentType");

    DROP INDEX IF EXISTS planning."IX_OfficeCeilings_OfficeId_FiscalYearId_AgencyMasterBudgetId_TargetType_IsSupplemental";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_OfficeCeilings_TenantId_OfficeCeiling"
        ON planning."OfficeCeilings" ("TenantId", "OfficeId", "FiscalYearId", "AgencyMasterBudgetId", "TargetType", "IsSupplemental");

    DROP INDEX IF EXISTS planning."IX_SubOfficeCeilings_OfficeCeilingId_SubOfficeId_FundClusterId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_SubOfficeCeilings_TenantId_SubOfficeCeiling"
        ON planning."SubOfficeCeilings" ("TenantId", "OfficeCeilingId", "SubOfficeId", "FundClusterId");

    DROP INDEX IF EXISTS planning."IX_Suppliers_BusinessPermitNo";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Suppliers_TenantId_BusinessPermitNo"
        ON planning."Suppliers" ("TenantId", "BusinessPermitNo")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS planning."IX_Suppliers_TINNumber";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Suppliers_TenantId_TINNumber"
        ON planning."Suppliers" ("TenantId", "TINNumber")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS planning."IX_SupplierCategories_Name";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_SupplierCategories_TenantId_Name"
        ON planning."SupplierCategories" ("TenantId", "Name")
        WHERE "IsDeleted" = false;

    DROP INDEX IF EXISTS planning."IX_ItemPrices_ProcurementItemId_FiscalYearId";
    CREATE UNIQUE INDEX IF NOT EXISTS "IX_ItemPrices_TenantId_ProcurementItemId_FiscalYearId"
        ON planning."ItemPrices" ("TenantId", "ProcurementItemId", "FiscalYearId");

    -- 5.3 High-Volume Performance Composite (TenantId, Id) Indexes
    -- Prevents full table scans when global query filters (TenantId = CurrentTenantId) are evaluated
    RAISE NOTICE '   Stage 5.3: Creating composite (TenantId, Id) indexes across all 136 operational tables...';
    FOREACH idx_table_name IN ARRAY tenant_tables LOOP
        clean_name := replace(replace(split_part(idx_table_name, '.', 2), '"', ''), ' ', '_');
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s ("TenantId", "Id")',
            'IX_' || clean_name || '_TenantId_Id', idx_table_name);
    END LOOP;

    -- 5.4 Natural Key Composite Indexes
    DROP INDEX IF EXISTS planning."IX_FYActiveKPIs_Code";
    CREATE INDEX IF NOT EXISTS "IX_FYActiveKPIs_TenantId_Code"
        ON planning."FYActiveKPIs" ("TenantId", "Code");

    CREATE INDEX IF NOT EXISTS "IX_KPIs_TenantId_Code"
        ON planning."KPIs" ("TenantId", "Code");

    CREATE INDEX IF NOT EXISTS "IX_OPCRs_TenantId_Code"
        ON planning."OPCRs" ("TenantId", "Code");

    DROP INDEX IF EXISTS planning."IX_Suppliers_Email";
    CREATE INDEX IF NOT EXISTS "IX_Suppliers_TenantId_Email"
        ON planning."Suppliers" ("TenantId", "Email");

    DROP INDEX IF EXISTS planning."IX_Suppliers_PhilGEPSNumber";
    CREATE INDEX IF NOT EXISTS "IX_Suppliers_TenantId_PhilGEPSNumber"
        ON planning."Suppliers" ("TenantId", "PhilGEPSNumber");

    RAISE NOTICE '   Stage 5 Complete: All single-tenant unique indexes dropped and composite (TenantId, ...) indexes established.';

    -- ────────────────────────────────────────────────────────────────────────
    -- STAGE 6: Filter Activation & EFMigrationsHistory Registration
    -- Mark EF Core migrations as applied so runtime starts with clean metadata
    -- ────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '>> STAGE 6: Marking EF Core Migrations as Applied...';

    CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
        "MigrationId" character varying(150) NOT NULL,
        "ProductVersion" character varying(32) NOT NULL,
        CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
    );

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261006055923_AddTenantIdToOperationalEntities', '9.0.0')
    ON CONFLICT ("MigrationId") DO NOTHING;

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261007010656_AddCompositeTenantIndexesToOperationalEntities', '9.0.0')
    ON CONFLICT ("MigrationId") DO NOTHING;

    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261007013355_AddTenantIdAndBusinessKeyCompositeIndexes', '9.0.0')
    ON CONFLICT ("MigrationId") DO NOTHING;

    RAISE NOTICE '   Stage 6 Complete: Migrations registered in __EFMigrationsHistory.';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'SUCCESS: Multi-Stage Tenant Migration completed successfully with zero errors.';
    RAISE NOTICE '========================================================================';
END $$;

COMMIT;
