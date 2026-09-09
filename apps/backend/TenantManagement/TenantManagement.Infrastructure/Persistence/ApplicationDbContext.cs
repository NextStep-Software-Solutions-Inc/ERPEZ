using ERPEZ.Shared.Persistence;
using ERPEZ.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Tenant>? Tenants { get; set; }
    public DbSet<TenantMember>? TenantMembers { get; set; }
    public DbSet<Module>? Modules { get; set; }
    public DbSet<TenantSetting>? TenantSettings { get; set; }
    public DbSet<TenantSubscription>? TenantSubscriptions { get; set; }
    public DbSet<Role>? Roles { get; set; }
    public DbSet<Permission>? Permissions { get; set; }
    public DbSet<RolePermission>? RolePermissions { get; set; }
    public DbSet<TenantMemberRoleAssignment>? TenantMemberRoleAssignments { get; set; }
    public DbSet<LicenseKey>? LicenseKeys { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply default conventions for all entities
        modelBuilder.ConfigureDefaultEntityConventions();

        // Tenant
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Name)
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
            .HasIndex(ts => ts.TenantId)
            .IsUnique();

        // TenantSubscription
        modelBuilder.Entity<TenantSubscription>()
            .HasIndex(ts => new { ts.TenantId, ts.StartDate, ts.EndDate })
            .IsUnique();

        // TenantMember
        modelBuilder.Entity<TenantMember>()
            .HasIndex(tm => new { tm.ExternalIdentityId, tm.TenantId })
            .IsUnique();

        modelBuilder.Entity<TenantMember>()
            .HasOne(tm => tm.Tenant)
            .WithMany(t => t.TenantMembers)
            .HasForeignKey(tm => tm.TenantId);

        modelBuilder.Entity<TenantMember>()
            .HasMany(tm => tm.RoleAssignments)
            .WithOne(ra => ra.TenantMember)
            .HasForeignKey(ra => ra.TenantMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        // Persist TenantMember enums as strings
#pragma warning disable CS0618 // Legacy enum mapping for backwards compatibility
        modelBuilder.Entity<TenantMember>()
            .Property(tm => tm.Role)
            .HasConversion<string>();
#pragma warning restore CS0618

        modelBuilder.Entity<TenantMember>()
            .Property(tm => tm.Status)
            .HasConversion<string>();

        // Role
        modelBuilder.Entity<Role>()
            .HasIndex(r => new { r.TenantId, r.NormalizedName })
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasOne(r => r.Tenant)
            .WithMany()
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Role>()
            .HasMany(r => r.RolePermissions)
            .WithOne(rp => rp.Role)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Role>()
            .HasMany(r => r.MemberAssignments)
            .WithOne(ma => ma.Role)
            .HasForeignKey(ma => ma.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Permission
        modelBuilder.Entity<Permission>()
            .HasIndex(p => p.Key)
            .IsUnique();

        modelBuilder.Entity<Permission>()
            .HasMany(p => p.RolePermissions)
            .WithOne(rp => rp.Permission)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // RolePermission composite key
        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        // TenantMemberRoleAssignment composite key
        modelBuilder.Entity<TenantMemberRoleAssignment>()
            .HasKey(ra => new { ra.TenantMemberId, ra.RoleId });

        // LicenseKey
        modelBuilder.Entity<LicenseKey>()
            .HasIndex(lk => lk.Key)
            .IsUnique();

        modelBuilder.Entity<LicenseKey>()
            .HasOne(lk => lk.Tenant)
            .WithMany(t => t.LicenseKeys)
            .HasForeignKey(lk => lk.TenantId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<LicenseKey>()
            .HasOne(lk => lk.TenantSubscription)
            .WithMany()
            .HasForeignKey(lk => lk.TenantSubscriptionId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<LicenseKey>()
            .Property(lk => lk.Plan)
            .HasConversion<string>();

        modelBuilder.Entity<LicenseKey>()
            .Property(lk => lk.Status)
            .HasConversion<string>();

        base.OnModelCreating(modelBuilder);
    }
}
