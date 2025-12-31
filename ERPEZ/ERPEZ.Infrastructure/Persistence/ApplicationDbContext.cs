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
    public DbSet<DUAllocation>? DUAllocations { get; set; }
    public DbSet<DUFundAllocation>? DUFundAllocations { get; set; }
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
    public DbSet<ReceivedFund>? ReceivedFunds { get; set; }
    public DbSet<Transaction>? Transactions { get; set; }
    public DbSet<WFP>? WFPs { get; set; }
    public DbSet<WFPObjective>? WFPObjectives { get; set; }
    public DbSet<WFPObjectiveTarget>? WFPObjectiveTargets { get; set; }
    public DbSet<WFPObjectiveTimeline>? WFPObjectiveTimelines { get; set; }
    public DbSet<Attribute>? Attributes { get; set; }
    public DbSet<Cluster>? Clusters { get; set; }
    public DbSet<DeliveryUnit>? DeliveryUnits { get; set; }
    public DbSet<DUKPIAssignment>? DUKPIAssignments { get; set; }
    public DbSet<FiscalYear>? FiscalYears { get; set; }
    public DbSet<OPCRPAP>? OPCRPAPs { get; set; }
    public DbSet<SDG>? SDGs { get; set; }
    public DbSet<WFPPAP>? WFPPAPs { get; set; }
    public DbSet<WFPPAPDepartment>? WFPPAPDepartments { get; set; }

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
            .HasMany(k => k.MFOPAPs)
            .WithMany(m => m.KPIs);

        // DUKPIAssignment (Delivery Unit KPI Assignment)
        modelBuilder.Entity<DUKPIAssignment>()
            .HasOne(da => da.KPI)
            .WithMany(k => k.KPIAssignments)
            .HasForeignKey(da => da.KPIId)
            .IsRequired();

        modelBuilder.Entity<DUKPIAssignment>()
            .HasOne(da => da.DeliveryUnit)
            .WithMany()
            .HasForeignKey(da => da.DeliveryUnitId)
            .IsRequired();

        modelBuilder.Entity<DUKPIAssignment>()
            .HasOne(da => da.KPITarget)
            .WithMany()
            .HasForeignKey(da => da.KPITargetId)
            .IsRequired();

        modelBuilder.Entity<DUKPIAssignment>()
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
            .HasMany(f => f.ReceivedFunds)
            .WithOne(rf => rf.FundSource)
            .HasForeignKey(rf => rf.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FundSource>()
            .HasMany(f => f.Transactions)
            .WithOne(t => t.FundSource)
            .HasForeignKey(t => t.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FundSource>()
            .HasIndex(f => new { f.ParentId, f.Code })
            .IsUnique();

        //ReceivedFund
        modelBuilder.Entity<ReceivedFund>()
            .HasIndex(rf => new { rf.FundSourceId, rf.Amount });

        modelBuilder.Entity<ReceivedFund>()
            .HasMany(rf => rf.DUFundAllocations)
            .WithOne(du => du.ReceivedFund)
            .HasForeignKey(du => du.ReceivedFundId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ReceivedFund>()
            .HasOne(rf => rf.FundSource)
            .WithMany(f => f.ReceivedFunds)
            .HasForeignKey(rf => rf.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        //DUAllocation
        modelBuilder.Entity<DUAllocation>()
            .HasIndex(dua => new { dua.DeliveryUnitId, dua.Purpose });

        modelBuilder.Entity<DUAllocation>()
            .HasMany(du => du.DUFundAllocations)
            .WithOne(fa => fa.DUAllocation)
            .HasForeignKey(fa => fa.DUAllocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DUAllocation>()
            .HasOne(du => du.DeliveryUnit)
            .WithMany(d => d.DUAllocations)
            .HasForeignKey(dua => dua.DeliveryUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        //DUFund Allocation
        modelBuilder.Entity<DUFundAllocation>()
            .HasIndex(df => new { df.DUAllocationId, df.ReceivedFundId })
            .IsUnique(false);

        modelBuilder.Entity<DUFundAllocation>()
            .HasOne(df => df.DUAllocation)
            .WithMany(du => du.DUFundAllocations)
            .HasForeignKey(df => df.DUAllocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DUFundAllocation>()
            .HasOne(df => df.ReceivedFund)
            .WithMany(rf => rf.DUFundAllocations)
            .HasForeignKey(df => df.ReceivedFundId)
            .OnDelete(DeleteBehavior.Restrict);

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

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.DUAllocations)
            .WithOne(dua => dua.DeliveryUnit)
            .HasForeignKey(dua => dua.DeliveryUnitId);

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.WFPs)
            .WithOne(wfp => wfp.DeliveryUnit)
            .HasForeignKey(wfp => wfp.DeliveryUnitId);

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.OPCRs)
            .WithOne(opcr => opcr.DeliveryUnit)
            .HasForeignKey(opcr => opcr.DeliveryUnitId);

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.KPIAssignments)
            .WithOne(kpia => kpia.DeliveryUnit)
            .HasForeignKey(kpia => kpia.DeliveryUnitId);

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

        // Implicit many-to-many between OPCR and DUKPIAssignment
        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.DUKPIAssignments)
            .WithMany(d => d.OPCRs);

        // OPCRActivity
        modelBuilder.Entity<OPCRActivity>()
            .HasOne(a => a.OPCR)
            .WithMany(o => o.OPCRActivities)
            .HasForeignKey(a => a.OPCRId);

        modelBuilder.Entity<OPCRActivity>()
            .HasOne(a => a.DUKPIAssignment)
            .WithMany()
            .HasForeignKey(a => a.DUKPIAssignmentId);

        modelBuilder.Entity<OPCRActivity>()
            .HasIndex(a => new { a.OPCRId, a.DUKPIAssignmentId, a.Name })
            .IsUnique();

        // OPCRRating
        modelBuilder.Entity<OPCRRating>()
            .HasIndex(r => new { r.OPCREvaluationId, r.PerformanceMeasureId, r.OPCRId, r.DUKPIAssignmentId })
            .IsUnique();

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.OPCR)
            .WithMany()
            .HasForeignKey(r => r.OPCRId);

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.DUKPIAssignment)
            .WithMany()
            .HasForeignKey(r => r.DUKPIAssignmentId);

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
