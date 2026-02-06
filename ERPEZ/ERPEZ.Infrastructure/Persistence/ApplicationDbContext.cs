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
    public DbSet<OPCRPAP>? OPCRPAPs { get; set; }
    public DbSet<SDG>? SDGs { get; set; }
    public DbSet<WFPPAP>? WFPPAPs { get; set; }
    public DbSet<WFPPAPDepartment>? WFPPAPDepartments { get; set; }

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
    public DbSet<ProcurementMode>? ProcurementModes { get; set; }
    public DbSet<ProcurementActivityType>? ProcurementActivityTypes { get; set; }
    public DbSet<CSEItem>? CSEItems { get; set; }
    public DbSet<NonCSEItem>? NonCSEItems { get; set; }

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
            .HasMany(du => du.WFPs)
            .WithOne(wfp => wfp.DeliveryUnit)
            .HasForeignKey(wfp => wfp.DeliveryUnitId);

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.OPCRs)
            .WithOne(opcr => opcr.DeliveryUnit)
            .HasForeignKey(opcr => opcr.DeliveryUnitId);

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

        //WFP
        modelBuilder.Entity<WFP>()
            .HasIndex(w => new { w.DeliveryUnitId, w.FiscalYearId });

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.DeliveryUnit)
            .WithMany(du => du.WFPs)
            .HasForeignKey(w => w.DeliveryUnitId);

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
            .HasIndex(o => new { o.DeliveryUnitId, o.FiscalYearId })
            .IsUnique();

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.DeliveryUnit)
            .WithMany(d => d.OPCRs)
            .HasForeignKey(o => o.DeliveryUnitId);

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.FiscalYear)
            .WithMany()
            .HasForeignKey(o => o.FiscalYearId)
            .IsRequired();

        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.OPCREvaluations)
            .WithOne(e => e.OPCR)
            .HasForeignKey(e => e.OPCRId);

        // OPCRPAPDepartment
        modelBuilder.Entity<OPCRPAPDepartment>()
            .HasIndex(d => new { d.OPCRActivityId, d.DeliveryUnitId })
            .IsUnique();

        modelBuilder.Entity<OPCRPAPDepartment>()
            .HasOne(d => d.OPCRActivity)
            .WithMany(a => a.OPCRPAPDepartments)
            .HasForeignKey(d => d.OPCRActivityId);

        modelBuilder.Entity<OPCRPAPDepartment>()
            .HasOne(d => d.DeliveryUnit)
            .WithMany(d => d.OPCRPAPDepartments)
            .HasForeignKey(d => d.DeliveryUnitId);



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
            .HasOne(a => a.OPCR)
            .WithMany(o => o.OPCRActivities)
            .HasForeignKey(a => a.OPCRId);

        modelBuilder.Entity<OPCRActivity>()
            .HasOne(a => a.DUKPITargetAssignment)
            .WithMany()
            .HasForeignKey(a => a.DUKPITargetAssignmentId);

        modelBuilder.Entity<OPCRActivity>()
            .HasIndex(a => new { a.OPCRId, a.DUKPITargetAssignmentId, a.Name })
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

        // OPCRPAP
        modelBuilder.Entity<OPCRPAP>()
            .HasOne(p => p.OPCR)
            .WithMany()
            .HasForeignKey(p => p.OPCRId);

        modelBuilder.Entity<OPCRPAP>()
            .HasOne(p => p.KPI)
            .WithMany()
            .HasForeignKey(p => p.KPIId);

        //Cluster
        modelBuilder.Entity<Cluster>()
            .HasIndex(c => c.Name)
            .IsUnique();

        modelBuilder.Entity<Cluster>()
            .Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(256);

        modelBuilder.Entity<Cluster>()
            .Property(c => c.Description)
            .HasMaxLength(1000);

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

        base.OnModelCreating(modelBuilder);
    }
}
