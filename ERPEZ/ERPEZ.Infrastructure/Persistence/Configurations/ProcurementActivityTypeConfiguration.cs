using ERPEZ.Domain.Entities.Procurement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class ProcurementActivityTypeConfiguration : IEntityTypeConfiguration<ProcurementActivityType>
{
    public void Configure(EntityTypeBuilder<ProcurementActivityType> builder)
    {
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.Name);
    }
}
