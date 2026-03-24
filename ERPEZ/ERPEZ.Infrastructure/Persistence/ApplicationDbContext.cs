using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Object = ERPEZ.Domain.Entities.Planning.Object;
using Attribute = ERPEZ.Domain.Entities.Planning.Attribute;

namespace ERPEZ.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    //Planning
    public DbSet<WFPObjectiveTargetExpenditure>? WFPObjectiveTargetExpenditures { get; set; }
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
    public DbSet<WFPObjectiveTarget>? WFPObjectiveTargets { get; set; }
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
    public DbSet<LineItemBudget>? LineItemBudgets { get; set; }
    public DbSet<PPMP>? PPMPs { get; set; }
    public DbSet<APP>? APPs { get; set; }
    public DbSet<LineItemBudgetActivity>? LineItemBudgetActivities { get; set; }
    public DbSet<LineItemBudgetDetail>? LineItemBudgetDetails { get; set; }

    //Procurement
    public DbSet<ProcurementCategory>? ProcurementCategories { get; set; }
    public DbSet<ProcurementMode>? ProcurementModes { get; set; }
    public DbSet<ProcurementModeThreshold>? ProcurementModeThresholds { get; set; }
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
    public DbSet<APPItem>? APPItems { get; set; }
    public DbSet<APPProcurementSchedule>? APPProcurementSchedules { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply default conventions for all entities
        modelBuilder.ConfigureDefaultEntityConventions();

        // Apply configurations from separate configuration files
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        //KPI
        modelBuilder.Entity<KPI>()
        .HasIndex(k => new { k.Name });

        modelBuilder.Entity<KPI>()
            .HasIndex(k => k.Name)
            .IsUnique();

        // KPI → KPIPerformanceMeasures
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
            .HasMany(o => o.WFPObjectiveTargetExpenditures)
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
            .HasIndex(w => new { w.OfficeId, w.FiscalYearId });

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.Office)
            .WithMany(o => o.WFPs)
            .HasForeignKey(w => w.OfficeId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.FiscalYear)
            .WithMany()
            .HasForeignKey(w => w.FiscalYearId);

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
            .HasMany(o => o.WFPObjectiveTargets)
            .WithOne(wot => wot.WFPObjective);

        modelBuilder.Entity<WFPObjective>()
            .Property(o => o.Weight)
            .HasColumnType("decimal(18, 2)");

        //WFPObjectiveTarget
        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasIndex(t => new { t.WFPObjectiveId, t.ActivityName })
            .IsUnique();

        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasOne(t => t.WFPObjective)
            .WithMany(o => o.WFPObjectiveTargets)
            .HasForeignKey(t => t.WFPObjectiveId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasMany(t => t.WFPObjectiveTargetExpenditures)
            .WithOne(abr => abr.WFPObjectiveTarget);

        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasMany(t => t.WFPObjectiveTimelines)
            .WithOne(wot => wot.WFPObjectiveTarget);

        modelBuilder.Entity<WFPObjectiveTarget>()
            .Property(t => t.Weight)
            .HasColumnType("decimal(18, 2)");

        //WFPObjectiveTimeline
        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasIndex(t => new { t.WFPObjectiveTargetId, t.StartDate })
            .IsUnique();

        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasOne(t => t.WFPObjectiveTarget)
            .WithMany(ot => ot.WFPObjectiveTimelines)
            .HasForeignKey(t => t.WFPObjectiveTargetId)
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

        //WFPObjectiveTargetExpenditure
        modelBuilder.Entity<WFPObjectiveTargetExpenditure>()
            .HasIndex(ab => new { ab.WFPObjectiveTargetId, ab.ObjectId, ab.ItemDescription });

        modelBuilder.Entity<WFPObjectiveTargetExpenditure>()
            .HasOne(ab => ab.WFPObjectiveTarget)
            .WithMany(ot => ot.WFPObjectiveTargetExpenditures)
            .HasForeignKey(ab => ab.WFPObjectiveTargetId);

        modelBuilder.Entity<WFPObjectiveTargetExpenditure>()
            .HasOne(ab => ab.Object)
            .WithMany(o => o.WFPObjectiveTargetExpenditures)
            .HasForeignKey(ab => ab.ObjectId);

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

        //SDG
        modelBuilder.Entity<SDG>()
            .Property(s => s.Description)
            .IsRequired()
            .HasMaxLength(1000);

        //WFPObjectiveTarget
        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasOne(wot => wot.WFPObjective)
            .WithMany(wo => wo.WFPObjectiveTargets)
            .HasForeignKey(wot => wot.WFPObjectiveId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasMany(wot => wot.WFPObjectiveTimelines)
            .WithOne(wotl => wotl.WFPObjectiveTarget)
            .HasForeignKey(wotl => wotl.WFPObjectiveTargetId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasMany(wot => wot.WFPObjectiveTargetExpenditures)
            .WithOne(abr => abr.WFPObjectiveTarget)
            .HasForeignKey(abr => abr.WFPObjectiveTargetId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTarget>()
            .HasIndex(wot => new { wot.WFPObjectiveId, wot.ActivityName, wot.Indicator })
            .IsUnique();

        //WFPObjectiveTimeline
        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasOne(wotl => wotl.WFPObjectiveTarget)
            .WithMany(wot => wot.WFPObjectiveTimelines)
            .HasForeignKey(wotl => wotl.WFPObjectiveTargetId)
            .IsRequired();

        modelBuilder.Entity<WFPObjectiveTimeline>()
            .HasIndex(wotl => new { wotl.WFPObjectiveTargetId, wotl.StartDate, wotl.EndDate })
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
            .HasIndex(km => km.Dimension);

        modelBuilder.Entity<KPIMeasurement>()
            .Property(km => km.MOVs)
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
            .HasIndex(fm => fm.Dimension);

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

        base.OnModelCreating(modelBuilder);
    }
}
