using ERPEZ.Domain.Entities.Other;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class APPItemConfiguration : IEntityTypeConfiguration<APPItem>
{
    public void Configure(EntityTypeBuilder<APPItem> builder)
    {
        builder.Property(e => e.PAPCode)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(e => e.Remarks)
            .HasMaxLength(1000);
        
        builder.Property(e => e.ProcurementStrategy)
            .HasMaxLength(1000);
        
        builder.Property(e => e.BidEvaluationCriteria)
            .HasConversion(
                v => v == null ? null : string.Join(',', v),
                v => v == null ? null : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );
        
        builder.HasIndex(e => e.APPId);
        builder.HasIndex(e => e.PPMPItemId);
        builder.HasIndex(e => e.DeliveryUnitId);
        builder.HasIndex(e => e.FundSourceId);
    }
}
