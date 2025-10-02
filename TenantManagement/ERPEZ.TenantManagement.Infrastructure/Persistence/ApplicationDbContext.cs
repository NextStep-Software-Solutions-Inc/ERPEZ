using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Linq.Expressions;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Module> Modules { get; set; }
    public DbSet<TenantSetting> TenantSettings { get; set; }
    public DbSet<TenantSubscription> TenantSubscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        const string schemaName = "catalog";
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

            //Add query filter for soft deleted (isDeleted = true)
            if (typeof(IEntity).IsAssignableFrom(entity.ClrType)) modelBuilder.Entity(entity.ClrType).HasQueryFilter((Expression<Func<IEntity, bool>>)(e => !e.IsDeleted));
        }

        // Tenant
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => new { t.BillingContactEmail, t.Name })
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.Modules)
            .WithMany(m => m.Tenants)
            .UsingEntity(tm => tm.ToTable("TenantModule"));

        modelBuilder.Entity<Tenant>()
            .HasOne(t => t.TenantSetting)
            .WithOne(ts => ts.Tenant)
            .HasForeignKey<TenantSetting>(ts => ts.TenantId);

        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.TenantSubscriptions)
            .WithOne(ts => ts.Tenant)
            .HasForeignKey(ts => ts.TenantId);

        // Module
        modelBuilder.Entity<Module>()
            .HasIndex(m => m.Name)
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
