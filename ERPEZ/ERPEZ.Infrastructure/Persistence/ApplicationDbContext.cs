using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Object = ERPEZ.Domain.Entities.Planning.Object;
using Attribute = ERPEZ.Domain.Entities.Planning.Attribute;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    //Planning
    public DbSet<WFPObjectiveActivity>? WFPObjectiveActivities { get; set; }
    public DbSet<WFPObjectiveActivityExpenditure>? WFPObjectiveActivityExpenditures { get; set; }
    public DbSet<FunctionAllocation>? FunctionAllocations { get; set; }
    public DbSet<FundSource>? FundSources { get; set; }
    public DbSet<KPI>? KPIs { get; set; }
    public DbSet<KPIModeOfVerification>? KPIModeOfVerifications { get; set; }
    public DbSet<KPIMeasurement>? KPIMeasurements { get; set; }
    public DbSet<FYActiveKPI>? FYActiveKPIs { get; set; }
    public DbSet<FYActiveKPIMeasurement>? FYActiveKPIMeasurements { get; set; }
    public DbSet<KPIAssignment>? KPIAssignments { get; set; }
    public DbSet<RatingScaleTemplate>? RatingScaleTemplates { get; set; }
    public DbSet<RatingScaleLevel>? RatingScaleLevels { get; set; }
    public DbSet<Rating>? Ratings { get; set; }
    public DbSet<KPIPerformanceMeasure>? KPIPerformanceMeasures { get; set; }
    public DbSet<KPITarget>? KPITargets { get; set; }
    public DbSet<Location>? Locations { get; set; }
    public DbSet<MFOPAP>? MFOPAPs { get; set; }
    public DbSet<Object>? Objects { get; set; }
    public DbSet<Office>? Offices { get; set; }
    public DbSet<OPCR>? OPCRs { get; set; }
    public DbSet<OPCRActivity>? OPCRActivities { get; set; }
    public DbSet<OPCREvaluation>? OPCREvaluations { get; set; }
    public DbSet<OPCRRating>? OPCRRatings { get; set; }
    public DbSet<OPCRPAPDepartment>? OPCRPAPDepartments { get; set; }
    public DbSet<Organization>? Organizations { get; set; }
    public DbSet<PerformanceMeasure>? PerformanceMeasures { get; set; }
    public DbSet<Transaction>? Transactions { get; set; }
    public DbSet<WFP>? WFPs { get; set; }
    public DbSet<WFPObjective>? WFPObjectives { get; set; }

    public DbSet<WFPObjectiveTimeline>? WFPObjectiveTimelines { get; set; }
    public DbSet<Attribute>? Attributes { get; set; }
    public DbSet<Cluster>? Clusters { get; set; }
    public DbSet<DeliveryUnit>? DeliveryUnits { get; set; }
    public DbSet<DUKPITargetAssignment>? DUKPITargetAssignments { get; set; }
    public DbSet<FiscalYear>? FiscalYears { get; set; }
    public DbSet<FiscalMonth>? FiscalMonths { get; set; }
    public DbSet<BudgetCall>? BudgetCalls { get; set; }
    public DbSet<OPCRItem>? OPCRItems { get; set; }
    public DbSet<SDG>? SDGs { get; set; }
    public DbSet<WFPPAP>? WFPPAPs { get; set; }
    public DbSet<WFPPAPDepartment>? WFPPAPDepartments { get; set; }

    //Position Management
    public DbSet<Position>? Positions { get; set; }
    public DbSet<PositionType>? PositionTypes { get; set; }
    public DbSet<SalaryGrade>? SalaryGrades { get; set; }
    public DbSet<PlantillaType>? PlantillaTypes { get; set; }
    public DbSet<Step>? Steps { get; set; }
    public DbSet<Category>? Categories { get; set; }
    public DbSet<AdministrativeLevel>? AdministrativeLevels { get; set; }
    public DbSet<ProcurementWorkflow>? ProcurementWorkflows { get; set; }
    public DbSet<OfficeType>? OfficeTypes { get; set; }
    public DbSet<User>? Users { get; set; }
    public DbSet<PersonnelPosition>? PersonnelPositions { get; set; }
    public DbSet<PMT>? PMTs { get; set; }
    public DbSet<PMTMember>? PMTMembers { get; set; }

    //UACS Library
    public DbSet<UACSCodeSegment>? UACSCodeSegments { get; set; }
    public DbSet<UACSValidationRule>? UACSValidationRules { get; set; }
    public DbSet<UACSCodeCombination>? UACSCodeCombinations { get; set; }
    public DbSet<UACSCodeSegmentFiscalYear>? UACSCodeSegmentFiscalYears { get; set; }
    public DbSet<UACSCodeCombinationFiscalYear>? UACSCodeCombinationFiscalYears { get; set; }
    public DbSet<UACSImportLog>? UACSImportLogs { get; set; }
    public DbSet<ObjectChildCode>? ObjectChildCodes { get; set; }
    public DbSet<ExpenseClass>? ExpenseClasses { get; set; }
    public DbSet<ObjectExpenseClass>? ObjectExpenseClasses { get; set; }

    //Performance
    public DbSet<OPCRActivityMOV>? OPCRActivityMOVs { get; set; }
    public DbSet<OPCRActivityRating>? OPCRActivityRatings { get; set; }
    public DbSet<OPCRActivityEvaluation>? OPCRActivityEvaluations { get; set; }

    //Budget
    public DbSet<AgencyMasterBudget>? AgencyMasterBudgets { get; set; }
    public DbSet<OfficeCeiling>? OfficeCeilings { get; set; }
    public DbSet<SubOfficeCeiling>? SubOfficeCeilings { get; set; }
    public DbSet<LineItemBudget>? LineItemBudgets { get; set; }
    public DbSet<PPMP>? PPMPs { get; set; }
    public DbSet<APP>? APPs { get; set; }
    public DbSet<APPPPMP>? APPPPMPs { get; set; }
    public DbSet<LineItemBudgetActivity>? LineItemBudgetActivities { get; set; }
    public DbSet<LineItemBudgetDetail>? LineItemBudgetDetails { get; set; }
    public DbSet<LIBAmendmentRequest>? LIBAmendmentRequests { get; set; }
    public DbSet<MarketScoping>? MarketScopings { get; set; }
    public DbSet<MarketScopingActivity>? MarketScopingActivities { get; set; }
    public DbSet<MarketScopingActivityAttachment>? MarketScopingActivityAttachments { get; set; }
    public DbSet<MarketScopingParameter>? MarketScopingParameters { get; set; }
    public DbSet<MarketScopingParameterAttachment>? MarketScopingParameterAttachments { get; set; }
    public DbSet<MarketScopingHistory>? MarketScopingHistories { get; set; }
    public DbSet<MarketScopingParameterSettings>? MarketScopingParameterSettings { get; set; }
    public DbSet<MarketScopingActivitySettings>? MarketScopingActivitySettings { get; set; }
    public DbSet<BACResolutionWhereasClause>? BACResolutionWhereasClauses { get; set; }

    //Procurement
    public DbSet<ProcurementCategory>? ProcurementCategories { get; set; }
    public DbSet<ProcurementMode>? ProcurementModes { get; set; }
    public DbSet<ProcurementModeThreshold>? ProcurementModeThresholds { get; set; }
    public DbSet<ProcurementProject>? ProcurementProjects { get; set; }
    public DbSet<BACResolution>? BACResolutions { get; set; }
    public DbSet<BiddingActivitySchedule>? BiddingActivitySchedules { get; set; }
    public DbSet<SupplierBid>? SupplierBids { get; set; }
    public DbSet<SupplierBidItem>? SupplierBidItems { get; set; }
    public DbSet<AOB>? AOBs { get; set; }
    public DbSet<AOBProcurementProjectMapping>? AOBProcurementProjectMappings { get; set; }
    public DbSet<AOBAwardedItem>? AOBAwardedItems { get; set; }
    public DbSet<UOM>? UOMs { get; set; }
    public DbSet<UNSPSCCode>? UNSPSCCodes { get; set; }
    public DbSet<ProcurementItem>? ProcurementItems { get; set; }
    public DbSet<ProcurementActivityType>? ProcurementActivityTypes { get; set; }
    public DbSet<CSEItem>? CSEItems { get; set; }
    public DbSet<NonCSEItem>? NonCSEItems { get; set; }
    public DbSet<ItemPrice>? ItemPrices { get; set; }
    public DbSet<Supplier>? Suppliers { get; set; }
    public DbSet<SupplierRequirement>? SupplierRequirements { get; set; }
    public DbSet<SupplierCategory>? SupplierCategories { get; set; }
    // Fiscal Year Lifecycle Ecosystem
    public DbSet<FunctionConfig>? FunctionConfigs { get; set; }
    public DbSet<ProcurementPolicyConfig>? ProcurementPolicyConfigs { get; set; }
    public DbSet<GeneralRatingScale>? GeneralRatingScales { get; set; }
    public DbSet<EconomicIndicator>? EconomicIndicators { get; set; }
    public DbSet<WorkflowMatrix>? WorkflowMatrices { get; set; }
    //Other
    public DbSet<PPMPItem>? PPMPItems { get; set; }
    public DbSet<PPMPItemAllocation>? PPMPItemAllocations { get; set; }
    public DbSet<PPMPActivity>? PPMPActivities { get; set; }
    public DbSet<PPMPExpenditureItem>? PPMPExpenditureItems { get; set; }
    public DbSet<ApprovalEvent>? ApprovalEvents { get; set; }
    public DbSet<ItemRequest>? ItemRequests { get; set; }
    public DbSet<APPItem>? APPItems { get; set; }
    public DbSet<APPProcurementSchedule>? APPProcurementSchedules { get; set; }
    public DbSet<APR>? APRs { get; set; }
    public DbSet<APRItem>? APRItems { get; set; }
    public DbSet<APRItemMilestone>? APRItemMilestones { get; set; }
    public DbSet<OPCRItemRating>? OPCRItemRatings { get; set; }
    public DbSet<OPCRItemMOV>? OPCRItemMOVs { get; set; }
    public DbSet<GeneratedDocument>? GeneratedDocuments { get; set; }
    public DbSet<Agency>? Agencies { get; set; }
    public DbSet<DirectContracting>? DirectContractings { get; set; }
    public DbSet<DirectContractingProposal>? DirectContractingProposals { get; set; }
    public DbSet<DirectContractingProposalItem>? DirectContractingProposalItems { get; set; }

    public DbSet<OPCRConsolidation>? OPCRConsolidations { get; set; }

    //Procurement entities
    public DbSet<PurchaseRequest>? PurchaseRequests { get; set; }
    public DbSet<PRItem>? PRItems { get; set; }
    public DbSet<PRItemMonthlyQuantity>? PRItemMonthlyQuantities { get; set; }
    public DbSet<ConsolidatedPR>? ConsolidatedPRs { get; set; }
    public DbSet<ConsolidatedPRItem>? ConsolidatedPRItems { get; set; }
    
    // Bidding Document Library
    public DbSet<MasterDocumentType>?        MasterDocumentTypes        { get; set; }
    public DbSet<DocumentProfile>?           DocumentProfiles           { get; set; }
    public DbSet<DocumentProfileItem>?       DocumentProfileItems       { get; set; }
    public DbSet<ProjectDocumentChecklist>?  ProjectDocumentChecklists  { get; set; }

    public DbSet<PublicSupplierApplication>?   PublicSupplierApplications { get; set; }
    public DbSet<ApplicationUploadedDocument>? ApplicationUploadedDocuments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply default conventions for all entities
        modelBuilder.ConfigureDefaultEntityConventions();

        //KPI
        modelBuilder.Entity<KPI>()
        .HasIndex(k => new { k.Name });

        modelBuilder.Entity<KPI>()
            .HasIndex(k => k.Name)
            .IsUnique();

        // KPI -> KPIPerformanceMeasures
        modelBuilder.Entity<KPI>()
            .HasMany(k => k.KPIPerformanceMeasures)
            .WithOne(kpm => kpm.KPI)
            .HasForeignKey(kpm => kpm.KPIId);

        modelBuilder.Entity<KPI>()
            .HasMany(k => k.KPITargets)
            .WithOne(kt => kt.KPI)
            .HasForeignKey(kt => kt.KPIId);

        modelBuilder.Entity<KPI>()
            .HasMany(k => k.KPIModeOfVerifications)
            .WithOne(kv => kv.KPI)
            .HasForeignKey(kv => kv.KPIId);

        modelBuilder.Entity<KPI>()
            .HasMany(t => t.Attributes)
            .WithMany(m => m.KPIs);

        modelBuilder.Entity<KPI>()
            .HasMany(t => t.SDGs)
            .WithMany(m => m.KPIs);

        modelBuilder.Entity<KPI>()
            .HasOne(k => k.MFOPAP)
            .WithMany(m => m.KPIs)
            .HasForeignKey(k => k.MFOPAPId)
            .IsRequired(false);

        // DUKPITargetAssignment (Delivery Unit KPI Target Assignment)
        modelBuilder.Entity<DUKPITargetAssignment>()
            .HasOne(da => da.KPI)
            .WithMany(k => k.KPITargetAssignments)
            .HasForeignKey(da => da.KPIId)
            .IsRequired();

        modelBuilder.Entity<DUKPITargetAssignment>()
            .HasOne(da => da.DeliveryUnit)
            .WithMany()
            .HasForeignKey(da => da.DeliveryUnitId)
            .IsRequired();

        modelBuilder.Entity<DUKPITargetAssignment>()
            .HasOne(da => da.KPITarget)
            .WithMany()
            .HasForeignKey(da => da.KPITargetId)
            .IsRequired();

        modelBuilder.Entity<DUKPITargetAssignment>()
            .HasIndex(da => new { da.DeliveryUnitId, da.KPIId, da.KPITargetId })
            .IsUnique();

        // KPIModeOfVerification
        modelBuilder.Entity<KPIModeOfVerification>()
            .HasIndex(mv => new { mv.KPIId, mv.Name })
            .IsUnique();

        modelBuilder.Entity<KPIModeOfVerification>()
            .HasOne(mv => mv.KPI)
            .WithMany(k => k.KPIModeOfVerifications)
            .HasForeignKey(mv => mv.KPIId);

        // KPIPerformanceMeasure join entity and Rating relationship
        modelBuilder.Entity<KPIPerformanceMeasure>()
            .HasIndex(kpm => new { kpm.KPIId, kpm.PerformanceMeasureId })
            .IsUnique();

        modelBuilder.Entity<KPIPerformanceMeasure>()
            .HasOne(kpm => kpm.PerformanceMeasure)
            .WithMany(pm => pm.KPIPerformanceMeasures)
            .HasForeignKey(kpm => kpm.PerformanceMeasureId);

        modelBuilder.Entity<Rating>()
            .HasIndex(r => new { r.KPIPerformanceMeasureId, r.NumericalRating })
            .IsUnique();

        modelBuilder.Entity<Rating>()
            .HasOne(r => r.KPIPerformanceMeasure)
            .WithMany(kpm => kpm.Ratings)
            .HasForeignKey(r => r.KPIPerformanceMeasureId);

        // KPITarget
        // Relationship with KPI is already configured in KPI section

        modelBuilder.Entity<KPITarget>()
            .HasMany(kt => kt.KPITargets)
            .WithOne()
            .HasForeignKey("ParentKPITargetId")
            .IsRequired(false);

        modelBuilder.Entity<KPITarget>()
            .HasIndex(kt => new { kt.KPIId, kt.Period, kt.QuarterName })
            .IsUnique()
            .HasFilter("\"QuarterName\" IS NOT NULL");
            

        //PerformanceMeasure
        modelBuilder.Entity<PerformanceMeasure>()
            .HasIndex(pm => pm.Name)
            .IsUnique();

        // PerformanceMeasure relations are configured via KPIPerformanceMeasure above

        modelBuilder.Entity<PerformanceMeasure>()
            .HasMany(pm => pm.OPCRRatings)
            .WithOne(or => or.PerformanceMeasure)
            .HasForeignKey(or => or.PerformanceMeasureId);

        //Location
        modelBuilder.Entity<Location>()
            .HasIndex(l => new { l.Name, l.Code })
            .IsUnique();

        modelBuilder.Entity<Location>()
            .HasMany(l => l.Transactions)
            .WithOne(t => t.Location)
            .HasForeignKey(t => t.LocationId);

        modelBuilder.Entity<Location>()
            .HasOne<Location>()
            .WithMany()
            .HasForeignKey(l => l.ParentId);

        //Organization
        modelBuilder.Entity<Organization>()
            .HasIndex(o => new { o.Name, o.Code })
            .IsUnique();

        modelBuilder.Entity<Organization>()
            .HasMany(o => o.Transactions)
            .WithOne(t => t.Organization)
            .HasForeignKey(t => t.OrganizationId);

        modelBuilder.Entity<Organization>()
            .HasOne<Organization>()
            .WithMany()
            .HasForeignKey(o => o.ParentId);

        //MFOPAP
        modelBuilder.Entity<MFOPAP>()
            .HasIndex(m => new { m.Name, m.Code })
            .IsUnique();

        modelBuilder.Entity<MFOPAP>()
            .HasMany(m => m.Transactions)
            .WithOne(t => t.MFOPAP)
            .HasForeignKey(t => t.MFOPAPId);

        modelBuilder.Entity<MFOPAP>()
            .HasOne<MFOPAP>()
            .WithMany()
            .HasForeignKey(m => m.ParentId);

        //Transaction
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.FundSource)
            .WithMany(f => f.Transactions)
            .HasForeignKey(t => t.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Organization)
            .WithMany(o => o.Transactions)
            .HasForeignKey(t => t.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Location)
            .WithMany(l => l.Transactions)
            .HasForeignKey(t => t.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.MFOPAP)
            .WithMany(m => m.Transactions)
            .HasForeignKey(t => t.MFOPAPId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Object)
            .WithMany(o => o.Transactions)
            .HasForeignKey(t => t.ObjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => new { t.FundSourceId, t.OrganizationId, t.LocationId, t.MFOPAPId, t.ObjectId, t.TransactionDate })
            .IsUnique();

        //Object
        modelBuilder.Entity<Object>()
            .HasOne(o => o.ParentObject)
            .WithMany(o => o.ChildObjects)
            .HasForeignKey(o => o.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Object>()
            .HasMany(o => o.WFPObjectiveActivityExpenditures)
            .WithOne(a => a.Object)
            .HasForeignKey(a => a.ObjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Object>()
            .HasMany(o => o.Transactions)
            .WithOne(t => t.Object)
            .HasForeignKey(t => t.ObjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Object>()
            .HasIndex(o => new { o.ParentId, o.Code })
            .IsUnique();

        //FundSource
        modelBuilder.Entity<FundSource>()
            .HasMany(f => f.Transactions)
            .WithOne(t => t.FundSource)
            .HasForeignKey(t => t.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FundSource>()
            .HasOne(f => f.ParentSource)
            .WithMany(f => f.FundSources)
            .HasForeignKey(f => f.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FundSource>()
            .HasOne(f => f.FiscalYear)
            .WithMany()
            .HasForeignKey(f => f.FiscalYearId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<FundSource>()
            .HasIndex(f => new { f.ParentId, f.Code })
            .IsUnique();

        //DeliveryUnit
        modelBuilder.Entity<DeliveryUnit>()
            .HasIndex(du => new { du.OfficeId, du.ParentId });

        modelBuilder.Entity<DeliveryUnit>()
            .HasOne(du => du.Office)
            .WithMany(o => o.DeliveryUnits)
            .HasForeignKey(du => du.OfficeId);

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.SubDeliveryUnits)
            .WithOne()
            .HasForeignKey(du => du.ParentId);

        // DUAllocations relationship removed - entity deleted

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.KPITargetAssignments)
            .WithOne(kpia => kpia.DeliveryUnit)
            .HasForeignKey(kpia => kpia.DeliveryUnitId);

        //FiscalYear
        modelBuilder.Entity<FiscalYear>()
            .HasMany(fy => fy.FiscalMonths)
            .WithOne(fm => fm.FiscalYear)
            .HasForeignKey(fm => fm.FiscalYearId);

        modelBuilder.Entity<FiscalYear>()
            .HasMany(fy => fy.BudgetCalls)
            .WithOne(bc => bc.FiscalYear)
            .HasForeignKey(bc => bc.FiscalYearId);

        //FiscalMonth
        modelBuilder.Entity<FiscalMonth>()
            .HasIndex(fm => new { fm.FiscalYearId, fm.MonthIndex })
            .IsUnique();

        //BudgetCall
        modelBuilder.Entity<BudgetCall>()
            .HasIndex(bc => new { bc.FiscalYearId, bc.SubmissionDeadline });

        //FunctionConfig
        modelBuilder.Entity<FunctionConfig>()
            .HasOne(fc => fc.FiscalYear)
            .WithMany(fy => fy.FunctionConfigs)
            .HasForeignKey(fc => fc.FiscalYearId);

        modelBuilder.Entity<FunctionConfig>()
            .HasIndex(fc => fc.FiscalYearId);

        //ProcurementPolicyConfig
        modelBuilder.Entity<ProcurementPolicyConfig>()
            .HasOne(ppc => ppc.FiscalYear)
            .WithMany(fy => fy.ProcurementPolicyConfigs)
            .HasForeignKey(ppc => ppc.FiscalYearId);

        modelBuilder.Entity<ProcurementPolicyConfig>()
            .HasOne(ppc => ppc.ProcurementMode)
            .WithMany()
            .HasForeignKey(ppc => ppc.ProcurementModeId);

        modelBuilder.Entity<ProcurementPolicyConfig>()
            .HasOne(ppc => ppc.ProcurementModeThreshold)
            .WithMany()
            .HasForeignKey(ppc => ppc.ProcurementModeThresholdId);

        modelBuilder.Entity<ProcurementPolicyConfig>()
            .HasIndex(ppc => new { ppc.FiscalYearId, ppc.ProcurementModeId });

        // ProcurementMode
        modelBuilder.Entity<ProcurementMode>()
            .Property(pm => pm.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<ProcurementMode>()
            .Property(pm => pm.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<ProcurementMode>()
            .Property(pm => pm.MinThreshold)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProcurementMode>()
            .Property(pm => pm.MaxThreshold)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProcurementMode>()
            .HasIndex(pm => pm.Name)
            .IsUnique();

        //GeneralRatingScale
        modelBuilder.Entity<GeneralRatingScale>()
            .HasOne(grs => grs.FiscalYear)
            .WithMany(fy => fy.GeneralRatingScales)
            .HasForeignKey(grs => grs.FiscalYearId);

        modelBuilder.Entity<GeneralRatingScale>()
            .HasIndex(grs => new { grs.FiscalYearId, grs.AdjectivalRatingName });

        //EconomicIndicator
        modelBuilder.Entity<EconomicIndicator>()
            .HasOne(ei => ei.FiscalYear)
            .WithMany(fy => fy.EconomicIndicators)
            .HasForeignKey(ei => ei.FiscalYearId);

        modelBuilder.Entity<EconomicIndicator>()
            .HasIndex(ei => ei.FiscalYearId);

        //WorkflowMatrix
        modelBuilder.Entity<WorkflowMatrix>()
            .HasOne(wm => wm.FiscalYear)
            .WithMany(fy => fy.WorkflowMatrices)
            .HasForeignKey(wm => wm.FiscalYearId);

        modelBuilder.Entity<WorkflowMatrix>()
            .HasOne(wm => wm.Office)
            .WithMany()
            .HasForeignKey(wm => wm.OfficeId);

        modelBuilder.Entity<WorkflowMatrix>()
            .HasOne(wm => wm.RecommendingApproverPosition)
            .WithMany()
            .HasForeignKey(wm => wm.RecommendingApproverPositionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowMatrix>()
            .HasOne(wm => wm.FinalApproverPosition)
            .WithMany()
            .HasForeignKey(wm => wm.FinalApproverPositionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkflowMatrix>()
            .HasIndex(wm => new { wm.FiscalYearId, wm.OfficeId, wm.DocumentType })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false"); // Partial index - only enforce uniqueness for non-deleted records

        modelBuilder.Entity<WorkflowMatrix>()
            .HasIndex(wm => new { wm.FiscalYearId, wm.OfficeId })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false AND \"DocumentType\" IS NULL"); // One default workflow per FiscalYear and Office

        //WFP
        modelBuilder.Entity<WFP>()
            .HasIndex(w => new { w.OfficeId, w.Mode });

        modelBuilder.Entity<WFP>()
            .HasIndex(w => w.OPCRId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.Office)
            .WithMany(o => o.WFPs)
            .HasForeignKey(w => w.OfficeId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.OPCR)
            .WithMany()
            .HasForeignKey(w => w.OPCRId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.FundSource)
            .WithMany()
            .HasForeignKey(w => w.FundSourceId);

        // WFPObjective
        modelBuilder.Entity<WFPObjective>()
            .HasIndex(o => new { o.WFPId, o.Description })
            .IsUnique();

        modelBuilder.Entity<WFPObjective>()
            .HasOne(o => o.WFP)
            .WithMany(w => w.WFPObjectives)
            .HasForeignKey(o => o.WFPId)
            .IsRequired();

        modelBuilder.Entity<WFPObjective>()
            .HasMany(o => o.WFPObjectiveActivities)
            .WithOne(woa => woa.WFPObjective)
            .HasForeignKey(woa => woa.WFPObjectiveId);

        modelBuilder.Entity<WFPObjective>()
            .Property(o => o.Weight)
            .HasColumnType("decimal(18, 2)");

        //WFPObjectiveActivity
        modelBuilder.Entity<WFPObjectiveActivity>()
            .HasOne(a => a.WFP)
            .WithMany()
            .HasForeignKey(a => a.WFPId);

        modelBuilder.Entity<WFPObjectiveActivity>()
            .HasOne(a => a.WFPObjective)
            .WithMany(o => o.WFPObjectiveActivities)
            .HasForeignKey(a => a.WFPObjectiveId);

        modelBuilder.Entity<WFPObjectiveActivity>()
            .HasOne(a => a.OPCRActivity)
            .WithMany()
            .HasForeignKey(a => a.OPCRActivityId);

        modelBuilder.Entity<WFPObjectiveActivity>()
            .Property(a => a.Weight)
            .HasColumnType("decimal(18, 2)");

        //WFPObjectiveActivityExpenditure
        modelBuilder.Entity<WFPObjectiveActivityExpenditure>()
            .HasOne(e => e.WFPObjectiveActivity)
            .WithMany(a => a.WFPObjectiveActivityExpenditures)
            .HasForeignKey(e => e.WFPObjectiveActivityId);

        modelBuilder.Entity<WFPObjectiveActivityExpenditure>()
            .HasOne(e => e.Object)
            .WithMany(o => o.WFPObjectiveActivityExpenditures)
            .HasForeignKey(e => e.ObjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WFPObjectiveActivityExpenditure>()
            .HasIndex(e => new { e.WFPObjectiveActivityId, e.ObjectId, e.ItemDescription });

        //WFPObjectiveTimeline
        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasIndex(t => new { t.WFPObjectiveActivityId, t.StartDate })
            .IsUnique();

        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasOne(t => t.WFPObjectiveActivity)
            .WithMany(a => a.WFPObjectiveTimelines)
            .HasForeignKey(t => t.WFPObjectiveActivityId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTimeline>()
            .Property(t => t.TargetValue)
            .HasColumnType("decimal(18, 2)");

        //WFPPAPDepartment
        modelBuilder.Entity<WFPPAPDepartment>()
            .HasIndex(d => new { d.WFPPAPId, d.DeliveryUnitId })
            .IsUnique();

        modelBuilder.Entity<WFPPAPDepartment>()
            .HasOne(d => d.WFPPAP)
            .WithMany(p => p.WFPPAPDepartments)
            .HasForeignKey(d => d.WFPPAPId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WFPPAPDepartment>()
            .HasOne(d => d.DeliveryUnit)
            .WithMany(du => du.WFPPAPDepartments)
            .HasForeignKey(d => d.DeliveryUnitId)
            .OnDelete(DeleteBehavior.Restrict);


        // OPCR
        modelBuilder.Entity<OPCR>()
            .HasIndex(o => new { o.OfficeId, o.FiscalYearId })
            .IsUnique();

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.Office)
            .WithMany(o => o.OPCRs)
            .HasForeignKey(o => o.OfficeId);

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.FiscalYear)
            .WithMany()
            .HasForeignKey(o => o.FiscalYearId)
            .IsRequired();

        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.OPCREvaluations)
            .WithOne(e => e.OPCR)
            .HasForeignKey(e => e.OPCRId);

        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.OPCRItems)
            .WithOne(i => i.OPCR)
            .HasForeignKey(i => i.OPCRId);


        modelBuilder.Entity<OPCRPAPDepartment>()
            .HasOne(d => d.OPCRActivity)
            .WithMany(a => a.OPCRPAPDepartments)
            .HasForeignKey(d => d.OPCRActivityId);

        modelBuilder.Entity<OPCRPAPDepartment>()
            .HasOne(d => d.Office)
            .WithMany(o => o.OPCRPAPDepartments)
            .HasForeignKey(d => d.OfficeId);

        modelBuilder.Entity<OPCRPAPDepartment>()
            .HasIndex(d => new { d.OPCRActivityId, d.OfficeId })
            .IsUnique();

        // OPCREvaluation
        modelBuilder.Entity<OPCREvaluation>()
            .HasIndex(e => new { e.OPCRId, e.EvaluatorId, e.EvaluationDate });

        modelBuilder.Entity<OPCREvaluation>()
            .HasOne(e => e.OPCR)
            .WithMany(o => o.OPCREvaluations)
            .HasForeignKey(e => e.OPCRId);

        modelBuilder.Entity<OPCREvaluation>()
            .HasMany(e => e.OPCRRatings)
            .WithOne(r => r.OPCREvaluation)
            .HasForeignKey(r => r.OPCREvaluationId);

        // Implicit many-to-many between OPCR and DUKPITargetAssignment
        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.DUKPITargetAssignments)
            .WithMany(d => d.OPCRs);

        // OPCRActivity
        modelBuilder.Entity<OPCRActivity>()
            .HasOne(a => a.OPCRItem)
            .WithMany(i => i.OPCRActivities)
            .HasForeignKey(a => a.OPCRItemId);

        modelBuilder.Entity<OPCRActivity>()
            .HasIndex(a => new { a.OPCRItemId, a.Name })
            .IsUnique();

        // OPCRRating
        modelBuilder.Entity<OPCRRating>()
            .HasIndex(r => new { r.OPCREvaluationId, r.PerformanceMeasureId, r.OPCRId, r.DUKPITargetAssignmentId })
            .IsUnique();

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.OPCR)
            .WithMany()
            .HasForeignKey(r => r.OPCRId);

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.DUKPITargetAssignment)
            .WithMany()
            .HasForeignKey(r => r.DUKPITargetAssignmentId);

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.OPCREvaluation)
            .WithMany(e => e.OPCRRatings)
            .HasForeignKey(r => r.OPCREvaluationId);

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.PerformanceMeasure)
            .WithMany(p => p.OPCRRatings)
            .HasForeignKey(r => r.PerformanceMeasureId);

        // OPCRItem
        modelBuilder.Entity<OPCRItem>()
            .HasOne(i => i.OPCR)
            .WithMany(o => o.OPCRItems)
            .HasForeignKey(i => i.OPCRId);

        modelBuilder.Entity<OPCRItem>()
            .HasOne(i => i.KPIAssignment)
            .WithMany()
            .HasForeignKey(i => i.KPIAssignmentId);

        modelBuilder.Entity<OPCRItem>()
            .HasIndex(i => new { i.OPCRId, i.KPIAssignmentId })
            .IsUnique();

        //Cluster
        modelBuilder.Entity<Cluster>()
            .HasIndex(c => c.Name)
            .IsUnique();

        modelBuilder.Entity<Cluster>()
            .Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(256);

        modelBuilder.Entity<Cluster>()
            .HasMany(c => c.Offices)
            .WithOne(o => o.Cluster)
            .HasForeignKey(o => o.ClusterId);

        //WFPObjectiveTimeline
        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasOne(t => t.WFPObjectiveActivity)
            .WithMany(a => a.WFPObjectiveTimelines)
            .HasForeignKey(t => t.WFPObjectiveActivityId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasIndex(t => new { t.WFPObjectiveActivityId, t.StartDate, t.EndDate })
            .IsUnique();

        modelBuilder.Entity<WFPObjectiveTimeline>()
            .ToTable(t => t.HasCheckConstraint("CK_WFPObjectiveTimeline_Dates", "\"StartDate\" < \"EndDate\""));

        //FunctionAllocations
        modelBuilder.Entity<FunctionAllocation>()
            .HasIndex(fpa => new { fpa.FunctionType, fpa.FiscalYearId })
            .IsUnique();

        //Position Management
        
        //OfficeType
        modelBuilder.Entity<OfficeType>()
            .HasIndex(ot => ot.Code)
            .IsUnique();

        //Category
        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Code)
            .IsUnique();

        //AdministrativeLevel
        modelBuilder.Entity<AdministrativeLevel>()
            .HasIndex(al => al.Code)
            .IsUnique();

        //ProcurementWorkflow
        modelBuilder.Entity<ProcurementWorkflow>()
            .HasIndex(pw => pw.Code)
            .IsUnique();

        //Cluster
        modelBuilder.Entity<Cluster>()
            .HasIndex(c => c.Code)
            .IsUnique();

        //Office
        modelBuilder.Entity<Office>()
            .HasIndex(o => o.Code)
            .IsUnique();

        modelBuilder.Entity<Office>()
            .HasOne(o => o.OfficeType)
            .WithMany(ot => ot.Offices)
            .HasForeignKey(o => o.OfficeTypeId);

        modelBuilder.Entity<Office>()
            .HasOne(o => o.Organization)
            .WithMany(org => org.Offices)
            .HasForeignKey(o => o.OrganizationId);

        modelBuilder.Entity<Office>()
            .HasOne(o => o.Category)
            .WithMany(c => c.Offices)
            .HasForeignKey(o => o.CategoryId);

        modelBuilder.Entity<Office>()
            .HasOne(o => o.AdministrativeLevel)
            .WithMany(al => al.Offices)
            .HasForeignKey(o => o.AdministrativeLevelId);

        modelBuilder.Entity<Office>()
            .HasOne(o => o.Cluster)
            .WithMany(c => c.Offices)
            .HasForeignKey(o => o.ClusterId);

        modelBuilder.Entity<Office>()
            .HasOne(o => o.ProcurementWorkflow)
            .WithMany(pw => pw.Offices)
            .HasForeignKey(o => o.ProcurementWorkflowId);

        // Self-referencing relationship for office hierarchy
        modelBuilder.Entity<Office>()
            .HasOne(o => o.Parent)
            .WithMany(o => o.Children)
            .HasForeignKey(o => o.ParentId);

        //PositionType
        modelBuilder.Entity<PositionType>()
            .HasIndex(pt => pt.Code)
            .IsUnique();

        //SalaryGrade
        modelBuilder.Entity<SalaryGrade>()
            .HasIndex(sg => sg.Code)
            .IsUnique();

        modelBuilder.Entity<SalaryGrade>()
            .HasIndex(sg => sg.GradeNumber)
            .IsUnique();

        //PlantillaType
        modelBuilder.Entity<PlantillaType>()
            .HasIndex(pt => pt.Code)
            .IsUnique();

        //Step
        modelBuilder.Entity<Step>()
            .HasIndex(s => s.Code)
            .IsUnique();

        modelBuilder.Entity<Step>()
            .HasIndex(s => s.StepNumber)
            .IsUnique();

        //Position
        modelBuilder.Entity<Position>()
            .HasIndex(p => p.Code)
            .IsUnique();

        modelBuilder.Entity<Position>()
            .HasIndex(p => new { p.OfficeId, p.Title });

        modelBuilder.Entity<Position>()
            .HasOne(p => p.PositionType)
            .WithMany(pt => pt.Positions)
            .HasForeignKey(p => p.PositionTypeId);

        modelBuilder.Entity<Position>()
            .HasOne(p => p.PlantillaType)
            .WithMany(pt => pt.Positions)
            .HasForeignKey(p => p.PlantillaTypeId);

        modelBuilder.Entity<Position>()
            .HasOne(p => p.SalaryGrade)
            .WithMany(sg => sg.Positions)
            .HasForeignKey(p => p.SalaryGradeId);

        modelBuilder.Entity<Position>()
            .HasOne(p => p.Step)
            .WithMany(s => s.Positions)
            .HasForeignKey(p => p.StepId);

        modelBuilder.Entity<Position>()
            .HasOne(p => p.Office)
            .WithMany(o => o.Positions)
            .HasForeignKey(p => p.OfficeId);

        //ItemPrice - Pricing Schedule
        modelBuilder.Entity<ItemPrice>()
            .HasIndex(ip => new { ip.ProcurementItemId, ip.FiscalYearId })
            .IsUnique();

        modelBuilder.Entity<ItemPrice>()
            .HasOne(ip => ip.ProcurementItem)
            .WithMany()
            .HasForeignKey(ip => ip.ProcurementItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemPrice>()
            .HasOne(ip => ip.FiscalYear)
            .WithMany()
            .HasForeignKey(ip => ip.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemPrice>()
            .Property(ip => ip.UnitPrice)
            .HasPrecision(18, 2);

        //Supplier - Merchant Registry
        modelBuilder.Entity<Supplier>()
            .HasIndex(s => s.BusinessPermitNo)
            .IsUnique();

        modelBuilder.Entity<Supplier>()
            .HasIndex(s => s.TINNumber)
            .IsUnique();

        modelBuilder.Entity<Supplier>()
            .HasIndex(s => s.Email);

        modelBuilder.Entity<Supplier>()
            .HasIndex(s => s.PhilGEPSNumber);

        modelBuilder.Entity<Supplier>()
            .HasOne(s => s.SupplierCategory)
            .WithMany(sc => sc.Suppliers)
            .HasForeignKey(s => s.SupplierCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        //SupplierCategory
        modelBuilder.Entity<SupplierCategory>()
            .HasIndex(sc => sc.Name)
            .IsUnique();

        //SupplierRequirement
        modelBuilder.Entity<SupplierRequirement>()
            .HasOne(sr => sr.Supplier)
            .WithMany(s => s.SupplierRequirements)
            .HasForeignKey(sr => sr.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        // ProcurementMode
        modelBuilder.Entity<ProcurementMode>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<ProcurementMode>()
            .Property(e => e.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<ProcurementMode>()
            .HasIndex(e => e.Name)
            .IsUnique();

        // ProcurementActivityType
        modelBuilder.Entity<ProcurementActivityType>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<ProcurementActivityType>()
            .Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(1000);

        modelBuilder.Entity<ProcurementActivityType>()
            .HasIndex(e => e.Name);

        // CSEItem
        modelBuilder.Entity<CSEItem>()
            .Property(e => e.Type)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.Unit)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.ProductCode)
            .HasMaxLength(100);

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.ImageURL)
            .HasMaxLength(1000);

        modelBuilder.Entity<CSEItem>()
            .Property(e => e.Remarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<CSEItem>()
            .HasIndex(e => e.Type);

        modelBuilder.Entity<CSEItem>()
            .HasIndex(e => e.ProductCode);

        modelBuilder.Entity<CSEItem>()
            .HasIndex(e => e.Name);

        // SDG
        modelBuilder.Entity<SDG>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<SDG>()
            .Property(e => e.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<SDG>()
            .HasIndex(e => e.Name)
            .IsUnique();

        modelBuilder.Entity<SupplierRequirement>()
            .HasIndex(sr => new { sr.SupplierId, sr.RequirementName });

        // KPI Version 2 - KPIMeasurement
        modelBuilder.Entity<KPIMeasurement>()
            .HasOne(km => km.KPI)
            .WithMany(k => k.KPIMeasurements)
            .HasForeignKey(km => km.KPIId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<KPIMeasurement>()
            .HasOne(km => km.RatingScaleTemplate)
            .WithMany(r => r.KPIMeasurements)
            .HasForeignKey(km => km.RatingScaleTemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<KPIMeasurement>()
            .HasIndex(km => km.KPIId);

        modelBuilder.Entity<KPIMeasurement>()
            .Property(km => km.MOVs)
            .HasColumnType("text[]");

        modelBuilder.Entity<KPIMeasurement>()
            .Property(km => km.Dimensions)
            .HasColumnType("text[]");

        modelBuilder.Entity<FYActiveKPIMeasurement>()
            .Property(fm => fm.Dimensions)
            .HasColumnType("text[]");

        // KPI Version 2 - FYActiveKPI
        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.Name)
            .HasMaxLength(500);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.Code)
            .HasMaxLength(100);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.Description)
            .HasMaxLength(2000);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.MeasurementUnit)
            .HasMaxLength(50);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.DistributionBehavior)
            .HasMaxLength(50);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.FunctionCategory)
            .HasMaxLength(50);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.MonitoringFrequency)
            .HasMaxLength(50);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.Status)
            .HasMaxLength(50);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.AgencyTargetAnnual)
            .HasPrecision(18, 4);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.AgencyTargetQ1)
            .HasPrecision(18, 4);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.AgencyTargetQ2)
            .HasPrecision(18, 4);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.AgencyTargetQ3)
            .HasPrecision(18, 4);

        modelBuilder.Entity<FYActiveKPI>()
            .Property(fk => fk.AgencyTargetQ4)
            .HasPrecision(18, 4);

        modelBuilder.Entity<FYActiveKPI>()
            .HasIndex(fk => fk.FiscalYearId);

        modelBuilder.Entity<FYActiveKPI>()
            .HasIndex(fk => fk.MasterKPIId);

        modelBuilder.Entity<FYActiveKPI>()
            .HasIndex(fk => fk.ParentKPIId);

        modelBuilder.Entity<FYActiveKPI>()
            .HasIndex(fk => fk.Code);

        modelBuilder.Entity<FYActiveKPI>()
            .HasIndex(fk => fk.Status);

        modelBuilder.Entity<FYActiveKPI>()
            .HasIndex(fk => new { fk.FiscalYearId, fk.MasterKPIId });

        modelBuilder.Entity<FYActiveKPI>()
            .HasOne(fk => fk.FiscalYear)
            .WithMany()
            .HasForeignKey(fk => fk.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FYActiveKPI>()
            .HasOne(fk => fk.MasterKPI)
            .WithMany(k => k.FYActiveKPIs)
            .HasForeignKey(fk => fk.MasterKPIId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FYActiveKPI>()
            .HasOne(fk => fk.ParentFYActiveKPI)
            .WithMany(p => p.ChildFYActiveKPIs)
            .HasForeignKey(fk => fk.ParentKPIId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FYActiveKPI>()
            .HasOne(fk => fk.MFOPAP)
            .WithMany()
            .HasForeignKey(fk => fk.MFOPAPId)
            .OnDelete(DeleteBehavior.SetNull);

        // KPI Version 2 - FYActiveKPIMeasurement
        modelBuilder.Entity<FYActiveKPIMeasurement>()
            .HasOne(fm => fm.FYActiveKPI)
            .WithMany(f => f.FYActiveKPIMeasurements)
            .HasForeignKey(fm => fm.FYActiveKPIId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FYActiveKPIMeasurement>()
            .HasOne(fm => fm.RatingScaleTemplate)
            .WithMany(r => r.FYActiveKPIMeasurements)
            .HasForeignKey(fm => fm.RatingScaleTemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<FYActiveKPIMeasurement>()
            .HasIndex(fm => fm.FYActiveKPIId);

        modelBuilder.Entity<FYActiveKPIMeasurement>()
            .Property(fm => fm.MOVs)
            .HasColumnType("text[]");

        // KPI Version 2 - KPIAssignment
        modelBuilder.Entity<KPIAssignment>()
            .HasOne(ka => ka.FYActiveKPI)
            .WithMany(f => f.KPIAssignments)
            .HasForeignKey(ka => ka.FYActiveKPIId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<KPIAssignment>()
            .HasOne(ka => ka.Office)
            .WithMany()
            .HasForeignKey(ka => ka.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<KPIAssignment>()
            .HasIndex(ka => new { ka.FYActiveKPIId, ka.OfficeId })
            .IsUnique();

        modelBuilder.Entity<KPIAssignment>()
            .Property(ka => ka.AssignedTargetAnnual)
            .HasPrecision(18, 4);

        modelBuilder.Entity<KPIAssignment>()
            .Property(ka => ka.AssignedTargetQ1)
            .HasPrecision(18, 4);

        modelBuilder.Entity<KPIAssignment>()
            .Property(ka => ka.AssignedTargetQ2)
            .HasPrecision(18, 4);

        modelBuilder.Entity<KPIAssignment>()
            .Property(ka => ka.AssignedTargetQ3)
            .HasPrecision(18, 4);

        modelBuilder.Entity<KPIAssignment>()
            .Property(ka => ka.AssignedTargetQ4)
            .HasPrecision(18, 4);

        // KPI Version 2 - RatingScaleTemplate
        modelBuilder.Entity<RatingScaleTemplate>()
            .HasOne(r => r.GeneralRatingScale)
            .WithMany()
            .HasForeignKey(r => r.GeneralRatingScaleId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RatingScaleTemplate>()
            .HasIndex(r => r.Name);

        modelBuilder.Entity<RatingScaleTemplate>()
            .HasIndex(r => r.IsDefault);

        // KPI Version 2 - RatingScaleLevel
        modelBuilder.Entity<RatingScaleLevel>()
            .HasOne(rl => rl.RatingScaleTemplate)
            .WithMany(r => r.RatingScaleLevels)
            .HasForeignKey(rl => rl.RatingScaleTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RatingScaleLevel>()
            .HasIndex(rl => new { rl.RatingScaleTemplateId, rl.RatingValue })
            .IsUnique();

        modelBuilder.Entity<RatingScaleLevel>()
            .Property(rl => rl.MinValue)
            .HasPrecision(18, 4);

        modelBuilder.Entity<RatingScaleLevel>()
            .Property(rl => rl.MaxValue)
            .HasPrecision(18, 4);

        // Budget - AgencyMasterBudget
        modelBuilder.Entity<AgencyMasterBudget>()
            .Property(e => e.SourceDocumentType)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<AgencyMasterBudget>()
            .Property(e => e.PSAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<AgencyMasterBudget>()
            .Property(e => e.MOOEAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<AgencyMasterBudget>()
            .Property(e => e.COAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<AgencyMasterBudget>()
            .HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AgencyMasterBudget>()
            .HasOne(e => e.FundSource)
            .WithMany()
            .HasForeignKey(e => e.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AgencyMasterBudget>()
            .HasIndex(e => e.FiscalYearId);

        modelBuilder.Entity<AgencyMasterBudget>()
            .HasIndex(e => e.FundSourceId);

        modelBuilder.Entity<AgencyMasterBudget>()
            .HasIndex(e => e.SourceDocumentType);

        modelBuilder.Entity<AgencyMasterBudget>()
            .HasIndex(e => new { e.FiscalYearId, e.FundSourceId, e.SourceDocumentType })
            .IsUnique();

        // Budget - OfficeCeiling
        modelBuilder.Entity<OfficeCeiling>()
            .Property(e => e.TargetType)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<OfficeCeiling>()
            .Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<OfficeCeiling>()
            .Property(e => e.PSAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<OfficeCeiling>()
            .Property(e => e.MOOEAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<OfficeCeiling>()
            .Property(e => e.COAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<OfficeCeiling>()
            .Property(e => e.IsSupplemental)
            .IsRequired()
            .HasDefaultValue(false);

        modelBuilder.Entity<OfficeCeiling>()
            .HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfficeCeiling>()
            .HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfficeCeiling>()
            .HasOne(e => e.AgencyMasterBudget)
            .WithMany(e => e.OfficeCeilings)
            .HasForeignKey(e => e.AgencyMasterBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfficeCeiling>()
            .HasIndex(e => e.FiscalYearId);

        modelBuilder.Entity<OfficeCeiling>()
            .HasIndex(e => e.OfficeId);

        modelBuilder.Entity<OfficeCeiling>()
            .HasIndex(e => e.AgencyMasterBudgetId);

        modelBuilder.Entity<OfficeCeiling>()
            .HasIndex(e => e.Status);

        modelBuilder.Entity<OfficeCeiling>()
            .HasIndex(e => new { e.OfficeId, e.FiscalYearId, e.AgencyMasterBudgetId, e.TargetType, e.IsSupplemental })
            .IsUnique();

        // Budget - SubOfficeCeiling
        modelBuilder.Entity<SubOfficeCeiling>()
            .Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<SubOfficeCeiling>()
            .Property(e => e.PSAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<SubOfficeCeiling>()
            .Property(e => e.MOOEAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<SubOfficeCeiling>()
            .Property(e => e.COAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasOne(e => e.OfficeCeiling)
            .WithMany(e => e.SubOfficeCeilings)
            .HasForeignKey(e => e.OfficeCeilingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasOne(e => e.SubOffice)
            .WithMany()
            .HasForeignKey(e => e.SubOfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasOne(e => e.FundCluster)
            .WithMany()
            .HasForeignKey(e => e.FundClusterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasIndex(e => e.OfficeCeilingId);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasIndex(e => e.SubOfficeId);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasIndex(e => e.FundClusterId);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasIndex(e => e.FiscalYearId);

        modelBuilder.Entity<SubOfficeCeiling>()
            .HasIndex(e => new { e.OfficeCeilingId, e.SubOfficeId, e.FundClusterId })
            .IsUnique();

        // Budget - LineItemBudget
        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.SourceType)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.Scope)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.Level)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.LIBNumber)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.Name)
            .HasMaxLength(500);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LineItemBudget>()
            .Property(e => e.Version)
            .IsRequired()
            .HasDefaultValue(1);

        modelBuilder.Entity<LineItemBudget>()
            .HasOne(e => e.FiscalYearEntity)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LineItemBudget>()
            .HasOne(e => e.FundSource)
            .WithMany()
            .HasForeignKey(e => e.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LineItemBudget>()
            .HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LineItemBudget>()
            .HasOne(e => e.ParentLIB)
            .WithMany(e => e.ChildLIBs)
            .HasForeignKey(e => e.ParentLIBId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LineItemBudget>()
            .HasOne(e => e.ConsolidatedIntoLIB)
            .WithMany(e => e.ConsolidatedChildLIBs)
            .HasForeignKey(e => e.ConsolidatedIntoLIBId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LineItemBudget>()
            .HasOne(e => e.PreviousVersion)
            .WithMany(e => e.VersionHistory)
            .HasForeignKey(e => e.PreviousVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.LIBNumber)
            .IsUnique();

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.FiscalYearId);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.FundSourceId);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.OfficeId);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.Status);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.ParentLIBId);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.ConsolidatedIntoLIBId);

        modelBuilder.Entity<LineItemBudget>()
            .HasIndex(e => e.PreviousVersionId);

        // Budget - LineItemBudgetActivity
        modelBuilder.Entity<LineItemBudgetActivity>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<LineItemBudgetActivity>()
            .HasIndex(e => e.LineItemBudgetId);

        modelBuilder.Entity<LineItemBudgetActivity>()
            .HasIndex(e => e.WFPObjectiveActivityId);

        modelBuilder.Entity<LineItemBudgetActivity>()
            .HasIndex(e => e.OPCRActivityId);

        // Budget - LineItemBudgetDetail
        modelBuilder.Entity<LineItemBudgetDetail>()
            .Property(e => e.TimelineType)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<LineItemBudgetDetail>()
            .Property(e => e.Budget)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<LineItemBudgetDetail>()
            .Property(e => e.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<LineItemBudgetDetail>()
            .HasIndex(e => e.LineItemBudgetId);

        modelBuilder.Entity<LineItemBudgetDetail>()
            .HasIndex(e => e.LineItemBudgetActivityId);

        modelBuilder.Entity<LineItemBudgetDetail>()
            .HasIndex(e => e.ObjectId);

        modelBuilder.Entity<LineItemBudgetDetail>()
            .HasIndex(e => e.WFPObjectiveActivityExpenditureId);

        modelBuilder.Entity<LineItemBudgetDetail>()
            .HasIndex(e => new { e.StartDate, e.EndDate });

        // Budget - LIBAmendmentRequest
        modelBuilder.Entity<LIBAmendmentRequest>()
            .Property(e => e.Reason)
            .IsRequired()
            .HasMaxLength(250);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .Property(e => e.Justification)
            .IsRequired()
            .HasMaxLength(2000);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .HasOne(e => e.LineItemBudget)
            .WithMany(e => e.LIBAmendmentRequests)
            .HasForeignKey(e => e.LineItemBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .HasOne(e => e.ProposedLineItemBudget)
            .WithMany(e => e.ProposedLIBAmendmentRequests)
            .HasForeignKey(e => e.ProposedLineItemBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .HasIndex(e => e.LineItemBudgetId);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .HasIndex(e => e.ProposedLineItemBudgetId);

        modelBuilder.Entity<LIBAmendmentRequest>()
            .HasIndex(e => e.Status);

        // PPMP (Project Procurement Management Plan)
        modelBuilder.Entity<PPMP>()
            .HasOne(p => p.Office)
            .WithMany()
            .HasForeignKey(p => p.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PPMP>()
            .HasOne(p => p.FiscalYear)
            .WithMany()
            .HasForeignKey(p => p.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PPMP>()
            .HasOne(p => p.FundSource)
            .WithMany()
            .HasForeignKey(p => p.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PPMP>()
            .HasOne(p => p.LineItemBudget)
            .WithMany()
            .HasForeignKey(p => p.LIBId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PPMP>()
            .HasOne(p => p.ParentPPMP)
            .WithMany(p => p.ChildPPMPs)
            .HasForeignKey(p => p.ParentId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        modelBuilder.Entity<PPMP>()
            .HasOne(p => p.ConsolidatedInto)
            .WithMany()
            .HasForeignKey(p => p.ConsolidatedIntoId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        modelBuilder.Entity<PPMP>()
            .HasIndex(p => p.PPMPNumber)
            .IsUnique();

        modelBuilder.Entity<PPMP>()
            .HasIndex(p => new { p.OfficeId, p.FiscalYearId, p.IsFinal });

        modelBuilder.Entity<PPMP>()
            .Property(p => p.TotalEstimatedBudget)
            .HasPrecision(18, 2);

        // ApprovalEvent
        modelBuilder.Entity<ApprovalEvent>()
            .HasOne(ae => ae.PPMP)
            .WithMany(p => p.ApprovalEvents)
            .HasForeignKey(ae => ae.PPMPId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApprovalEvent>()
            .HasIndex(ae => new { ae.PPMPId, ae.Timestamp });

        modelBuilder.Entity<ApprovalEvent>()
            .Property(ae => ae.Role)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<ApprovalEvent>()
            .Property(ae => ae.Action)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<ApprovalEvent>()
            .Property(ae => ae.ActorName)
            .IsRequired()
            .HasMaxLength(200);

        // PPMPActivity
        modelBuilder.Entity<PPMPActivity>()
            .HasOne(pa => pa.PPMP)
            .WithMany(p => p.PPMPActivities)
            .HasForeignKey(pa => pa.PPMPId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPMPActivity>()
            .HasOne(pa => pa.LIBActivity)
            .WithMany()
            .HasForeignKey(pa => pa.LIBActivityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PPMPActivity>()
            .HasIndex(pa => new { pa.PPMPId, pa.LIBActivityId })
            .IsUnique();

        // PPMPExpenditureItem
        modelBuilder.Entity<PPMPExpenditureItem>()
            .HasOne(pei => pei.PPMPActivity)
            .WithMany(pa => pa.PPMPExpenditureItems)
            .HasForeignKey(pei => pei.PPMPActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPMPExpenditureItem>()
            .Property(pei => pei.TotalCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PPMPExpenditureItem>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_PPMPExpenditureItem_TotalCost",
                "\"TotalCost\" >= 0"
            ));

        // PPMPItem
        modelBuilder.Entity<PPMPItem>()
            .HasOne(pi => pi.PPMPExpenditureItem)
            .WithMany(pei => pei.PPMPItems)
            .HasForeignKey(pi => pi.PPMPExpenditureItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPMPItem>()
            .HasOne(pi => pi.CSEItem)
            .WithMany()
            .HasForeignKey(pi => pi.CSEItemId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<PPMPItem>()
            .HasOne(pi => pi.NonCSEItem)
            .WithMany(n => n.PPMPItems)
            .HasForeignKey(pi => pi.NonCSEItemId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<PPMPItem>()
            .HasOne(pi => pi.ProcurementMode)
            .WithMany()
            .HasForeignKey(pi => pi.ProcurementModeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PPMPItem>()
            .Property(pi => pi.UnitPrice)
            .HasPrecision(18, 4);

        modelBuilder.Entity<PPMPItem>()
            .Property(pi => pi.Name)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<PPMPItem>()
            .Property(pi => pi.Unit)
            .IsRequired()
            .HasMaxLength(50);

        // PPMPItemAllocation
        modelBuilder.Entity<PPMPItemAllocation>()
            .HasOne(pia => pia.PPMPItem)
            .WithMany(pi => pi.PPMPItemAllocations)
            .HasForeignKey(pia => pia.PPMPItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PPMPItemAllocation>()
            .Property(pia => pia.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PPMPItemAllocation>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_PPMPItemAllocation_Amount",
                "\"Amount\" >= 0"
            ));

        modelBuilder.Entity<PPMPItemAllocation>()
            .HasIndex(pia => new { pia.PPMPItemId, pia.AllocationMonth })
            .IsUnique();

        // ItemRequest
        modelBuilder.Entity<ItemRequest>()
            .HasOne(ir => ir.Office)
            .WithMany()
            .HasForeignKey(ir => ir.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemRequest>()
            .HasOne(ir => ir.UOM)
            .WithMany()
            .HasForeignKey(ir => ir.UOMId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<ItemRequest>()
            .HasOne(ir => ir.ProcurementCategory)
            .WithMany()
            .HasForeignKey(ir => ir.ProcurementCategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<ItemRequest>()
            .Property(ir => ir.Name)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<ItemRequest>()
            .Property(ir => ir.ItemCategory)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<ItemRequest>()
            .Property(ir => ir.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<ItemRequest>()
            .Property(ir => ir.EstimatedUnitCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ItemRequest>()
            .HasIndex(ir => ir.Status);

        modelBuilder.Entity<ItemRequest>()
            .HasIndex(ir => new { ir.OfficeId, ir.RequestDate });

        // NonCSEItem
        modelBuilder.Entity<NonCSEItem>()
            .HasOne(n => n.UOM)
            .WithMany()
            .HasForeignKey(n => n.UOMId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<NonCSEItem>()
            .HasOne(n => n.ItemRequest)
            .WithMany(ir => ir.NonCSEItems)
            .HasForeignKey(n => n.ItemRequestId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.Name)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.Type)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.CurrentPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.BaseCost)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.Margin)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.SellingPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        modelBuilder.Entity<NonCSEItem>()
            .Property(n => n.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<NonCSEItem>()
            .HasIndex(n => n.Name);

        modelBuilder.Entity<NonCSEItem>()
            .HasIndex(n => n.Type);

        modelBuilder.Entity<NonCSEItem>()
            .HasIndex(n => n.Status);

        modelBuilder.Entity<NonCSEItem>()
            .HasIndex(n => n.IsActive);

        modelBuilder.Entity<NonCSEItem>()
            .HasIndex(n => new { n.Name, n.IsActive });

        // APPItem
        modelBuilder.Entity<APPItem>()
            .Property(e => e.PAPCode)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<APPItem>()
            .Property(e => e.Remarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<APPItem>()
            .Property(e => e.BidEvaluationCriteria)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<APPItem>()
            .Property(e => e.ProcurementStrategies)
            .HasConversion(
                v => v == null ? null : string.Join(',', v.Select(x => x.ToString())),
                v => v == null ? null : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(x => (ProcurementStrategy)Enum.Parse(typeof(ProcurementStrategy), x)).ToList()
            )
            .Metadata.SetValueComparer(
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<ProcurementStrategy>?>(
                    (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                    c => c == null ? 0 : c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c == null ? null : c.ToList()
                )
            );

        modelBuilder.Entity<APPItem>()
            .HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APPItem>()
            .HasOne(e => e.ProcurementMode)
            .WithMany(p => p.APPItems)
            .HasForeignKey(e => e.ProcurementModeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APPItem>()
            .HasIndex(e => e.APPId);

        modelBuilder.Entity<APPItem>()
            .HasIndex(e => e.PPMPItemId);

        modelBuilder.Entity<APPItem>()
            .HasIndex(e => e.FundSourceId);

        modelBuilder.Entity<APPItem>()
            .HasIndex(e => e.OfficeId);

        // APPProcurementSchedule
        modelBuilder.Entity<APPProcurementSchedule>()
            .HasIndex(e => e.PPMPItemId);

        modelBuilder.Entity<APPProcurementSchedule>()
            .HasIndex(e => e.ProcurementActivityTypeId);

        modelBuilder.Entity<APPProcurementSchedule>()
            .HasIndex(e => e.ScheduledDate);

        // OPCRActivityMOV
        modelBuilder.Entity<OPCRActivityMOV>()
            .Property(e => e.FileName)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<OPCRActivityMOV>()
            .Property(e => e.Url)
            .HasMaxLength(1000);

        modelBuilder.Entity<OPCRActivityMOV>()
            .HasIndex(e => e.OPCRActivityId);

        modelBuilder.Entity<OPCRActivityMOV>()
            .HasIndex(e => e.UploadedDate);

        // OPCRActivityRating
        modelBuilder.Entity<OPCRActivityRating>()
            .Property(e => e.Remarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<OPCRActivityRating>()
            .HasIndex(e => new { e.OPCRActivityId, e.PerformanceMeasureId });

        // OPCRActivityEvaluation
        modelBuilder.Entity<OPCRActivityEvaluation>()
            .Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<OPCRActivityEvaluation>()
            .Property(e => e.Remarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<OPCRActivityEvaluation>()
            .HasIndex(e => e.OPCRActivityRatingId);

        modelBuilder.Entity<OPCRActivityEvaluation>()
            .HasIndex(e => e.Status);

        modelBuilder.Entity<OPCRActivityEvaluation>()
            .HasIndex(e => e.EvaluatedDate);

        // APP (Annual Procurement Plan)
        modelBuilder.Entity<APP>()
            .Property(e => e.APPNumber)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<APP>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<APP>()
            .Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<APP>()
            .Property(e => e.Remarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<APP>()
            .Property(e => e.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<APP>()
            .HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APP>()
            .HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APP>()
            .HasIndex(e => e.APPNumber)
            .IsUnique();

        modelBuilder.Entity<APP>()
            .HasIndex(e => e.FiscalYearId);

        modelBuilder.Entity<APP>()
            .HasIndex(e => e.OfficeId);

        // APPPPMP
        modelBuilder.Entity<APPPPMP>()
            .HasOne(e => e.APP)
            .WithMany(a => a.APPPPMPs)
            .HasForeignKey(e => e.APPId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<APPPPMP>()
            .HasOne(e => e.PPMP)
            .WithMany()
            .HasForeignKey(e => e.PPMPId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APPPPMP>()
            .HasIndex(e => new { e.APPId, e.PPMPId })
            .IsUnique();

        modelBuilder.Entity<APPPPMP>()
            .HasIndex(e => e.PPMPId);

        modelBuilder.Entity<APPPPMP>()
            .ToTable("APP_PPMP_Selections", "planning");

        // OPCRItemRating
        modelBuilder.Entity<OPCRItemRating>()
            .HasOne(oir => oir.OPCRItem)
            .WithMany(i => i.OPCRItemRatings)
            .HasForeignKey(oir => oir.OPCRItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OPCRItemRating>()
            .HasOne(oir => oir.FYActiveKPIMeasurement)
            .WithMany(m => m.OPCRItemRatings)
            .HasForeignKey(oir => oir.FYActiveKPIMeasurementId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OPCRItemRating>()
            .Property(oir => oir.Dimension)
            .HasConversion<string>()
            .HasMaxLength(100);

        modelBuilder.Entity<OPCRItemRating>()
            .Property(oir => oir.SelfRating)
            .HasPrecision(5, 2);

        modelBuilder.Entity<OPCRItemRating>()
            .Property(oir => oir.PMTRating)
            .HasPrecision(5, 2);

        modelBuilder.Entity<OPCRItemRating>()
            .Property(oir => oir.PMTRemark)
            .HasMaxLength(1000);

        modelBuilder.Entity<OPCRItemRating>()
            .HasIndex(oir => oir.OPCRItemId);

        modelBuilder.Entity<OPCRItemRating>()
            .HasIndex(oir => new { oir.OPCRItemId, oir.FYActiveKPIMeasurementId, oir.Dimension })
            .IsUnique();

        // OPCRItemMOV
        modelBuilder.Entity<OPCRItemMOV>()
            .HasOne(oim => oim.OPCRItem)
            .WithMany(i => i.OPCRItemMOVs)
            .HasForeignKey(oim => oim.OPCRItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OPCRItemMOV>()
            .HasOne(oim => oim.FYActiveKPIMeasurement)
            .WithMany(m => m.OPCRItemMOVs)
            .HasForeignKey(oim => oim.FYActiveKPIMeasurementId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OPCRItemMOV>()
            .Property(oim => oim.RequirementName)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<OPCRItemMOV>()
            .Property(oim => oim.AttachedUrl)
            .HasMaxLength(2048);

        modelBuilder.Entity<OPCRItemMOV>()
            .HasIndex(oim => oim.OPCRItemId);

        modelBuilder.Entity<OPCRItemMOV>()
            .HasIndex(oim => new { oim.OPCRItemId, oim.FYActiveKPIMeasurementId, oim.RequirementName })
            .IsUnique();

        // MarketScopingParameter -> MarketScopingParameterSettings
        modelBuilder.Entity<MarketScopingParameter>()
            .HasOne(msp => msp.ParameterSettings)
            .WithMany(msps => msps.MarketScopingParameters)
            .HasForeignKey(msp => msp.ParameterSettingsId)
            .OnDelete(DeleteBehavior.Restrict);

        // MarketScopingActivity -> MarketScopingActivitySettings
        modelBuilder.Entity<MarketScopingActivity>()
            .HasOne(msa => msa.ActivitySettings)
            .WithMany(msas => msas.MarketScopingActivities)
            .HasForeignKey(msa => msa.ActivitySettingsId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Agency>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(500).IsRequired();
            e.Property(x => x.Address).HasMaxLength(1000);
            e.Property(x => x.LogoImage).HasColumnType("bytea");
        });

        modelBuilder.Entity<GeneratedDocument>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.StoragePath).HasMaxLength(1000);
            e.Property(x => x.FileName).HasMaxLength(500);
            e.Property(x => x.FiscalYear).HasMaxLength(10);
            e.Property(x => x.GeneratedBy).HasMaxLength(200);
            e.HasOne(x => x.Office).WithMany().HasForeignKey(x => x.OfficeId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OPCRConsolidation>()
            .HasOne(c => c.FiscalYear)
            .WithMany()
            .HasForeignKey(c => c.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.OPCRConsolidation)
            .WithMany(c => c.OPCRs)
            .HasForeignKey(o => o.OPCRConsolidationId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<BACResolution>(e =>
        {
            e.HasOne(r => r.ProcurementProject)
                .WithMany(p => p.BACResolutions)
                .HasForeignKey(r => r.ProcurementProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BiddingActivitySchedule>(e =>
        {
            e.HasOne(s => s.ProcurementProject)
                .WithMany(p => p.BiddingActivitySchedules)
                .HasForeignKey(s => s.ProcurementProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(s => s.ProcurementActivityType)
                .WithMany()
                .HasForeignKey(s => s.ProcurementActivityTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DirectContracting>(e =>
        {
            e.HasOne(dc => dc.BACResolution)
                .WithMany()
                .HasForeignKey(dc => dc.BACResolutionId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(dc => dc.ExclusiveSupplier)
                .WithMany()
                .HasForeignKey(dc => dc.ExclusiveSupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(dc => dc.TotalABC)
                .HasPrecision(18, 2);

            e.Property(dc => dc.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            e.Property(dc => dc.ReviewRemarks)
                .HasMaxLength(1000);
        });

        modelBuilder.Entity<DirectContractingProposal>(e =>
        {
            e.HasOne(dcp => dcp.DirectContracting)
                .WithOne(dc => dc.Proposal)
                .HasForeignKey<DirectContractingProposal>(dcp => dcp.DirectContractingId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(dcp => dcp.Supplier)
                .WithMany()
                .HasForeignKey(dcp => dcp.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(dcp => dcp.TotalProposalAmount)
                .HasPrecision(18, 2);
        });

        modelBuilder.Entity<DirectContractingProposalItem>(e =>
        {
            e.HasOne(dcpi => dcpi.Proposal)
                .WithMany(dcp => dcp.ProposalItems)
                .HasForeignKey(dcpi => dcpi.ProposalId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(dcpi => dcpi.CPRItem)
                .WithMany()
                .HasForeignKey(dcpi => dcpi.CPRItemId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(dcpi => dcpi.UnitBid)
                .HasPrecision(18, 2);

            e.Property(dcpi => dcpi.TotalBid)
                .HasPrecision(18, 2);
        });

        modelBuilder.Entity<SupplierBid>(e =>
        {
            e.HasOne(sb => sb.ProcurementProject)
                .WithMany()
                .HasForeignKey(sb => sb.ProcurementProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(sb => sb.Supplier)
                .WithMany()
                .HasForeignKey(sb => sb.SupplierId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SupplierBidItem>(e =>
        {
            e.HasOne(sbi => sbi.SupplierBid)
                .WithMany(sb => sb.SupplierBidItems)
                .HasForeignKey(sbi => sbi.SupplierBidId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(sbi => sbi.APPItem)
                .WithMany()
                .HasForeignKey(sbi => sbi.APPItemId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(sbi => sbi.UnitPrice)
                .HasPrecision(18, 2);
        });

        modelBuilder.Entity<AOBProcurementProjectMapping>(e =>
        {
            e.HasKey(m => m.Id);

            e.HasOne(m => m.AOB)
                .WithMany(a => a.AOBProcurementProjectMappings)
                .HasForeignKey(m => m.AOBId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(m => m.ProcurementProject)
                .WithMany()
                .HasForeignKey(m => m.ProcurementProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AOBAwardedItem>(e =>
        {
            e.HasOne(ai => ai.AOB)
                .WithMany(a => a.AOBAwardedItems)
                .HasForeignKey(ai => ai.AOBId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ai => ai.APPItem)
                .WithMany()
                .HasForeignKey(ai => ai.APPItemId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(ai => ai.WinningSupplier)
                .WithMany()
                .HasForeignKey(ai => ai.WinningSupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Property(ai => ai.AwardedUnitPrice)
                .HasPrecision(18, 2);

            e.Property(ai => ai.Score)
                .HasPrecision(18, 4);
        });

        // PurchaseRequest
        modelBuilder.Entity<PurchaseRequest>()
            .HasOne(pr => pr.Office)
            .WithMany()
            .HasForeignKey(pr => pr.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseRequest>()
            .HasOne(pr => pr.FundCluster)
            .WithMany()
            .HasForeignKey(pr => pr.FundClusterId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<PurchaseRequest>()
            .HasOne(pr => pr.PPMP)
            .WithMany()
            .HasForeignKey(pr => pr.PPMPId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<PurchaseRequest>()
            .HasOne(pr => pr.UACSCodeCombination)
            .WithMany()
            .HasForeignKey(pr => pr.UACSCodeCombinationId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<PurchaseRequest>()
            .HasOne(pr => pr.ProcurementCategory)
            .WithMany()
            .HasForeignKey(pr => pr.ProcurementCategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<PurchaseRequest>()
            .HasMany(pr => pr.PRItems)
            .WithOne(i => i.PurchaseRequest)
            .HasForeignKey(i => i.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PurchaseRequest>()
            .HasMany(pr => pr.ApprovalEvents)
            .WithOne()
            .HasForeignKey("PurchaseRequestId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        modelBuilder.Entity<PurchaseRequest>()
            .HasIndex(pr => pr.PRNumber)
            .IsUnique();

        modelBuilder.Entity<PurchaseRequest>()
            .HasIndex(pr => pr.OfficeId);

        modelBuilder.Entity<PurchaseRequest>()
            .Property(pr => pr.TotalAmount)
            .HasPrecision(18, 2);

        // PRItem
        modelBuilder.Entity<PRItem>()
            .HasOne(i => i.PurchaseRequest)
            .WithMany(pr => pr.PRItems)
            .HasForeignKey(i => i.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PRItem>()
            .HasOne(i => i.PPMPItem)
            .WithMany()
            .HasForeignKey(i => i.PPMPItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PRItem>()
            .HasMany(i => i.MonthlyQuantities)
            .WithOne(m => m.PRItem)
            .HasForeignKey(m => m.PRItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PRItem>()
            .Property(i => i.UnitCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PRItem>()
            .Property(i => i.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<PRItem>()
            .HasIndex(i => i.PurchaseRequestId);

        modelBuilder.Entity<PRItem>()
            .HasIndex(i => i.PPMPItemId);

        // PRItemMonthlyQuantity
        modelBuilder.Entity<PRItemMonthlyQuantity>()
            .HasOne(m => m.PRItem)
            .WithMany(i => i.MonthlyQuantities)
            .HasForeignKey(m => m.PRItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PRItemMonthlyQuantity>()
            .HasIndex(m => new { m.PRItemId, m.Month })
            .IsUnique();

        // ConsolidatedPR
        modelBuilder.Entity<ConsolidatedPR>()
            .HasMany(cpr => cpr.ConsolidatedPRItems)
            .WithOne(ci => ci.ConsolidatedPR)
            .HasForeignKey(ci => ci.ConsolidatedPRId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ConsolidatedPR>()
            .HasMany(cpr => cpr.ApprovalEvents)
            .WithOne()
            .HasForeignKey("ConsolidatedPRId")
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        modelBuilder.Entity<ConsolidatedPR>()
            .HasIndex(cpr => cpr.CPRNumber)
            .IsUnique();

        modelBuilder.Entity<ConsolidatedPR>()
            .Property(cpr => cpr.TotalAmount)
            .HasPrecision(18, 2);

        // ConsolidatedPRItem
        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasOne(ci => ci.ConsolidatedPR)
            .WithMany(cpr => cpr.ConsolidatedPRItems)
            .HasForeignKey(ci => ci.ConsolidatedPRId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasOne(ci => ci.PurchaseRequest)
            .WithMany()
            .HasForeignKey(ci => ci.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasOne(ci => ci.PRItem)
            .WithMany()
            .HasForeignKey(ci => ci.PRItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasOne(ci => ci.ProcurementMode)
            .WithMany()
            .HasForeignKey(ci => ci.ProcurementModeId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasIndex(ci => ci.ConsolidatedPRId);

        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasIndex(ci => ci.PurchaseRequestId);

        modelBuilder.Entity<ConsolidatedPRItem>()
            .HasIndex(ci => new { ci.ConsolidatedPRId, ci.PRItemId })
            .IsUnique();
        // ── Bidding Document Library ──────────────────────────────────────────────

        modelBuilder.Entity<MasterDocumentType>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);

            e.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(256);

            e.Property(x => x.Description)
                .HasMaxLength(1000);

            e.Property(x => x.TemplateFileUrl)
                .HasMaxLength(2048);

            e.HasIndex(x => x.Name)
                .IsUnique();

            e.HasIndex(x => x.EnvelopeType);
        });

        modelBuilder.Entity<DocumentProfile>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);

            e.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(256);

            e.Property(x => x.Description)
                .HasMaxLength(1000);

            e.Property(x => x.ProcurementCategory)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(x => x.Name)
                .IsUnique();

            e.HasMany(p => p.DocumentProfileItems)
                .WithOne(i => i.DocumentProfile)
                .HasForeignKey(i => i.DocumentProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentProfileItem>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);

            e.HasOne(i => i.MasterDocumentType)
                .WithMany(d => d.DocumentProfileItems)
                .HasForeignKey(i => i.MasterDocumentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.DocumentProfileId, x.MasterDocumentTypeId })
                .IsUnique();
        });

        modelBuilder.Entity<ProjectDocumentChecklist>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);

            e.Property(x => x.CustomDocumentName)
                .HasMaxLength(256);

            e.Property(x => x.CustomTemplateFileUrl)
                .HasMaxLength(2048);

            e.HasOne(c => c.ProcurementProject)
                .WithMany(p => p.ProjectDocumentChecklists)   // ← FIXED: now points to the named collection
                .HasForeignKey(c => c.ProcurementProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.MasterDocumentType)
                .WithMany(d => d.ProjectDocumentChecklists)
                .HasForeignKey(c => c.MasterDocumentTypeId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.ProcurementProjectId, x.EnvelopeType });
        });

        modelBuilder.Entity<LineItemBudget>()
            .Ignore(e => e.TotalAmount);

        modelBuilder.Entity<ProcurementProject>(e =>
        {
            e.HasIndex(p => p.ConsolidatedPRId)
                .IsUnique();
        });

        base.OnModelCreating(modelBuilder);

        // APR (Agency Purchase Request)
        modelBuilder.Entity<APR>()
            .Property(e => e.APRNumber)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<APR>()
            .Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<APR>()
            .Property(e => e.AgencyControlNumber)
            .HasMaxLength(100);

        modelBuilder.Entity<APR>()
            .Property(e => e.AgencyAccountCode)
            .HasMaxLength(100);

        modelBuilder.Entity<APR>()
            .Property(e => e.Description)
            .HasMaxLength(1000);

        modelBuilder.Entity<APR>()
            .Property(e => e.AdditionalRemarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<APR>()
            .Property(e => e.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<APR>()
            .Property(e => e.ModeOfDelivery)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<APR>()
            .Property(e => e.InsufficientFundsAction)
            .HasConversion<string>()
            .HasMaxLength(50);

        modelBuilder.Entity<APR>()
            .HasOne(e => e.APP)
            .WithMany()
            .HasForeignKey(e => e.APPId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APR>()
            .HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APR>()
            .HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);

        // Safety net: DB-level uniqueness is the final guard against duplicate APRNumbers
        // under concurrent submissions (mirrors APP.APPNumber / PurchaseRequest.PRNumber /
        // ConsolidatedPR.CPRNumber convention — no sequence/lock table exists in this codebase).
        modelBuilder.Entity<APR>()
            .HasIndex(e => e.APRNumber)
            .IsUnique();

        modelBuilder.Entity<APR>()
            .HasIndex(e => e.APPId);

        modelBuilder.Entity<APR>()
            .HasIndex(e => e.OfficeId);

        modelBuilder.Entity<APR>()
            .HasIndex(e => e.FiscalYearId);

        modelBuilder.Entity<APR>()
            .HasIndex(e => e.Status);

        // APRItem
        modelBuilder.Entity<APRItem>()
            .Property(e => e.QuantityRequested)
            .HasPrecision(18, 4);

        modelBuilder.Entity<APRItem>()
            .Property(e => e.UnitCost)
            .HasPrecision(18, 4);

        modelBuilder.Entity<APRItem>()
            .Property(e => e.TotalCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<APRItem>()
            .HasOne(e => e.APR)
            .WithMany(a => a.APRItems)
            .HasForeignKey(e => e.APRId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<APRItem>()
            .HasOne(e => e.APPItem)
            .WithMany()
            .HasForeignKey(e => e.APPItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APRItem>()
            .HasOne(e => e.PPMPItem)
            .WithMany()
            .HasForeignKey(e => e.PPMPItemId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APRItem>()
            .ToTable(t => t.HasCheckConstraint("CK_APRItem_TotalCost", "\"TotalCost\" >= 0"));

        modelBuilder.Entity<APRItem>()
            .HasIndex(e => e.APRId);

        modelBuilder.Entity<APRItem>()
            .HasIndex(e => e.APPItemId);

        modelBuilder.Entity<APRItem>()
            .HasIndex(e => e.PPMPItemId);

        // APRItemMilestone
        modelBuilder.Entity<APRItemMilestone>()
            .Property(e => e.Remarks)
            .HasMaxLength(1000);

        modelBuilder.Entity<APRItemMilestone>()
            .HasOne(e => e.APRItem)
            .WithMany(i => i.APRItemMilestones)
            .HasForeignKey(e => e.APRItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<APRItemMilestone>()
            .HasOne(e => e.ProcurementActivityType)
            .WithMany()
            .HasForeignKey(e => e.ProcurementActivityTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<APRItemMilestone>()
            .HasIndex(e => e.APRItemId);

        modelBuilder.Entity<APRItemMilestone>()
            .HasIndex(e => e.ProcurementActivityTypeId);

        modelBuilder.Entity<APRItemMilestone>()
            .HasIndex(e => e.ScheduledDate);
    }
}
