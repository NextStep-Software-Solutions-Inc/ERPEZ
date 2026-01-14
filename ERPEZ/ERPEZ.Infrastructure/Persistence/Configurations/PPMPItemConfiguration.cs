using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class PPMPItemConfiguration : IEntityTypeConfiguration<PPMPItem>
{
    public void Configure(EntityTypeBuilder<PPMPItem> builder)
    {
        builder.Property(e => e.UnitCost)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        builder.Property(e => e.Unit)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.PAPCode)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );
        
        builder.HasIndex(e => e.PPMPId);
        builder.HasIndex(e => e.IsNonCSE);
        builder.HasIndex(e => e.LineItemBudgetDetailId);
    }
}
