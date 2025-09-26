using ERPEZ.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantModule> TenantModules { get; set; }
    public DbSet<Module> Modules { get; set; }
    public DbSet<TenantSetting> TenantSettings { get; set; }
    public DbSet<TenantSubscription> TenantSubscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        const string schemaName = "catalog";
        modelBuilder.HasDefaultSchema(schemaName);

        // Tenant
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => new { t.BillingContactEmail, t.Name })
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.TenantModules)
            .WithOne(tm => tm.Tenant)
            .HasForeignKey(tm => tm.TenantId);

        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.TenantSettings)
            .WithOne(ts => ts.Tenant)
            .HasForeignKey(ts => ts.TenantId);

        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.TenantSubscriptions)
            .WithOne(ts => ts.Tenant)
            .HasForeignKey(ts => ts.TenantId);

        // Module
        modelBuilder.Entity<Module>()
            .HasIndex(m => m.Name)
            .IsUnique();

        modelBuilder.Entity<Module>()
            .HasMany(m => m.TenantModules)
            .WithOne(tm => tm.Module)
            .HasForeignKey(tm => tm.ModuleId);

        // TenantModule
        modelBuilder.Entity<TenantModule>()
            .HasIndex(tm => new { tm.TenantId, tm.ModuleId })
            .IsUnique();

        // TenantSetting
        modelBuilder.Entity<TenantSetting>()
            .HasIndex(ts => new { ts.Name, ts.TenantId })
            .IsUnique();

        // TenantSubscription
        modelBuilder.Entity<TenantSubscription>()
            .HasIndex(ts => new { ts.TenantId, ts.StartDate, ts.EndDate })
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
