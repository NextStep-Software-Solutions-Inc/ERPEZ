using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class OPCRActivityRatingConfiguration : IEntityTypeConfiguration<OPCRActivityRating>
{
    public void Configure(EntityTypeBuilder<OPCRActivityRating> builder)
    {
        builder.Property(e => e.Remarks)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => new { e.OPCRActivityId, e.PerformanceMeasureId });
    }
}
