using ERPEZ.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenant { get; set; }
    public DbSet<TenantModule> TenantModule { get; set; }
    public DbSet<Module> Module { get; set; }
    public DbSet<TenantSettings> TenantSetting { get; set; }
    public DbSet<TenantSubscription> TenantSubscription { get; set; }


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
            .HasForeignKey(tm => tm.TenantId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TenantModule>()
            .HasOne(tm => tm.Module)
            .WithMany(m => m.TenantModules)
            .HasForeignKey(tm => tm.ModuleId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TenantModule>()
            .HasIndex(tm => new { tm.TenantId, tm.ModuleId })
            .IsUnique();

        modelBuilder.Entity<Module>()
            .HasIndex(tm => tm.Name)
            .IsUnique();


        modelBuilder.Entity<TenantSettings>()
            .HasOne(ts => ts.Tenant)
            .WithMany(t => t.TenantSettings)
            .HasForeignKey(ts => ts.TenantId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<TenantSettings>()
            .HasIndex(ts => new { ts.Name, ts.TenantId })
            .IsUnique();

        modelBuilder.Entity<TenantSubscription>()
            .HasOne(ts => ts.Tenant)
            .WithMany(t => t.TenantSubscriptions)
            .HasForeignKey(ts => ts.TenantId)
            .OnDelete(DeleteBehavior.NoAction);

        base.OnModelCreating(modelBuilder);

    }
}