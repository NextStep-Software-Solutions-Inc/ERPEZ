using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Object = ERPEZ.Domain.Entities.Planning.Object;

namespace ERPEZ.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    //Planning
    public DbSet<ActivityBudgetRequirement> ActivityBudgetRequirements { get; set; }
    public DbSet<DUAllocation> DUAllocations { get; set; }
    public DbSet<DUFundAllocation> DUFundAllocations { get; set; }
    public DbSet<FunctionPercentageAllocation> FunctionPercentageAllocations { get; set; }
    public DbSet<FundSource> FundSources { get; set; }
    public DbSet<KPI> KPIs { get; set; }
    public DbSet<KPIModeOfVerification> KPIModeOfVerifications { get; set; }
    public DbSet<KPIRating> KPIRatings { get; set; }
    public DbSet<KPITarget> KPITargets { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<MFOPAP> MFOPAPs { get; set; }
    public DbSet<Object> Objects { get; set; }
    public DbSet<Office> Offices { get; set; }
    public DbSet<OPCR> OPCRs { get; set; }
    public DbSet<OPCRActivity> OPCRActivities { get; set; }
    public DbSet<OPCREvaluation> OPCREvaluations { get; set; }
    public DbSet<OPCRRating> OPCRRatings { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<PerformanceMeasure> PerformanceMeasures { get; set; }
    public DbSet<ReceivedFund> ReceivedFunds { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<WFP> WFPs { get; set; }
    public DbSet<WFPActivity> WFPActivities { get; set; }
    public DbSet<WFPObjective> WFPObjectives { get; set; }
    public DbSet<WFPOutcome> WFPOutcomes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        const string schemaName = "catalog";
        //const string planningSchemaName = "planning";
        //const string procurementSchemaName = "procurement";
        //const string samsSchemaName = "sams";

        modelBuilder.HasDefaultSchema(schemaName);

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var idProperty = entity.FindProperty("Id");

            if (idProperty == null)
            {
                continue;
            }

            if (idProperty.ClrType == typeof(Guid))
            {
                idProperty.SetDefaultValueSql("gen_random_uuid()");
            }

            entity.SetPrimaryKey(idProperty);

            idProperty.ValueGenerated = ValueGenerated.OnAdd;
        }
        //FunctionPercentageAllocation
        modelBuilder.Entity<FunctionPercentageAllocation>()
            .HasIndex(f => new { f.Function, f.Name });

        modelBuilder.Entity<FunctionPercentageAllocation>()
            .HasMany(fp => fp.KPIs)
            .WithOne(k => k.FunctionPercentageAllocation)
            .HasForeignKey(k => k.FunctionPercentageAllocationId);
        //KPI
        modelBuilder.Entity<KPI>()
        .HasIndex(k => new { k.FunctionPercentageAllocationId, k.Name });

        modelBuilder.Entity<KPI>()
            .HasIndex(k => k.Name)
            .IsUnique();

        modelBuilder.Entity<KPI>()
            .HasMany(k => k.KPIRatings)
            .WithOne(kr => kr.KPI)
            .HasForeignKey(kr => kr.KPIId);

        modelBuilder.Entity<KPI>()
            .HasMany(k => k.KPITargets)
            .WithOne(kt => kt.KPI)
            .HasForeignKey(kt => kt.KPIId);

        modelBuilder.Entity<KPI>()
            .HasMany(k => k.KPIModeOfVerifications)
            .WithOne(kv => kv.KPI)
            .HasForeignKey(kv => kv.KPIId);

        //KPI Assignment
        modelBuilder.Entity<KPIAssignment>()
            .HasIndex(a => new { a.KPIId, a.DeliveryUnitId })
            .IsUnique();

        modelBuilder.Entity<KPIAssignment>()
            .HasOne(a => a.KPI)
            .WithMany(k => k.KPIAssignments)
            .HasForeignKey(a => a.KPIId);

        modelBuilder.Entity<KPIAssignment>()
            .HasOne(a => a.DeliveryUnit)
            .WithMany(d => d.KPIAssignments)
            .HasForeignKey(a => a.DeliveryUnitId);

        // KPIModeOfVerification
        modelBuilder.Entity<KPIModeOfVerification>()
            .HasIndex(mv => new { mv.KPIId, mv.Name })
            .IsUnique();

        modelBuilder.Entity<KPIModeOfVerification>()
            .HasOne(mv => mv.KPI)
            .WithMany(k => k.KPIModeOfVerifications)
            .HasForeignKey(mv => mv.KPIId);
        // KPIRating
        modelBuilder.Entity<KPIRating>()
            .HasIndex(r => new { r.KPIId, r.PerformanceMeasureId })
            .IsUnique();

        modelBuilder.Entity<KPIRating>()
            .HasOne(r => r.KPI)
            .WithMany(k => k.KPIRatings)
            .HasForeignKey(r => r.KPIId);

        modelBuilder.Entity<KPIRating>()
            .HasOne(r => r.PerformanceMeasure)
            .WithMany(pm => pm.KPIRatings)
            .HasForeignKey(r => r.PerformanceMeasureId);

        // KPITarget
        modelBuilder.Entity<KPITarget>()
            .HasIndex(t => new { t.KPIId, t.Period, t.QuarterName })
            .IsUnique();

        modelBuilder.Entity<KPITarget>()
            .HasOne(t => t.KPI)
            .WithMany(k => k.KPITargets)
            .HasForeignKey(t => t.KPIId);

        //PerformanceMeasure
        modelBuilder.Entity<PerformanceMeasure>()
            .HasIndex(pm => pm.Name)
            .IsUnique();

        modelBuilder.Entity<PerformanceMeasure>()
            .HasMany(pm => pm.KPIRatings)
            .WithOne(kr => kr.PerformanceMeasure)
            .HasForeignKey(kr => kr.PerformanceMeasureId);

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
            .HasMany(o => o.ActivityBudgetRequirements)
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
            .HasMany(rf => rf.DUAllocations)
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
            .HasIndex(dua => new { dua.ReceivedFundId, dua.DeliveryUnitId, dua.Purpose });

        modelBuilder.Entity<DUAllocation>()
            .HasMany(du => du.OPCRs)
            .WithOne(opcr => opcr.DUAllocation)
            .HasForeignKey(opcr => opcr.DUAllocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DUAllocation>()
            .HasMany(du => du.SubDUAllocations)
            .WithOne(sub => sub.DUAllocation)
            .HasForeignKey(sub => sub.DUAllocationId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<DUAllocation>()
            .HasMany(du => du.WFPs)
            .WithOne(wfp => wfp.DUAllocation)
            .HasForeignKey(wfp => wfp.DUAllocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DUAllocation>()
            .HasMany(du => du.DUFundAllocations)
            .WithOne(fa => fa.DUAllocation)
            .HasForeignKey(fa => fa.DUAllocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DUAllocation>()
            .HasOne(du => du.DeliveryUnit)
            .WithMany(d => d.DUAllocations)
            .HasForeignKey(du => du.DeliveryUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<DUAllocation>()
            .HasOne(du => du.ReceivedFund)
            .WithMany(rf => rf.DUAllocations)
            .HasForeignKey(du => du.ReceivedFundId)
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

        //Sub DU Allcation
        modelBuilder.Entity<SubDUAllocation>()
            .HasIndex(sda => new { sda.DUAllocationId, sda.SubDeliveryUnitId })
            .IsUnique();

        modelBuilder.Entity<SubDUAllocation>()
            .HasOne(sda => sda.DUAllocation)
            .WithMany(dua => dua.SubDUAllocations)
            .HasForeignKey(sda => sda.DUAllocationId);

        modelBuilder.Entity<SubDUAllocation>()
            .HasOne(sda => sda.SubDeliveryUnit)
            .WithMany(sdu => sdu.SubDUAllocations)
            .HasForeignKey(sda => sda.SubDeliveryUnitId);


        //DeliveryUnit
        modelBuilder.Entity<DeliveryUnit>()
            .HasIndex(du => new { du.OfficeId, du.ParentDUId });

        modelBuilder.Entity<DeliveryUnit>()
            .HasOne(du => du.Office)
            .WithMany(o => o.DeliveryUnits)
            .HasForeignKey(du => du.OfficeId);

        modelBuilder.Entity<DeliveryUnit>()
            .HasMany(du => du.SubDeliveryUnits)
            .WithOne(sdu => sdu.DeliveryUnit)
            .HasForeignKey(sdu => sdu.DeliveryUnitId);

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

        //Sub DeliveryUnit
        modelBuilder.Entity<SubDeliveryUnit>()
            .HasIndex(sdu => new { sdu.DeliveryUnitId, sdu.Name })
            .IsUnique();

        modelBuilder.Entity<SubDeliveryUnit>()
            .HasOne(sdu => sdu.DeliveryUnit)
            .WithMany(du => du.SubDeliveryUnits)
            .HasForeignKey(sdu => sdu.DeliveryUnitId);

        modelBuilder.Entity<SubDeliveryUnit>()
            .HasMany(sdu => sdu.SubDUAllocations)
            .WithOne(sdua => sdua.SubDeliveryUnit)
            .HasForeignKey(sdua => sdua.SubDeliveryUnitId);

        //WFP
        modelBuilder.Entity<WFP>()
            .HasIndex(w => new { w.DUAllocationId, w.DeliveryUnitId, w.FiscalYear });

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.DUAllocation)
            .WithMany(dua => dua.WFPs)
            .HasForeignKey(w => w.DUAllocationId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.DeliveryUnit)
            .WithMany(du => du.WFPs)
            .HasForeignKey(w => w.DeliveryUnitId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.WFPActivity)
            .WithOne(wa => wa.WFP)
            .HasForeignKey<WFPActivity>(wa => wa.WFPId);

        modelBuilder.Entity<WFP>()
            .HasOne(w => w.WFPObjective)
            .WithOne(wo => wo.WFP)
            .HasForeignKey<WFPObjective>(wo => wo.WFPId);

        //WFP Outcome
        modelBuilder.Entity<WFPOutcome>()
            .HasIndex(wo => new { wo.WFPObjectiveId, wo.Description });

        modelBuilder.Entity<WFPOutcome>()
            .HasOne(wo => wo.WFPObjective)
            .WithMany(o => o.WFPOutcomes)
            .HasForeignKey(wo => wo.WFPObjectiveId);

        modelBuilder.Entity<WFPOutcome>()
            .HasMany(wo => wo.WFPActivities)
            .WithOne(a => a.WFPOutcome)
            .HasForeignKey(a => a.WFPOutcomeId);

        modelBuilder.Entity<WFPOutcome>()
            .HasMany(wo => wo.WFPPAPs)
            .WithOne(p => p.WFPOutcome)
            .HasForeignKey(p => p.WFPOutcomeId);

        //WFPObjective
        modelBuilder.Entity<WFPObjective>()
            .HasIndex(o => new { o.WFPId, o.Description });

        modelBuilder.Entity<WFPObjective>()
            .HasOne(o => o.WFP)
            .WithOne(w => w.WFPObjective)
            .HasForeignKey<WFPObjective>(o => o.WFPId);

        modelBuilder.Entity<WFPObjective>()
            .HasMany(o => o.WFPOutcomes)
            .WithOne(wo => wo.WFPObjective)
            .HasForeignKey(wo => wo.WFPObjectiveId);

        //WFPPAP
        //modelBuilder.Entity<WFPPAP>()
        //    .HasIndex(p => new { p.WFPId, p.Name });

        //modelBuilder.Entity<WFPPAP>()
        //    .HasOne(p => p.WFP)
        //    .WithMany(w => w.WFPPAPs)
        //    .HasForeignKey(p => p.WFPId)
        //    .OnDelete(DeleteBehavior.Cascade);

        //modelBuilder.Entity<WFPPAP>()
        //    .HasOne(p => p.WFPOutcome)
        //    .WithMany(o => o.WFPPAPs)
        //    .HasForeignKey(p => p.WFPOutcomeId)
        //    .OnDelete(DeleteBehavior.SetNull);

        //modelBuilder.Entity<WFPPAP>()
        //    .HasMany(p => p.WFPPAPDepartments)
        //    .WithOne(d => d.WFPPAP)
        //    .HasForeignKey(d => d.WFPPAPId);

        //WFPPAPDepartment
        modelBuilder.Entity<WFPPAPDepartment>()
            .HasIndex(d => new { d.WFPPAPId, d.SubDeliveryUnitId })
            .IsUnique();

        modelBuilder.Entity<WFPPAPDepartment>()
            .HasOne(d => d.WFPPAP)
            .WithMany(p => p.WFPPAPDepartments)
            .HasForeignKey(d => d.WFPPAPId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WFPPAPDepartment>()
            .HasOne(d => d.SubDeliveryUnit)
            .WithMany()
            .HasForeignKey(d => d.SubDeliveryUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        //ActivityBudgetRequirement
        modelBuilder.Entity<ActivityBudgetRequirement>()
            .HasIndex(ab => new { ab.WFPActivityId, ab.ObjectId, ab.ItemDescription });

        modelBuilder.Entity<ActivityBudgetRequirement>()
            .HasOne(ab => ab.WFPActivity)
            .WithMany(a => a.ActivityBudgetRequirements)
            .HasForeignKey(ab => ab.WFPActivityId);

        modelBuilder.Entity<ActivityBudgetRequirement>()
            .HasOne(ab => ab.Object)
            .WithMany(o => o.ActivityBudgetRequirements)
            .HasForeignKey(ab => ab.ObjectId);

        // OPCR
        modelBuilder.Entity<OPCR>()
            .HasIndex(o => new { o.DUAllocationId, o.DeliveryUnitId, o.FiscalYear })
            .IsUnique();

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.DUAllocation)
            .WithMany(d => d.OPCRs)
            .HasForeignKey(o => o.DUAllocationId);

        modelBuilder.Entity<OPCR>()
            .HasOne(o => o.DeliveryUnit)
            .WithMany(d => d.OPCRs)
            .HasForeignKey(o => o.DeliveryUnitId);

        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.OPCREvaluations)
            .WithOne(e => e.OPCR)
            .HasForeignKey(e => e.OPCRId);

        modelBuilder.Entity<OPCR>()
            .HasMany(o => o.OPCRKPIs)
            .WithOne(k => k.OPCR)
            .HasForeignKey(k => k.OPCRId);

        // OPCRPAP
        //modelBuilder.Entity<OPCRPAP>()
        //    .HasOne(p => p.OPCRKPI)
        //    .WithMany(k => k.OPCRPAPs)
        //    .HasForeignKey(p => p.OPCRKPIId);

        //modelBuilder.Entity<OPCRPAP>()
        //    .HasMany(p => p.OPCRPAPDepartments)
        //    .WithOne(d => d.OPCRPAP)
        //    .HasForeignKey(d => d.OPCRPAPId);

        // OPCRKPI
        modelBuilder.Entity<OPCRKPI>()
            .HasIndex(o => new { o.OPCRId, o.KPIId })
            .IsUnique();

        modelBuilder.Entity<OPCRKPI>()
            .HasOne(o => o.OPCR)
            .WithMany(op => op.OPCRKPIs)
            .HasForeignKey(o => o.OPCRId);

        modelBuilder.Entity<OPCRKPI>()
            .HasOne(o => o.KPI)
            .WithMany(k => k.OPCRKPIs)
            .HasForeignKey(o => o.KPIId);

        modelBuilder.Entity<OPCRKPI>()
            .HasMany(o => o.OPCRActivities)
            .WithOne(a => a.OPCRKPI)
            .HasForeignKey(a => a.OPCRKPIId);

        //modelBuilder.Entity<OPCRKPI>()
        //    .HasMany(o => o.OPCRPAPs)
        //    .WithOne(p => p.OPCRKPI)
        //    .HasForeignKey(p => p.OPCRKPIId);

        modelBuilder.Entity<OPCRKPI>()
            .HasMany(o => o.OPCRRatings)
            .WithOne(r => r.OPCRKPI)
            .HasForeignKey(r => r.OPCRKPIId);

        // OPCRActivity
        modelBuilder.Entity<OPCRActivity>()
            .HasIndex(a => new { a.OPCRKPIId, a.Name });

        modelBuilder.Entity<OPCRActivity>()
            .HasOne(a => a.OPCRKPI)
            .WithMany(k => k.OPCRActivities)
            .HasForeignKey(a => a.OPCRKPIId);

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

        // OPCRKPI
        modelBuilder.Entity<OPCRKPI>()
            .HasIndex(k => new { k.OPCRId, k.KPIId })
            .IsUnique();

        modelBuilder.Entity<OPCRKPI>()
            .HasOne(k => k.OPCR)
            .WithMany(o => o.OPCRKPIs)
            .HasForeignKey(k => k.OPCRId);

        modelBuilder.Entity<OPCRKPI>()
            .HasOne(k => k.KPI)
            .WithMany()
            .HasForeignKey(k => k.KPIId);

        modelBuilder.Entity<OPCRKPI>()
            .HasMany(k => k.OPCRActivities)
            .WithOne(a => a.OPCRKPI)
            .HasForeignKey(a => a.OPCRKPIId);

        modelBuilder.Entity<OPCRKPI>()
            .HasMany(k => k.OPCRRatings)
            .WithOne(r => r.OPCRKPI)
            .HasForeignKey(r => r.OPCRKPIId);

        //OPCRPAPDepartment
        modelBuilder.Entity<OPCRActivity>()
            .HasMany(a => a.DeliveryUnits)
            .WithMany(d => d.OPCRActivities)
            .UsingEntity(j => j.ToTable("OPCRPAPDepartment"));

        // OPCRRating
        modelBuilder.Entity<OPCRRating>()
            .HasIndex(r => new { r.OPCREvaluationId, r.PerformanceMeasureId, r.OPCRKPIId })
            .IsUnique();

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.OPCRKPI)
            .WithMany(k => k.OPCRRatings)
            .HasForeignKey(r => r.OPCRKPIId);

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.OPCREvaluation)
            .WithMany(e => e.OPCRRatings)
            .HasForeignKey(r => r.OPCREvaluationId);

        modelBuilder.Entity<OPCRRating>()
            .HasOne(r => r.PerformanceMeasure)
            .WithMany(m => m.OPCRRatings)
            .HasForeignKey(r => r.PerformanceMeasureId);


        // MFOKPI
        modelBuilder.Entity<MFOKPI>()
            .HasIndex(m => new { m.MFOPAPId, m.KPIId })
            .IsUnique();

        modelBuilder.Entity<MFOKPI>()
            .HasOne(m => m.MFOPAP)
            .WithMany(p => p.MFOKPIs)
            .HasForeignKey(m => m.MFOPAPId);

        modelBuilder.Entity<MFOKPI>()
            .HasOne(m => m.KPI)
            .WithMany(k => k.MFOKPIs)
            .HasForeignKey(m => m.KPIId);


        base.OnModelCreating(modelBuilder);

    }
}