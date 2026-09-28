using ERPEZ.Shared.Persistence;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
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
    public DbSet<SubscriptionPlan>? SubscriptionPlans { get; set; }
    public DbSet<SubscriptionPlanPrice>? SubscriptionPlanPrices { get; set; }
    public DbSet<SubscriptionPlanModule>? SubscriptionPlanModules { get; set; }
    public DbSet<Role>? Roles { get; set; }
    public DbSet<Permission>? Permissions { get; set; }
    public DbSet<RolePermission>? RolePermissions { get; set; }
    public DbSet<TenantMemberRoleAssignment>? TenantMemberRoleAssignments { get; set; }
    public DbSet<LicenseKey>? LicenseKeys { get; set; }
    public DbSet<TenantAuditLog>? TenantAuditLogs { get; set; }
    public DbSet<TenantInvoice>? TenantInvoices { get; set; }
    public DbSet<TenantInvoiceItem>? TenantInvoiceItems { get; set; }
    public DbSet<TenantPaymentMethod>? TenantPaymentMethods { get; set; }
    public DbSet<TenantOperationalDatabase>? TenantOperationalDatabases { get; set; }
    public DbSet<WebhookInboxRecord>? WebhookInbox { get; set; }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        EnforceAuditImmutability();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override int SaveChanges()
    {
        EnforceAuditImmutability();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        EnforceAuditImmutability();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        EnforceAuditImmutability();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void EnforceAuditImmutability()
    {
        var invalidEntries = ChangeTracker.Entries<TenantAuditLog>()
            .Where(e => e.State == EntityState.Modified || e.State == EntityState.Deleted);

        if (invalidEntries.Any())
        {
            throw new InvalidOperationException("TenantAuditLog records are append-only and cannot be modified or deleted.");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply default conventions for all entities
        modelBuilder.ConfigureDefaultEntityConventions();

        // Tenant
        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Name)
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .Property(t => t.AuthProvider)
            .HasConversion<string>();

        modelBuilder.Entity<Tenant>()
            .Property(t => t.MembershipProjectionStatus)
            .HasConversion<string>();

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => new { t.AuthProvider, t.ExternalOrgId })
            .IsUnique()
            .HasFilter("\"ExternalOrgId\" IS NOT NULL");

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

        // TenantOperationalDatabase
        modelBuilder.Entity<TenantOperationalDatabase>()
            .HasIndex(tod => tod.TenantId)
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasOne(t => t.OperationalDatabase)
            .WithOne(tod => tod.Tenant)
            .HasForeignKey<TenantOperationalDatabase>(tod => tod.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // TenantSubscription
        modelBuilder.Entity<TenantSubscription>()
            .HasIndex(ts => new { ts.TenantId, ts.StartDate, ts.EndDate })
            .IsUnique();

        modelBuilder.Entity<TenantSubscription>()
            .HasOne(ts => ts.SubscriptionPlanPrice)
            .WithMany(spp => spp.Subscriptions)
            .HasForeignKey(ts => ts.SubscriptionPlanPriceId)
            .OnDelete(DeleteBehavior.SetNull);

        // SubscriptionPlan
        modelBuilder.Entity<SubscriptionPlan>()
            .HasIndex(sp => sp.Code)
            .IsUnique();

        modelBuilder.Entity<SubscriptionPlan>()
            .Property(sp => sp.Tier)
            .HasConversion<string>();

        modelBuilder.Entity<SubscriptionPlan>()
            .HasMany(sp => sp.Prices)
            .WithOne(spp => spp.SubscriptionPlan)
            .HasForeignKey(spp => spp.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SubscriptionPlan>()
            .HasMany(sp => sp.Modules)
            .WithOne(spm => spm.SubscriptionPlan)
            .HasForeignKey(spm => spm.SubscriptionPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // SubscriptionPlanPrice
        modelBuilder.Entity<SubscriptionPlanPrice>()
            .HasIndex(spp => spp.SubscriptionPlanId);

        modelBuilder.Entity<SubscriptionPlanPrice>()
            .HasIndex(spp => spp.SubscriptionPlanId)
            .HasFilter("\"IsDefault\" = true")
            .IsUnique();

        modelBuilder.Entity<SubscriptionPlanPrice>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_SubscriptionPlanPrices_ValidInterval",
                "\"EffectiveToUtc\" IS NULL OR \"EffectiveToUtc\" > \"EffectiveFromUtc\""));

        // SubscriptionPlanModule
        modelBuilder.Entity<SubscriptionPlanModule>()
            .HasIndex(spm => new { spm.SubscriptionPlanId, spm.ModuleCode })
            .IsUnique();

        // TenantMember
        modelBuilder.Entity<TenantMember>()
            .Property(tm => tm.Provider)
            .HasConversion<string>();

        modelBuilder.Entity<TenantMember>()
            .HasIndex(tm => new { tm.TenantId, tm.Provider, tm.ExternalIdentityId })
            .IsUnique()
            .HasFilter("\"ExternalIdentityId\" != '' AND \"IsDeleted\" = false");

        modelBuilder.Entity<TenantMember>()
            .HasIndex(tm => tm.InvitationTokenHash)
            .IsUnique()
            .HasFilter("\"InvitationTokenHash\" IS NOT NULL");

        modelBuilder.Entity<TenantMember>()
            .Property(tm => tm.ConcurrencyStamp)
            .IsConcurrencyToken();

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
            .Property(r => r.Scope)
            .HasDefaultValue(RoleScope.Unknown);

        modelBuilder.Entity<Role>()
            .HasIndex(r => new { r.TenantId, r.NormalizedName })
            .IsUnique()
            .HasFilter("\"TenantId\" IS NOT NULL AND \"IsDeleted\" = false");

        modelBuilder.Entity<Role>()
            .HasIndex(r => new { r.TenantId, r.IsAssignableToTenant, r.IsDeleted });

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

        // TenantAuditLog
        modelBuilder.Entity<TenantAuditLog>()
            .HasOne(al => al.Tenant)
            .WithMany()
            .HasForeignKey(al => al.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TenantAuditLog>()
            .HasIndex(al => new { al.TenantId, al.CreatedAt });

        // TenantInvoice
        modelBuilder.Entity<TenantInvoice>()
            .HasIndex(ti => new { ti.TenantId, ti.InvoiceNumber });

        modelBuilder.Entity<TenantInvoice>()
            .HasIndex(ti => new { ti.TenantId, ti.Status });

        modelBuilder.Entity<TenantInvoice>()
            .HasOne(ti => ti.Tenant)
            .WithMany(t => t.TenantInvoices)
            .HasForeignKey(ti => ti.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TenantInvoice>()
            .HasOne(ti => ti.TenantSubscription)
            .WithMany()
            .HasForeignKey(ti => ti.TenantSubscriptionId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TenantInvoice>()
            .HasMany(ti => ti.Items)
            .WithOne(tii => tii.TenantInvoice)
            .HasForeignKey(tii => tii.TenantInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TenantInvoice>()
            .Property(ti => ti.BillingCycle)
            .HasConversion<string>();

        modelBuilder.Entity<TenantInvoice>()
            .Property(ti => ti.Status)
            .HasConversion<string>();

        // TenantPaymentMethod
        modelBuilder.Entity<TenantPaymentMethod>()
            .HasIndex(pm => new { pm.TenantId, pm.IsDefault });

        modelBuilder.Entity<TenantPaymentMethod>()
            .HasOne(pm => pm.Tenant)
            .WithMany(t => t.TenantPaymentMethods)
            .HasForeignKey(pm => pm.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TenantPaymentMethod>()
            .Property(pm => pm.Type)
            .HasConversion<string>();

        // WebhookInboxRecord
        modelBuilder.Entity<WebhookInboxRecord>(b =>
        {
            b.ToTable("WebhookInbox");
            b.HasKey(w => w.Id);
            b.HasIndex(w => w.SvixMessageId).IsUnique();
            b.HasIndex(w => new { w.Provider, w.ProviderEventId });
            b.HasIndex(w => new { w.Status, w.LeaseExpiresAtUtc });
            b.Property(w => w.Provider).HasConversion<string>();
            b.Property(w => w.Status).HasConversion<string>();
        });

        base.OnModelCreating(modelBuilder);
    }
}
