using ERPEZ.Domain.Entities.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class UserPINConfiguration : IEntityTypeConfiguration<UserPIN>
{
    public void Configure(EntityTypeBuilder<UserPIN> builder)
    {
        builder.ToTable("UserPINs", "core");

        builder.Property(e => e.UserId)
            .IsRequired();

        builder.Property(e => e.EncryptedPIN)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Salt)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.FailedAttempts)
            .HasDefaultValue(0);

        builder.Property(e => e.IsLocked)
            .HasDefaultValue(false);

        // Unique constraint: One PIN per user
        builder.HasIndex(e => e.UserId)
            .IsUnique();

        // Index for lookups
        builder.HasIndex(e => e.IsLocked);
        builder.HasIndex(e => e.ExpiresAt);
    }
}
