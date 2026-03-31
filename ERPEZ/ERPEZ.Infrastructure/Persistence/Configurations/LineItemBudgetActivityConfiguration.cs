using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class LineItemBudgetActivityConfiguration : IEntityTypeConfiguration<LineItemBudgetActivity>
{
    public void Configure(EntityTypeBuilder<LineItemBudgetActivity> builder)
    {
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.HasIndex(e => e.LineItemBudgetId);
        builder.HasIndex(e => e.WFPObjectiveActivityId);
        builder.HasIndex(e => e.OPCRActivityId);
    }
}
