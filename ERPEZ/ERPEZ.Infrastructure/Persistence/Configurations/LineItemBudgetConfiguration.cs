using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class LineItemBudgetConfiguration : IEntityTypeConfiguration<LineItemBudget>
{
    public void Configure(EntityTypeBuilder<LineItemBudget> builder)
    {
        // Enum to String conversions
        builder.Property(e => e.SourceType)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Scope)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        // String properties
        builder.Property(e => e.LIBNumber)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(e => e.Name)
            .HasMaxLength(500);
        
        // Indexes
        builder.HasIndex(e => e.LIBNumber)
            .IsUnique();
        
        builder.HasIndex(e => e.FiscalYear);
        builder.HasIndex(e => new { e.DeliveryUnitId, e.FiscalYear });
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.ParentLIBId);
        
        // Relationships
        builder.HasOne(e => e.ParentLIB)
            .WithMany(e => e.ChildLIBs)
            .HasForeignKey(e => e.ParentLIBId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
