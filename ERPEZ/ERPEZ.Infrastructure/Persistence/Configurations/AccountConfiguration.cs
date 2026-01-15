using ERPEZ.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.Property(e => e.Name)
            .HasMaxLength(255);

        builder.Property(e => e.Balance)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(e => e.RunningBalance)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        // Composite unique constraint to prevent duplicate accounts
        builder.HasIndex(e => new { e.OfficeId, e.FundSourceId, e.FiscalYearId })
            .IsUnique();

        // Indexes for filtering
        builder.HasIndex(e => e.OfficeId);
        builder.HasIndex(e => e.FundSourceId);
        builder.HasIndex(e => e.FiscalYearId);
        builder.HasIndex(e => e.Balance);

        // Relationships
        builder.HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.FundSource)
            .WithMany()
            .HasForeignKey(e => e.FundSourceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
