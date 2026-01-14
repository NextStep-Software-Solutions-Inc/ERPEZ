using ERPEZ.Domain.Entities.Performance;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class OPCRActivityRatingConfiguration : IEntityTypeConfiguration<OPCRActivityRating>
{
    public void Configure(EntityTypeBuilder<OPCRActivityRating> builder)
    {
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Remarks)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => new { e.OPCRActivityId, e.PerformanceMeasureId });
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.SubmittedDate);
    }
}
