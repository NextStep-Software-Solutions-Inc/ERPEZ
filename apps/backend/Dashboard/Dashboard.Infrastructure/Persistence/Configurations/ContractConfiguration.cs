using ERPEZ.Domain.Entities.Procurement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("Contracts", "procurement");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.ContractNumber)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        builder.Property(c => c.SignedContractFileName)
            .HasMaxLength(255);

        builder.Property(c => c.ApprovedByName)
            .HasMaxLength(255);

        builder.Property(c => c.ExecutedByName)
            .HasMaxLength(255);

        builder.Property(c => c.ApprovalRemarks)
            .HasMaxLength(4000);

        builder.Property(c => c.ReturnRemarks)
            .HasMaxLength(4000);

        builder.Property(c => c.LateExecutionJustification)
            .HasMaxLength(4000);

        // Foreign Key relationship to NoticeOfAward
        builder.HasOne(c => c.NoticeOfAward)
            .WithMany()
            .HasForeignKey(c => c.NoticeOfAwardId)
            .OnDelete(DeleteBehavior.Restrict);

        // Standard non-unique indexes (NO filtered unique index per approved plan)
        builder.HasIndex(c => c.ContractNumber);
        builder.HasIndex(c => c.NoticeOfAwardId);
    }
}
