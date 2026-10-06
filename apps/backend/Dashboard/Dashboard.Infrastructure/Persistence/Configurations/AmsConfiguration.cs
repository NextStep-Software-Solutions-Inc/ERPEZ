using ERPEZ.Domain.Entities.AMS;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class AmsRoleConfiguration : IEntityTypeConfiguration<AmsRole>
{
    public void Configure(EntityTypeBuilder<AmsRole> builder)
    {
        builder.ToTable("AmsRoles");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Description).HasMaxLength(500);
        builder.HasIndex(r => new { r.TenantId, r.Name }).IsUnique();

        builder.HasMany(r => r.Permissions)
            .WithOne(p => p.Role)
            .HasForeignKey(p => p.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.UserAssignments)
            .WithOne(ua => ua.Role)
            .HasForeignKey(ua => ua.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AmsRolePermissionConfiguration : IEntityTypeConfiguration<AmsRolePermission>
{
    public void Configure(EntityTypeBuilder<AmsRolePermission> builder)
    {
        builder.ToTable("AmsRolePermissions");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PermissionKey).IsRequired().HasMaxLength(150);
        builder.HasIndex(p => new { p.TenantId, p.RoleId, p.PermissionKey }).IsUnique();
    }
}

public class UserRoleAssignmentConfiguration : IEntityTypeConfiguration<UserRoleAssignment>
{
    public void Configure(EntityTypeBuilder<UserRoleAssignment> builder)
    {
        builder.ToTable("UserRoleAssignments");
        builder.HasKey(ua => ua.Id);
        builder.HasIndex(ua => new { ua.TenantId, ua.UserId, ua.RoleId }).IsUnique();

        builder.HasOne(ua => ua.User)
            .WithMany(u => u.RoleAssignments)
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AmsLicenseSettingConfiguration : IEntityTypeConfiguration<AmsLicenseSetting>
{
    public void Configure(EntityTypeBuilder<AmsLicenseSetting> builder)
    {
        builder.ToTable("AmsLicenseSettings");
        builder.HasKey(l => l.Id);
        builder.HasIndex(l => l.TenantId).IsUnique();
        builder.Property(l => l.LicenseKey).IsRequired().HasMaxLength(256);
        builder.Property(l => l.Plan).HasMaxLength(50);
        builder.Property(l => l.AllowedDomain).HasMaxLength(200);
        builder.Property(l => l.EnabledModules).HasMaxLength(200);
    }
}
