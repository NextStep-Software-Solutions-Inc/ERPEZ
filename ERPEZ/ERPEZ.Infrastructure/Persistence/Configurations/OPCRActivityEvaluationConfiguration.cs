using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class OPCRActivityEvaluationConfiguration : IEntityTypeConfiguration<OPCRActivityEvaluation>
{
    public void Configure(EntityTypeBuilder<OPCRActivityEvaluation> builder)
    {
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Remarks)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.OPCRActivityRatingId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.EvaluatedDate);
    }
}
