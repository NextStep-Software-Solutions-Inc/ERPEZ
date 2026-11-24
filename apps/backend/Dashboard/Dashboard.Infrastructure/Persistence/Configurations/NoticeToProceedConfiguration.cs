using ERPEZ.Domain.Entities.Procurement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class NoticeToProceedConfiguration : IEntityTypeConfiguration<NoticeToProceed>
{
    public void Configure(EntityTypeBuilder<NoticeToProceed> builder)
    {
        builder.ToTable("NoticeToProceeds", "procurement");
        builder.HasKey(n => n.Id);

        builder.Property(n => n.NTPNumber)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(n => n.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.PlaceOfDelivery)
            .HasMaxLength(1000);

        builder.Property(n => n.Description)
            .HasMaxLength(2000);

        builder.Property(n => n.ContractNumberSnapshot)
            .HasMaxLength(100);

        builder.Property(n => n.AwardedAmountSnapshot)
            .HasPrecision(18, 2);

        builder.Property(n => n.SupplierNameSnapshot)
            .HasMaxLength(255);

        builder.Property(n => n.SupplierAddressSnapshot)
            .HasMaxLength(500);

        builder.Property(n => n.ProjectTitleSnapshot)
            .HasMaxLength(500);

        builder.Property(n => n.IssuedByName)
            .HasMaxLength(255);

        builder.Property(n => n.ReceivedByName)
            .HasMaxLength(255);

        builder.Property(n => n.SignedDocumentFileName)
            .HasMaxLength(255);

        builder.Property(n => n.PhilGEPSReferenceNumber)
            .HasMaxLength(100);

        builder.Property(n => n.CancellationReason)
            .HasMaxLength(4000);

        // Foreign Key relationship to Contract
        builder.HasOne(n => n.Contract)
            .WithMany()
            .HasForeignKey(n => n.ContractId)
            .OnDelete(DeleteBehavior.Restrict);

        // Standard non-unique indexes
        builder.HasIndex(n => n.NTPNumber);
        builder.HasIndex(n => n.ContractId);
        builder.HasIndex(n => n.Status);
    }
}
