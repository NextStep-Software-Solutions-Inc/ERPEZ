using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class LineItemBudgetDetailConfiguration : IEntityTypeConfiguration<LineItemBudgetDetail>
{
    public void Configure(EntityTypeBuilder<LineItemBudgetDetail> builder)
    {
        builder.Property(e => e.TimelineType)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Budget)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.LineItemBudgetId);
        builder.HasIndex(e => e.LineItemBudgetActivityId);
        builder.HasIndex(e => e.ObjectId);
        builder.HasIndex(e => e.WFPObjectiveTargetExpenditureId);
        builder.HasIndex(e => new { e.StartDate, e.EndDate });
    }
}
