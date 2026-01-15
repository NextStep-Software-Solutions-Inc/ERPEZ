using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class OPCRConfiguration : IEntityTypeConfiguration<OPCR>
{
    public void Configure(EntityTypeBuilder<OPCR> builder)
    {
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.RatingStatus)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(e => e.DeliveryUnitId);
        builder.HasIndex(e => e.FiscalYearId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.RatingStatus);
        builder.HasIndex(e => e.RatingSubmittedDate);
        builder.HasIndex(e => e.RatingReturnedDate);
    }
}
