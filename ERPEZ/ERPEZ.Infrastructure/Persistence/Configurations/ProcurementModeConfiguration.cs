using ERPEZ.Domain.Entities.Procurement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class ProcurementModeConfiguration : IEntityTypeConfiguration<ProcurementMode>
{
    public void Configure(EntityTypeBuilder<ProcurementMode> builder)
    {
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.Name)
            .IsUnique();
    }
}
