using ERPEZ.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantModule> TenantModules { get; set; }
    public DbSet<Module> Modules { get; set; }
    public DbSet<TenantSetting> TenantSettings { get; set; }
    public DbSet<TenantSubscription> TenantSubscriptions { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        const string schemaName = "catalog";
        //const string planningSchemaName = "planning";
        //const string procurementSchemaName = "procurement";
        //const string samsSchemaName = "sams";

        modelBuilder.HasDefaultSchema(schemaName);

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => new { t.BillingContactEmail, t.Name })
            .IsUnique();

        modelBuilder.Entity<TenantModule>()
            .HasOne(tm => tm.Tenant)
            .WithMany(t => t.TenantModules)
            .HasForeignKey(tm => tm.TenantId);

        modelBuilder.Entity<TenantModule>()
            .HasIndex(tm => new { tm.TenantId, tm.ModuleId })
            .IsUnique();

        modelBuilder.Entity<Module>()
            .HasIndex(tm => tm.Name)
            .IsUnique();

        modelBuilder.Entity<TenantSetting>()
            .HasIndex(ts => new { ts.Name, ts.TenantId })
            .IsUnique();

        modelBuilder.Entity<TenantSubscription>()
            .HasIndex(ts => new { ts.TenantId, ts.StartDate, ts.EndDate })
            .IsUnique();

        base.OnModelCreating(modelBuilder);

    }
}