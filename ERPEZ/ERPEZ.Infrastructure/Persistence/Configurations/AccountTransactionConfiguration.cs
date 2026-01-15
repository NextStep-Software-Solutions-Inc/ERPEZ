using ERPEZ.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class AccountTransactionConfiguration : IEntityTypeConfiguration<AccountTransaction>
{
    public void Configure(EntityTypeBuilder<AccountTransaction> builder)
    {
        builder.Property(e => e.Purpose)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.AmountTransfer)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.Code)
            .IsRequired();

        builder.Property(e => e.TransactionDate)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        // Indexes for filtering and performance
        builder.HasIndex(e => e.FromAccountId);
        builder.HasIndex(e => e.ToAccountId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.TransactionDate);
        builder.HasIndex(e => e.AuthorizedByUserId);
        builder.HasIndex(e => e.AuthorizedDate);
        builder.HasIndex(e => e.Code);

        // Relationships
        builder.HasOne(e => e.FromAccount)
            .WithMany(a => a.OutgoingTransactions)
            .HasForeignKey(e => e.FromAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ToAccount)
            .WithMany(a => a.IncomingTransactions)
            .HasForeignKey(e => e.ToAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
